import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function ensureAcademyViewerTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS academy_video_viewers (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      mobile VARCHAR(50) NOT NULL,
      company VARCHAR(200) DEFAULT NULL,
      country VARCHAR(100) DEFAULT NULL,
      role VARCHAR(150) DEFAULT NULL,
      certification_module_slug VARCHAR(150) DEFAULT NULL,
      certification_enrolled_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_academy_video_viewers_email (email),
      KEY idx_academy_video_viewers_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    ALTER TABLE academy_video_viewers
      ADD COLUMN IF NOT EXISTS company VARCHAR(200) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS role VARCHAR(150) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS certification_module_slug VARCHAR(150) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS certification_enrolled_at TIMESTAMP NULL DEFAULT NULL
  `);
}

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    const name = String(body?.name || "").trim().slice(0, 200);
    const email = String(body?.email || "").trim().toLowerCase().slice(0, 200);
    const mobile = String(body?.mobile || "").trim().slice(0, 50);
    const isCertification = body?.type === "certification";
    const company = String(body?.company || "").trim().slice(0, 200);
    const country = String(body?.country || "").trim().slice(0, 100);
    const role = String(body?.role || "").trim().slice(0, 150);
    const moduleSlug = String(body?.moduleSlug || "").trim().slice(0, 150);

    if (!name || !email || !mobile) {
      return NextResponse.json(
        { message: "Please fill in your name, email and mobile number" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    if (isCertification && (!company || !country || !role || !moduleSlug)) {
      return NextResponse.json(
        { message: "Please complete all certification details" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    await ensureAcademyViewerTable(connection);
    await connection.query(
      `
      INSERT INTO academy_video_viewers (
        name, email, mobile, company, country, role,
        certification_module_slug, certification_enrolled_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        mobile = VALUES(mobile),
        company = COALESCE(VALUES(company), company),
        country = COALESCE(VALUES(country), country),
        role = COALESCE(VALUES(role), role),
        certification_module_slug = COALESCE(
          VALUES(certification_module_slug),
          certification_module_slug
        ),
        certification_enrolled_at = COALESCE(
          VALUES(certification_enrolled_at),
          certification_enrolled_at
        )
      `,
      [
        name,
        email,
        mobile,
        isCertification ? company : null,
        isCertification ? country : null,
        isCertification ? role : null,
        isCertification ? moduleSlug : null,
        isCertification ? new Date() : null,
      ],
    );

    return NextResponse.json({
      status: "success",
      viewer: { name, email, mobile },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 },
      );
    }

    console.error("ACADEMY VIEWER SAVE ERROR:", error);
    return NextResponse.json(
      { message: "Unable to save your details. Please try again." },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}
