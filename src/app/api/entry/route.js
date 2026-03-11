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
      "SELECT * FROM entry_current WHERE user_id = $1 AND id = 1",
      [userId]
    );
    return Response.json({ data: rows[0] || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = "public_user";

  const db = getDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const item = body.item || {};

  const query = `
    INSERT INTO entry_current
      (user_id, id, docket_no, customer_name, site, grade, qty, truck_driver, truck_number, batch_start, batch_stop)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (user_id, id) DO UPDATE SET
      docket_no = excluded.docket_no,
      customer_name = excluded.customer_name,
      site = excluded.site,
      grade = excluded.grade,
      qty = excluded.qty,
      truck_driver = excluded.truck_driver,
      truck_number = excluded.truck_number,
      batch_start = excluded.batch_start,
      batch_stop = excluded.batch_stop
    RETURNING *;
  `;

  try {
    const values = [
      userId,
      1,
      item.docketNo ?? "",
      item.customerName ?? "",
      item.site ?? "",
      item.grade ?? "",
      item.qty ?? "",
      item.truckDriver ?? "",
      item.truckNumber ?? "",
      item.batchStart ?? "",
      item.batchStop ?? "",
    ];
    const { rows } = await db.query(query, values);
    return Response.json({ data: rows[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}