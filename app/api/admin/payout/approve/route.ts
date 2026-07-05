import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// Helper to verify admin session
async function verifyAdmin(req: NextRequest) {
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
    const role = (profile.role || "").toUpperCase();
    const isAdmin =
      role === "ADMIN" ||
      role === "SUPERADMIN" ||
      profile.admin === true ||
      profile.is_admin === true ||
      profile.super_admin === true ||
      profile.is_super_admin === true;

    if (!isAdmin) {
      return { error: "Permission denied. Admin privilege required.", status: 403 };
    }

    return { profile, authHeader };
  } catch (err: any) {
    return { error: "Authentication service unavailable.", status: 500 };
  }
}

export async function POST(req: NextRequest) {
  const { profile: adminProfile, authHeader, error, status } = await verifyAdmin(req);
  if (error || !adminProfile) {
    return NextResponse.json({ detail: error }, { status: status || 401 });
  }

  try {
    const body = await req.json();
    const { user_id, month, year } = body;

    if (!user_id || !month || !year) {
      return NextResponse.json(
        { detail: "Missing required fields: user_id, month, year." },
        { status: 400 }
      );
    }

    const userIdStr = String(user_id);
    const monthNum = Number(month);
    const yearNum = Number(year);

    const { db } = await connectToDatabase();

    // Check 1: Duplicate prevention (pre-approval check)
    const existingPayout = await db
      .collection("payouts")
      .findOne({ user_id: userIdStr, month: monthNum, year: yearNum });
    if (existingPayout) {
      return NextResponse.json(
        { detail: "Payout for this user and month already exists." },
        { status: 409 }
      );
    }

    // Check 2: Fetch monthly report to check if it exists/is finalized and compute fields
    const reportRes = await fetch(
      `https://api.aaradhyadreamcity.in/sales/monthly-report?month=${monthNum}&year=${yearNum}&user_id=${userIdStr}`,
      {
        headers: { Authorization: authHeader || "" },
        cache: "no-store",
      }
    );

    if (!reportRes.ok) {
      return NextResponse.json(
        { detail: "Monthly report not generated yet for this user." },
        { status: 400 }
      );
    }

    const report = await reportRes.json();

    const self_sales = Number(report.direct_sale || 0);
    const team_sales = Number(report.team_sale || 0);
    const total_amount = self_sales + team_sales;

    const direct_commission = Number(report.total_direct_commission || 0);
    const team_commission = Number(report.total_indirect_commission || 0);
    const total_commission = direct_commission + team_commission;
    const reward_amount = Number(report.total_rewards || 0);

    const formattedRewards = report.rewards || [];
    const reward_details = formattedRewards.length > 0
      ? formattedRewards.map((r: any) => `Level ${r.level || "N/A"} Bonus: ₹${r.amount}`).join(", ")
      : "No rewards details";

    const gross_payout = total_commission + reward_amount;
    const tds_percent = 5;
    const tds_amount = gross_payout * 0.05;
    const final_payout = gross_payout - tds_amount;

    // Check 3: Ensure final payout is not negative
    if (final_payout < 0) {
      return NextResponse.json(
        { detail: "Invalid payout amount. Please review commission data." },
        { status: 400 }
      );
    }

    // Rounding to 2 decimal places using round-half-up
    const roundVal = (v: number) => Math.round(v * 100) / 100;

    const adminName = `${adminProfile.first_name || ""} ${adminProfile.last_name || ""}`.trim() || "Admin";
    const nowISO = new Date().toISOString();

    const payoutDoc = {
      user_id: userIdStr,
      month: monthNum,
      year: yearNum,
      payment_date: nowISO,
      status: "PAID",
      self_sales: roundVal(self_sales),
      team_sales: roundVal(team_sales),
      total_amount: roundVal(total_amount),
      direct_commission: roundVal(direct_commission),
      team_commission: roundVal(team_commission),
      total_commission: roundVal(total_commission),
      reward_amount: roundVal(reward_amount),
      reward_details,
      gross_payout: roundVal(gross_payout),
      tds_percent,
      tds_amount: roundVal(tds_amount),
      final_payout: roundVal(final_payout),
      approved_by: adminName,
      approved_at: nowISO,
    };

    // Insert approved payout document
    const result = await db.collection("payouts").insertOne(payoutDoc);

    return NextResponse.json({
      success: true,
      message: "Payout approved successfully.",
      payout_id: String(result.insertedId),
    });
  } catch (err: any) {
    console.error("POST /api/admin/payout/approve error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
