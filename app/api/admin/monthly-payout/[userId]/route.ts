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

// Helper to find user by ID by paginating through list
async function findUserById(userId: string, authHeader: string) {
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await fetch(
      `https://api.aaradhyadreamcity.in/broker/admin/users?page=${page}&page_size=100`,
      {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const users = data.users || [];
    const found = users.find((u: any) => String(u._id || u.id) === userId);
    if (found) return found;

    if (users.length < 100 || page > 15) {
      hasMore = false;
    } else {
      page++;
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { profile, authHeader, error, status } = await verifyAdmin(req);
  if (error || !profile) {
    return NextResponse.json({ detail: error }, { status: status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  try {
    // 1. Fetch user profile details from backend
    const userDoc = await findUserById(userId, authHeader || "");
    if (!userDoc) {
      return NextResponse.json({ detail: "User not found." }, { status: 404 });
    }

    // 2. Connect to local/shared MongoDB
    const { db } = await connectToDatabase();

    // Check if payout is already approved in DB
    const approvedPayout = await db
      .collection("payouts")
      .findOne({ user_id: userId, month, year });

    const roundVal = (v: number) => Math.round(v * 100) / 100;

    let payoutDetails: any = null;

    if (approvedPayout) {
      payoutDetails = {
        self_sales: roundVal(approvedPayout.self_sales),
        team_sales: roundVal(approvedPayout.team_sales),
        total_amount: roundVal(approvedPayout.total_amount),
        direct_commission: roundVal(approvedPayout.direct_commission),
        team_commission: roundVal(approvedPayout.team_commission),
        total_commission: roundVal(approvedPayout.total_commission),
        reward_amount: roundVal(approvedPayout.reward_amount),
        reward_details: approvedPayout.reward_details || "No rewards details",
        gross_payout: roundVal(approvedPayout.gross_payout),
        tds_percent: approvedPayout.tds_percent || 5,
        tds_amount: roundVal(approvedPayout.tds_amount),
        final_payout: roundVal(approvedPayout.final_payout),
        status: "PAID",
        payment_date: approvedPayout.payment_date,
        approved_by: approvedPayout.approved_by,
        approved_at: approvedPayout.approved_at,
      };
    } else {
      // Unpaid: Fetch report from backend
      const reportRes = await fetch(
        `https://api.aaradhyadreamcity.in/sales/monthly-report?month=${month}&year=${year}&user_id=${userId}`,
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
      const tds_amount = gross_payout * 0.05;
      const final_payout = gross_payout - tds_amount;

      payoutDetails = {
        self_sales: roundVal(self_sales),
        team_sales: roundVal(team_sales),
        total_amount: roundVal(total_amount),
        direct_commission: roundVal(direct_commission),
        team_commission: roundVal(team_commission),
        total_commission: roundVal(total_commission),
        reward_amount: roundVal(reward_amount),
        reward_details,
        gross_payout: roundVal(gross_payout),
        tds_percent: 5,
        tds_amount: roundVal(tds_amount),
        final_payout: roundVal(final_payout),
        status: "UNPAID",
      };
    }

    // 3. Assemble and return the complete payload
    const responsePayload = {
      user: {
        id: userId,
        first_name: userDoc.first_name || "",
        last_name: userDoc.last_name || "",
        phone: userDoc.phone || "",
        email: userDoc.email || "",
        referral_code: userDoc.referral_code || "",
        referred_by: userDoc.referred_by || "—",
        created_at: userDoc.created_at || "",
        level: userDoc.level || 1,
        account_active: userDoc.account_active || false,
      },
      bank: {
        Bank_Name: userDoc.Bank_Name || null,
        Branch_Name: userDoc.Branch_Name || null,
        Account_Number: userDoc.Account_Number || null,
        IFSC_Code: userDoc.IFSC_Code || null,
      },
      payout: payoutDetails,
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error(`GET /api/admin/monthly-payout/${userId} error:`, err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
