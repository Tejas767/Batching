import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = "public_user";

  const db = getDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { rows } = await db.query(
      "SELECT * FROM batch_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25",
      [userId]
    );
    return Response.json({ data: rows });
  } catch (error) {
    console.error("GET /api/history error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session || !session.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.id;

  const db = getDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const item = body.item || {};

    const query = `
      INSERT INTO batch_history
        (user_id, docket_no, customer_name, site, grade, qty, truck_driver, truck_number, batch_start, batch_stop, mix_design, report_rows, totals)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;

    const values = [
      userId,
      item.docketNo ?? "",
      item.customerName ?? "",
      item.site ?? "",
      item.grade ?? "",
      item.qty ?? "",
      item.truckDriver ?? "",
      item.truckNumber ?? "",
      item.batchStart ?? "",
      item.batchStop ?? "",
      JSON.stringify(item.mixDesign ?? {}),
      JSON.stringify(item.reportRows ?? []),
      JSON.stringify(item.totals ?? {}),
    ];

    const { rows } = await db.query(query, values);
    return Response.json({ data: rows[0] });
  } catch (error) {
    console.error("POST /api/history error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}