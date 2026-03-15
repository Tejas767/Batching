import { connectDB } from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const customers = await Customer.find({ userId: session.id }).sort({ createdAt: -1 });
    return Response.json({ data: customers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { name, defaultSite } = await request.json();

    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    const customer = await Customer.create({
      userId: session.id,
      name,
      defaultSite,
    });

    return Response.json({ data: customer });
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
      await Customer.deleteMany({ userId: session.id });
      return Response.json({ data: { success: true } });
    }

    if (!id) return Response.json({ error: "ID is required" }, { status: 400 });

    await Customer.findOneAndDelete({ _id: id, userId: session.id });
    return Response.json({ data: { success: true } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
