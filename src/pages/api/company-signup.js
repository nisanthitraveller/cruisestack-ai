import pool from "../../lib/db_mysql";

const plans = new Set(["Beginner", "Professional", "Enterprise"]);

const MASTER_PREFIX = "cruisestack_";

const excludedTemplateTables = [
  "cruisestack_logs",
  "cruisestack_migrations",
];

function createSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function tableSafePrefix(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
}

function normalizeDomain(value) {
  if (!value) return null;

  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export default async function handler(req, res) {
  let connection;

  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const {
      companyName,
      domain: rawDomain,
      logo,
      primaryColor,
      secondaryColor,
      supportEmail: rawSupportEmail,
      currency: rawCurrency,
      planType: rawPlanType,
    } = req.body;

    const normalizedCompanyName = companyName?.trim();
    const supportEmail = rawSupportEmail?.trim().toLowerCase();
    const slug = normalizedCompanyName ? createSlug(normalizedCompanyName) : "";
    const tablePrefix = tableSafePrefix(slug);
    const domain = normalizeDomain(rawDomain);
    const planType = plans.has(rawPlanType) ? rawPlanType : "Beginner";
    const currency = rawCurrency?.trim().toUpperCase() || "USD";

    if (!normalizedCompanyName || !slug || !tablePrefix || !supportEmail) {
      return res.status(400).json({
        message: "Company name and support email are required",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `
      SELECT id
      FROM companies
      WHERE slug = ? OR support_email = ? OR (? IS NOT NULL AND domain = ?)
      LIMIT 1
      `,
      [slug, supportEmail, domain, domain]
    );

    if (existing.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        message: "A company with this name, email, or domain already exists",
      });
    }

    const [result] = await connection.query(
      `
      INSERT INTO companies
        (
          company_name,
          slug,
          domain,
          logo,
          primary_color,
          secondary_color,
          support_email,
          currency,
          plan_type,
          status
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        normalizedCompanyName,
        slug,
        domain,
        logo?.trim() || null,
        primaryColor?.trim() || "#003366",
        secondaryColor?.trim() || "#ffffff",
        supportEmail,
        currency,
        planType,
      ]
    );

    const [tables] = await connection.query(
      `SHOW TABLES LIKE '${MASTER_PREFIX}%'`
    );

    const templateTables = tables
      .map((row) => Object.values(row)[0])
      .filter((table) => !excludedTemplateTables.includes(table));

    if (templateTables.length === 0) {
      throw new Error("No cruisestack master template tables found");
    }

    const createdTables = [];

    for (const templateTable of templateTables) {
      const newTable = templateTable.replace(
        MASTER_PREFIX,
        `${tablePrefix}_`
      );

      const createTableSql = `
        CREATE TABLE IF NOT EXISTS \`${newTable}\`
        LIKE \`${templateTable}\`
      `;

      console.log("Creating company table:");
      console.log(createTableSql);

      await connection.query(createTableSql);
      createdTables.push(newTable);
    }
    
      const companyId = result.insertId;
      const agentTable = `${tablePrefix}_agent`;

      const insertAgentSql = `
        INSERT INTO \`${agentTable}\`
          (
            name,
            email,
            password,
            mobile,
            company_name,
            address,
            primary_contact_name,
            gst_number,
            bank_name,
            bank_account_number,
            bank_account_name,
            ifsc_code,
            branch_name,
            logo,
            status,
            type,
            user_id,
            agency_code,
            company_id
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.query(insertAgentSql, [
        normalizedCompanyName,
        supportEmail,
        `${slug}_test`,
        null,
        normalizedCompanyName,
        domain,
        `${slug}_test`,
        null,
        null,
        null,
        null,
        null,
        null,
        logo?.trim() || null,
        1,
        "Admin",
        `${slug}_test`,
        slug,
        companyId,
      ]);

      console.log("Default agent inserted into:", agentTable);

    await connection.commit();

    return res.status(201).json({
      company: {
        id: result.insertId,
        companyName: normalizedCompanyName,
        slug,
        tablePrefix,
        domain,
        logo: logo?.trim() || null,
        primaryColor: primaryColor?.trim() || "#003366",
        secondaryColor: secondaryColor?.trim() || "#ffffff",
        supportEmail,
        currency,
        planType,
        status: 1,
      },
      createdTables,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Company Signup Error:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  } finally {
    if (connection) connection.release();
  }
}