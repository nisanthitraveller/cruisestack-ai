import pool from "../../lib/db_mysql";

const plans = new Set(["Beginner", "Professional", "Enterprise"]);

function createSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function normalizeDomain(value) {
  if (!value) {
    return null;
  }

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
      planType: rawPlanType
    } = req.body;

    const normalizedCompanyName = companyName?.trim();
    const supportEmail = rawSupportEmail?.trim().toLowerCase();
    const slug = normalizedCompanyName ? createSlug(normalizedCompanyName) : "";
    const domain = normalizeDomain(rawDomain);
    const planType = plans.has(rawPlanType) ? rawPlanType : "Beginner";
    const currency = rawCurrency?.trim().toUpperCase() || "USD";

    if (!normalizedCompanyName || !slug || !supportEmail) {
      return res.status(400).json({
        message: "Company name and support email are required"
      });
    }

    connection = await pool.getConnection();

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
      return res.status(409).json({
        message: "A company with this name, email, or domain already exists"
      });
    }

    const [result] = await connection.query(
      `
      INSERT INTO companies
        (company_name, slug, domain, logo, primary_color, secondary_color, support_email, currency, plan_type, status)
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
        planType
      ]
    );

    return res.status(201).json({
      company: {
        id: result.insertId,
        companyName: normalizedCompanyName,
        slug,
        domain,
        logo: logo?.trim() || null,
        primaryColor: primaryColor?.trim() || "#003366",
        secondaryColor: secondaryColor?.trim() || "#ffffff",
        supportEmail,
        currency,
        planType,
        status: 1
      }
    });
  } catch (error) {
    console.error("Company Signup Error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  } finally {
    if (connection) connection.release();
  }
}
