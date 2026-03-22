/**
 * /api/history/export — GET (Streaming CSV)
 *
 * Streams CSV data row-by-row using a MongoDB cursor.
 * Never loads all records into RAM — safe for 300,000+ records.
 */
import { connectDB } from "@/lib/mongodb";
import BatchRecord from "@/lib/models/BatchRecord";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function csvEscape(val) {
  const s = (val || "").toString().replace(/"/g, '""');
  return `"${s}"`;
}

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
      const escaped = escapeRegex(search.trim().slice(0, 100));
      const s = { $regex: escaped, $options: "i" };
      query.$or = [
        { docketNo: s }, { customerName: s },
        { site: s }, { grade: s }, { truckNumber: s },
      ];
    }

    // Stream CSV row-by-row — only 1 document in memory at a time
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const header = "Date/Time,Docket No,Customer,Site,Grade,Qty,Truck,Driver,Start Time,Stop Time\n";
        controller.enqueue(encoder.encode(header));

        const cursor = BatchRecord.find(query)
          .select("createdAt docketNo customerName site grade qty truckNumber truckDriver batchStart batchStop")
          .sort({ createdAt: -1 })
          .lean()
          .cursor();

        for await (const r of cursor) {
          const row = [
            csvEscape(new Date(r.createdAt).toLocaleString("en-IN")),
            csvEscape(r.docketNo),
            csvEscape(r.customerName),
            csvEscape(r.site),
            csvEscape(r.grade),
            csvEscape(r.qty),
            csvEscape(r.truckNumber),
            csvEscape(r.truckDriver),
            csvEscape(r.batchStart),
            csvEscape(r.batchStop),
          ].join(",") + "\n";
          controller.enqueue(encoder.encode(row));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Batch_History_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/history/export error:", error);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
