import { connectDB } from "@/lib/mongodb";
import MixDesign from "@/lib/models/MixDesign";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const doc = await MixDesign.findOne({ userId: session.id });
    return Response.json({ data: doc ? doc.design : null });
  } catch (error) {
    console.error("GET /api/mix-design error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const design = body.design;

    if (!design) {
      return Response.json({ error: "No design data provided" }, { status: 400 });
    }

    const doc = await MixDesign.findOneAndUpdate(
      { userId: session.id },
      { design },
      { upsert: true, returnDocument: "after" }
    );

    return Response.json({ data: doc.design });
  } catch (error) {
    console.error("POST /api/mix-design error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}