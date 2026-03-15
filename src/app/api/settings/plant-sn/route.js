import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plantSN } = await request.json();

    if (plantSN === undefined) {
      return Response.json({ error: "plantSN is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.id,
      { plantSN },
      { returnDocument: "after" }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ data: { plantSN: user.plantSN } });
  } catch (error) {
    console.error("POST /api/settings/plant-sn error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
