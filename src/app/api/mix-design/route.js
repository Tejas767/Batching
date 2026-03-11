import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const toRow = (item) => ({
  grade: item.grade,
  r_san: item.rSan ?? item.r_san ?? null,
  c_san: item.cSan ?? item.c_san ?? null,
  mm20: item.mm20 ?? null,
  mm10: item.mm10 ?? null,
  cem1: item.cem1 ?? null,
  fly_ash: item.flyAsh ?? item.fly_ash ?? null,
  water: item.water ?? null,
  admix1: item.admix1 ?? null,
  admix2: item.admix2 ?? null,
});

export async function GET() {
  const userId = "public_user";

  const db = getDb();
  if (!db) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { rows } = await db.query(
      "SELECT * FROM mix_designs WHERE user_id = $1 ORDER BY grade ASC",
      [userId]
    );
    return Response.json({ data: rows });
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
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return Response.json({ error: "No items provided" }, { status: 400 });
  }

  const query = `
    INSERT INTO mix_designs
      (user_id, grade, r_san, c_san, mm20, mm10, cem1, fly_ash, water, admix1, admix2)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (user_id, grade) DO UPDATE SET
      r_san = excluded.r_san,
      c_san = excluded.c_san,
      mm20 = excluded.mm20,
      mm10 = excluded.mm10,
      cem1 = excluded.cem1,
      fly_ash = excluded.fly_ash,
      water = excluded.water,
      admix1 = excluded.admix1,
      admix2 = excluded.admix2
    RETURNING *;
  `;

  try {
    const saved = [];
    for (const item of items) {
      const row = toRow(item);
      const values = [
        userId,
        row.grade,
        row.r_san,
        row.c_san,
        row.mm20,
        row.mm10,
        row.cem1,
        row.fly_ash,
        row.water,
        row.admix1,
        row.admix2,
      ];
      const { rows: result } = await db.query(query, values);
      saved.push(result[0]);
    }
    return Response.json({ data: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}