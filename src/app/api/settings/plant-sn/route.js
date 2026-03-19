import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = {};

    // Accept plantSN and/or companyName
    if (body.plantSN !== undefined) updates.plantSN = body.plantSN;
    if (body.companyName !== undefined) updates.companyName = body.companyName;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No settings provided" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.id,
      updates,
      { returnDocument: "after" }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ data: { plantSN: user.plantSN, companyName: user.companyName } });
  } catch (error) {
    console.error("POST /api/settings/plant-sn error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
