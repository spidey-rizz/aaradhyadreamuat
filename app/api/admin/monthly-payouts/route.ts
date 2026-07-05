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

export async function GET(req: NextRequest) {
  const { profile, authHeader, error, status } = await verifyAdmin(req);
  if (error || !profile) {
    return NextResponse.json({ detail: error }, { status: status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  
  const filterPhone = searchParams.get("phone")?.trim();
  const filterEmail = searchParams.get("email")?.trim()?.toLowerCase();
  const filterName = searchParams.get("name")?.trim()?.toLowerCase();
  const filterStatus = searchParams.get("status")?.trim()?.toUpperCase(); // PAID or UNPAID
  const filterActive = searchParams.get("account_active"); // "true" or "false"

  try {
    // 1. Fetch all users from the backend
    let allUsers: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const usersRes = await fetch(
        `https://api.aaradhyadreamcity.in/broker/admin/users?page=${page}&page_size=100`,
        {
          headers: { Authorization: authHeader || "" },
          cache: "no-store",
        }
      );

      if (!usersRes.ok) break;

      const data = await usersRes.json();
      const users = data.users || [];
      allUsers = [...allUsers, ...users];

      if (users.length < 100 || page > 15) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Filter out admins and superadmins, leaving only brokers/associates
    let associates = allUsers.filter(u => {
      const role = (u.role || "").toUpperCase();
      const isUserAdmin =
        role === "ADMIN" ||
        role === "SUPERADMIN" ||
        u.admin === true ||
        u.is_admin === true ||
        u.super_admin === true ||
        u.is_super_admin === true;
      return !isUserAdmin;
    });

    // Apply pre-fetch text filters to reduce backend API calls
    if (filterPhone) {
      associates = associates.filter(u => u.phone && u.phone.includes(filterPhone));
    }
    if (filterEmail) {
      associates = associates.filter(u => u.email && u.email.toLowerCase().includes(filterEmail));
    }
    if (filterName) {
      associates = associates.filter(u => {
        const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        return fullName.includes(filterName);
      });
    }

    // 2. Connect to local/shared MongoDB
    const { db } = await connectToDatabase();

    // Fetch all approved payouts for this month and year
    const approvedPayouts = await db
      .collection("payouts")
      .find({ month, year })
      .toArray();

    const approvedMap = new Map(approvedPayouts.map(p => [String(p.user_id), p]));

    // 3. For each associate, load from database if approved (PAID), or fetch report from backend (UNPAID)
    const payoutRecords = await Promise.all(
      associates.map(async (u) => {
        const userId = String(u._id || u.id);
        const approvedPayout = approvedMap.get(userId);

        if (approvedPayout) {
          // Round monetary values to 2 decimals
          const roundVal = (v: any) => (v !== undefined ? Math.round(Number(v) * 100) / 100 : 0);
          return {
            user_id: userId,
            first_name: u.first_name,
            last_name: u.last_name,
            phone: u.phone,
            email: u.email,
            level: approvedPayout.level || u.level || 1,
            account_active: approvedPayout.account_active !== undefined ? approvedPayout.account_active : u.account_active,
            self_sales: roundVal(approvedPayout.self_sales),
            team_sales: roundVal(approvedPayout.team_sales),
            total_amount: roundVal(approvedPayout.total_amount),
            direct_commission: roundVal(approvedPayout.direct_commission),
            team_commission: roundVal(approvedPayout.team_commission),
            total_commission: roundVal(approvedPayout.total_commission),
            reward_amount: roundVal(approvedPayout.reward_amount),
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
          // Unpaid: Fetch monthly report from backend
          try {
            const reportRes = await fetch(
              `https://api.aaradhyadreamcity.in/sales/monthly-report?month=${month}&year=${year}&user_id=${userId}`,
              {
                headers: { Authorization: authHeader || "" },
                cache: "no-store",
              }
            );

            if (!reportRes.ok) {
              throw new Error("Report fetch failed");
            }

            const report = await reportRes.json();
            const self_sales = Number(report.direct_sale || 0);
            const team_sales = Number(report.team_sale || 0);
            const total_amount = self_sales + team_sales;

            const direct_commission = Number(report.total_direct_commission || 0);
            const team_commission = Number(report.total_indirect_commission || 0);
            const total_commission = direct_commission + team_commission;
            const reward_amount = Number(report.total_rewards || 0);

            const gross_payout = total_commission + reward_amount;
            const tds_amount = gross_payout * 0.05;
            const final_payout = gross_payout - tds_amount;

            const roundVal = (v: number) => Math.round(v * 100) / 100;

            return {
              user_id: userId,
              first_name: u.first_name,
              last_name: u.last_name,
              phone: u.phone,
              email: u.email,
              level: u.level || 1,
              account_active: report.account_active !== undefined ? report.account_active : u.account_active,
              self_sales: roundVal(self_sales),
              team_sales: roundVal(team_sales),
              total_amount: roundVal(total_amount),
              direct_commission: roundVal(direct_commission),
              team_commission: roundVal(team_commission),
              total_commission: roundVal(total_commission),
              reward_amount: roundVal(reward_amount),
              gross_payout: roundVal(gross_payout),
              tds_percent: 5,
              tds_amount: roundVal(tds_amount),
              final_payout: roundVal(final_payout),
              status: "UNPAID",
            };
          } catch (err) {
            // Fallback if report failed
            return {
              user_id: userId,
              first_name: u.first_name,
              last_name: u.last_name,
              phone: u.phone,
              email: u.email,
              level: u.level || 1,
              account_active: u.account_active || false,
              self_sales: 0,
              team_sales: 0,
              total_amount: 0,
              direct_commission: 0,
              team_commission: 0,
              total_commission: 0,
              reward_amount: 0,
              gross_payout: 0,
              tds_percent: 5,
              tds_amount: 0,
              final_payout: 0,
              status: "UNPAID",
              error: "Monthly report not generated yet for this user.",
            };
          }
        }
      })
    );

    // 4. Apply status and account_active filters
    let filteredRecords = payoutRecords;
    if (filterStatus) {
      filteredRecords = filteredRecords.filter(r => r.status === filterStatus);
    }
    if (filterActive !== null && filterActive !== undefined && filterActive !== "") {
      const activeBool = filterActive === "true";
      filteredRecords = filteredRecords.filter(r => r.account_active === activeBool);
    }

    return NextResponse.json(filteredRecords);
  } catch (err: any) {
    console.error("GET /api/admin/monthly-payouts error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
