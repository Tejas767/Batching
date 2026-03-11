import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ data: null, error: "Not authenticated" }, { status: 401 });
  }

  // Return the data exactly as stored in the JWT payload
  return Response.json({
    data: { id: session.id, email: session.email, name: session.name }
  });
}
