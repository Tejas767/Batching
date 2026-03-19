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

export const dynamic = "force-dynamic";

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

    // ── Pagination params ──────────────────────────
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const MAX_LIMIT = 300000;
    const requestedLimit = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));
    const skip = (page - 1) * limit;

    const query = { userId: session.id };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   query.createdAt.$lte = new Date(to + "T23:59:59.999Z");
    }

    if (search) {
      const s = { $regex: search, $options: "i" };
      query.$or = [
        { docketNo: s },
        { customerName: s },
        { site: s },
        { grade: s },
        { truckNumber: s },
      ];
    }

    // Count total matching records
    const hasFilters = !!(from || to || search);
    const total = hasFilters
      ? await BatchRecord.countDocuments(query)
      : await BatchRecord.countDocuments({ userId: session.id });

    const records = await BatchRecord
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

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
      mixDesign:    r.mixDesign,
      reportRows:   r.reportRows,
      rows:         r.reportRows,
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
    console.error("GET /api/history error:", error.message);
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

    const record = await BatchRecord.create({
      userId:       session.id,
      username:     session.username,
      docketNo:     item.docketNo     ?? "",
      customerName: item.customerName ?? "",
      site:         item.site         ?? "",
      grade:        item.grade        ?? "",
      qty:          item.qty          ?? "",
      truckDriver:  item.truckDriver  ?? "",
      truckNumber:  item.truckNumber  ?? "",
      batchStart:   item.batchStart   ?? "",
      batchStop:    item.batchStop    ?? "",
      plantSN:      item.plantSN      ?? "",
      companyName:  item.companyName  ?? "",
      mixDesign:    item.mixDesign    ?? {},
      reportRows:   item.reportRows   ?? item.rows ?? [],
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
    console.error("POST /api/history error:", error.message);
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
      const result = await BatchRecord.deleteMany(filter);
      return Response.json({ data: { deleted: result.deletedCount } });
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
    console.error("DELETE /api/history error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}