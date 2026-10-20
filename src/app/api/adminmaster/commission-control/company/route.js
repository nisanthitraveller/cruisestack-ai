import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

function tableSafePrefix(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
}

function quoteIdentifier(value) {
  const name = String(value || "");
  if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error("Unsafe tenant table name");
  return `\`${name}\``;
}

export async function GET(request) {
  let connection;

  try {
    const admin = await getAdminMasterFromSession(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Master admin login required" },
        { status: 401 },
      );
    }

    const companyId = Number(new URL(request.url).searchParams.get("companyId") || 0);
    if (!companyId) {
      return NextResponse.json(
        { success: false, message: "A valid companyId is required" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    const [companies] = await connection.query(
      `SELECT
         c.id,
         c.company_name,
         c.slug,
         COALESCE(cs.plan_id, 0) AS subscription_plan_id,
         COALESCE(sp.plan_name, 'No plan assigned') AS plan_name
       FROM companies c
       LEFT JOIN company_subscriptions cs
         ON cs.id = (
           SELECT latest_cs.id
           FROM company_subscriptions latest_cs
           WHERE latest_cs.company_id = c.id
           ORDER BY latest_cs.id DESC
           LIMIT 1
         )
       LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
       WHERE c.id = ?
       LIMIT 1`,
      [companyId],
    );
    const company = companies[0];
    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 },
      );
    }

    const prefix = tableSafePrefix(company.slug);
    const tableName = `${prefix}_agent_commission`;
    if (
      !prefix ||
      !/^[a-z0-9_]+_agent_commission$/.test(tableName) ||
      tableName === "tour_agent_commission" ||
      tableName.endsWith("_tour_agent_commission")
    ) {
      throw new Error("The company commission table is not allowed");
    }

    const [existingTables] = await connection.query(
      `SELECT TABLE_NAME AS table_name
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
       LIMIT 1`,
      [tableName],
    );
    if (!existingTables[0]) {
      return NextResponse.json({
        success: true,
        company,
        tableName,
        rows: [],
        warning: "This company does not have an agent commission table.",
      });
    }

    const [rows] = await connection.query(
      `SELECT
         id,
         tour_agent_id,
         company_id,
         cruiseline_id,
         commission,
         discount,
         markup,
         gmc_discount,
         status,
         ? AS subscription_plan_id
       FROM ${quoteIdentifier(tableName)}
       ORDER BY tour_agent_id ASC, cruiseline_id ASC, id ASC`,
      [Number(company.subscription_plan_id || 0)],
    );

    return NextResponse.json({ success: true, company, tableName, rows });
  } catch (error) {
    console.error("[commission-control/company] unable to load company", error);
    return NextResponse.json(
      { success: false, message: error.message || "Unable to load company commissions" },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}
