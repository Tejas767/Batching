import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/lib/models/Vehicle";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const vehicles = await Vehicle.find({ userId: session.id }).sort({ createdAt: -1 });
    return Response.json({ data: vehicles });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { truckNumber, driverName } = await request.json();

    if (!truckNumber) return Response.json({ error: "Truck number is required" }, { status: 400 });

    const vehicle = await Vehicle.create({
      userId: session.id,
      truckNumber,
      driverName,
    });

    return Response.json({ data: vehicle });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      await Vehicle.deleteMany({ userId: session.id });
      return Response.json({ data: { success: true } });
    }

    if (!id) return Response.json({ error: "ID is required" }, { status: 400 });

    await Vehicle.findOneAndDelete({ _id: id, userId: session.id });
    return Response.json({ data: { success: true } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
