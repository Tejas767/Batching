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

// ── GET: fetch history ────────────────────────────────────────
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

    const records = await BatchRecord
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
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
      mixDesign:    r.mixDesign,
      reportRows:   r.reportRows,
      totals:       r.totals,
    }));

    return Response.json({ data });
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
      mixDesign:    item.mixDesign    ?? {},
      reportRows:   item.reportRows   ?? item.rows ?? [],
      totals:       item.totals       ?? {},
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

// ── DELETE: remove a specific record ─────────────────────────
export async function DELETE(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    // Only allow deleting own records (unless admin)
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