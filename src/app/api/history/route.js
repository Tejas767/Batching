/**
 * /api/history — GET + POST + DELETE
 *
 * GET    → fetch batch history for current user from MongoDB
 * POST   → save a new batch record to MongoDB
 * DELETE → delete a specific record by id (?id=xxx)
 */
import { connectDB } from "@/lib/mongodb";
import BatchRecord from "@/lib/models/BatchRecord";
import { getSession } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// ── Helpers ────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function truncate(val, max = 200) {
  if (!val) return "";
  return String(val).slice(0, max);
}

// ── GET: fetch history (paginated) ─────────────────────────────
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const from   = searchParams.get("from");
    const to     = searchParams.get("to");
    const search = searchParams.get("search");

    // ── Pagination params (capped at 200 to prevent OOM) ──
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const MAX_LIMIT = 200;
    const requestedLimit = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;

    // Cast to ObjectId — aggregate() doesn't auto-cast like find()
    const query = { userId: new mongoose.Types.ObjectId(session.id) };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   query.createdAt.$lte = new Date(to + "T23:59:59.999Z");
    }

    if (search) {
      // Escape regex special chars to prevent ReDoS attacks
      const escaped = escapeRegex(search.trim().slice(0, 100));
      const s = { $regex: escaped, $options: "i" };
      query.$or = [
        { docketNo: s },
        { customerName: s },
        { site: s },
        { grade: s },
        { truckNumber: s },
      ];
    }

    // ── Single DB round-trip using $facet ──────────────────
    const [result] = await BatchRecord.aggregate([
      { $match: query },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          records: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            // Field projection — only return what the frontend needs
            {
              $project: {
                createdAt: 1, docketNo: 1, customerName: 1,
                site: 1, grade: 1, qty: 1, truckNumber: 1,
                truckDriver: 1, batchStart: 1, batchStop: 1,
                plantSN: 1, companyName: 1, orderNo: 1,
                mixDesign: 1, differences: 1, batchSize: 1,
                totals: 1, setWeights: 1, totalBatches: 1,
              },
            },
          ],
        },
      },
    ]);

    const total = result.metadata[0]?.total ?? 0;
    const records = result.records;

    // Normalize to match existing frontend shape
    const data = records.map((r) => ({
      id:           r._id,
      created_at:   r.createdAt,
      docketNo:     r.docketNo,
      customerName: r.customerName,
      site:         r.site,
      grade:        r.grade,
      qty:          r.qty,
      truckDriver:  r.truckDriver,
      truckNumber:  r.truckNumber,
      batchStart:   r.batchStart,
      batchStop:    r.batchStop,
      plantSN:      r.plantSN,
      companyName:  r.companyName,
      orderNo:      r.orderNo,
      mixDesign:    r.mixDesign,
      differences:  r.differences,
      batchSize:    r.batchSize,
      totals:       r.totals,
      setWeights:   r.setWeights,
      totalBatches: r.totalBatches,
    }));

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/history error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: save a batch record ─────────────────────────────────
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await request.json();
    const item = body.item || body;

    // Server-side string validation — cap field lengths to prevent storage bloat
    const record = await BatchRecord.create({
      userId:       session.id,
      username:     truncate(session.username, 50),
      docketNo:     truncate(item.docketNo, 50),
      customerName: truncate(item.customerName, 100),
      site:         truncate(item.site, 100),
      grade:        truncate(item.grade, 20),
      qty:          truncate(item.qty, 20),
      truckDriver:  truncate(item.truckDriver, 100),
      truckNumber:  truncate(item.truckNumber, 50),
      batchStart:   truncate(item.batchStart, 30),
      batchStop:    truncate(item.batchStop, 30),
      plantSN:      truncate(item.plantSN, 50),
      companyName:  truncate(item.companyName, 100),
      orderNo:      truncate(item.orderNo, 50),
      mixDesign:    item.mixDesign    ?? {},
      differences:  item.differences  ?? {},
      batchSize:    Number(item.batchSize) || 0.5,
      // reportRows are NOT stored — reconstructed client-side via useReportData
      totals:       item.totals       ?? {},
      setWeights:   item.setWeights   ?? {},
      totalBatches: item.totalBatches ?? 0,
    });

    return Response.json({
      data: {
        id:         record._id,
        created_at: record.createdAt,
        docketNo:   record.docketNo,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.docketNo) {
      return Response.json(
        { error: `Docket number ${error.keyValue.docketNo} already exists!` },
        { status: 409 }
      );
    }
    console.error("POST /api/history error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE: remove one record OR all records ──────────────────
export async function DELETE(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id      = searchParams.get("id");
    const all     = searchParams.get("all") === "true";

    if (all) {
      const filter = session.role === "admin" ? {} : { userId: session.id };
      // Safe batch deletion — process 500 records at a time to prevent timeouts
      let totalDeleted = 0;
      let batchResult;
      do {
        const ids = await BatchRecord.find(filter).select("_id").limit(500).lean();
        if (ids.length === 0) break;
        batchResult = await BatchRecord.deleteMany({ _id: { $in: ids.map(d => d._id) } });
        totalDeleted += batchResult.deletedCount;
      } while (batchResult && batchResult.deletedCount === 500);
      return Response.json({ data: { deleted: totalDeleted } });
    }

    if (!id) {
      return Response.json({ error: "id or all=true is required" }, { status: 400 });
    }

    const filter = { _id: id };
    if (session.role !== "admin") filter.userId = session.id;

    const result = await BatchRecord.findOneAndDelete(filter);

    if (!result) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    return Response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}