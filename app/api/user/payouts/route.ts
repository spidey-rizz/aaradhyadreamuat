import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// Helper to verify user session
async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: "Missing Authorization header.", status: 401 };
  }

  try {
    const res = await fetch("https://api.aaradhyadreamcity.in/broker/me", {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { error: "Invalid or expired token.", status: res.status };
    }

    const profile = await res.json();
    return { profile };
  } catch (err: any) {
    return { error: "Authentication service unavailable.", status: 500 };
  }
}

export async function GET(req: NextRequest) {
  const { profile, error, status } = await verifyAuth(req);
  if (error || !profile) {
    return NextResponse.json({ detail: error }, { status: status || 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const userId = String(profile._id || profile.id);

    // Retrieve approved payouts for the user, sorted by year and month descending
    const payouts = await db
      .collection("payouts")
      .find({ user_id: userId })
      .sort({ year: -1, month: -1 })
      .toArray();

    // Map _id to string for JSON serialization
    const serializedPayouts = payouts.map(p => ({
      ...p,
      _id: String(p._id),
    }));

    return NextResponse.json(serializedPayouts);
  } catch (err: any) {
    console.error("GET /api/user/payouts error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
