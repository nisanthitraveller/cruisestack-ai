import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import pool from "@/lib/db_mysql";
import { getAppOrigin } from "@/lib/appUrl";

const ACADEMY_EMAIL_DIR = path.join(process.cwd(), "src", "emails", "academy");

const ACADEMY_EMAIL_IMAGES = [
  { filename: "cruise-academy-logo.png", cid: "academy-logo@cruisestack" },
  { filename: "aerticket-logo.png", cid: "aerticket-logo@cruisestack" },
  { filename: "cruisestack-footer-logo.png", cid: "footer-logo@cruisestack" },
  {
    filename: "academy-signature-logo.png",
    cid: "academy-signature-logo@cruisestack",
  },
];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function academyRecipientEmail({ isCertification, learningUrl }) {
  const templateName = isCertification
    ? "cruisestack-academy-confirmation-email.html"
    : "cruisestack-academy-signup-email.html";
  const template = await readFile(
    path.join(ACADEMY_EMAIL_DIR, templateName),
    "utf8",
  );
  const replacements = {
    "{{academy_logo_url}}": "cid:academy-logo@cruisestack",
    "{{aerticket_logo_url}}": "cid:aerticket-logo@cruisestack",
    "{{footer_logo_url}}": "cid:footer-logo@cruisestack",
    "{{academy_signature_logo_url}}": "cid:academy-signature-logo@cruisestack",
    "{{learning_url}}": learningUrl,
    "{{evaluation_url}}": learningUrl,
  };

  return Object.entries(replacements).reduce(
    (html, [placeholder, value]) => html.replaceAll(placeholder, value),
    template,
  );
}

function academyEmailAttachments() {
  return ACADEMY_EMAIL_IMAGES.map(({ filename, cid }) => ({
    filename,
    path: path.join(ACADEMY_EMAIL_DIR, filename),
    cid,
  }));
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
    const name = String(body?.name || "")
      .trim()
      .slice(0, 200);
    const email = String(body?.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 200);
    const mobile = String(body?.mobile || "")
      .trim()
      .slice(0, 50);
    const isCertification = body?.type === "certification";
    const company = String(body?.company || "")
      .trim()
      .slice(0, 200);
    const country = String(body?.country || "")
      .trim()
      .slice(0, 100);
    const role = String(body?.role || "")
      .trim()
      .slice(0, 150);
    const moduleSlug = String(body?.moduleSlug || "")
      .trim()
      .slice(0, 150);

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

    const transporter = nodemailer.createTransport({
      host: process.env.AWS_SES_HOST,
      port: Number(process.env.AWS_SES_PORT),
      secure: false,
      auth: {
        user: process.env.AWS_SES_USER,
        pass: process.env.AWS_SES_PASSWORD,
      },
    });
    const submittedAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
    const formType = isCertification
      ? "Certification Enrolment"
      : "Video Access Request";
    const additionalDetails = isCertification
      ? `
          <tr><td style="font-weight: 700;">Company</td><td>${escapeHtml(company)}</td></tr>
          <tr><td style="font-weight: 700;">Country</td><td>${escapeHtml(country)}</td></tr>
          <tr><td style="font-weight: 700;">Role</td><td>${escapeHtml(role)}</td></tr>
          <tr><td style="font-weight: 700;">Module</td><td>${escapeHtml(moduleSlug)}</td></tr>
        `
      : "";

    const appOrigin = getAppOrigin(request);
    const learningUrl = isCertification
      ? `${appOrigin}/academy/${encodeURIComponent(moduleSlug)}?certification=success#certification`
      : `${appOrigin}/academy`;
    const recipientHtml = await academyRecipientEmail({
      isCertification,
      learningUrl,
    });

    await transporter.sendMail({
      from: process.env.AWS_SES_FROM,
      to: email,
      subject: isCertification
        ? "Your cruisestack.ai Academy enrolment is confirmed"
        : "Welcome to cruisestack.ai Academy",
      text: isCertification
        ? `Your cruisestack.ai Academy certification enrolment is confirmed. Start your evaluation: ${learningUrl}`
        : `Your cruisestack.ai Academy sign-up was successful. Start learning: ${learningUrl}`,
      html: recipientHtml,
      attachments: academyEmailAttachments(),
      bcc: ["nisanth.kumar@getmycruise.com", "hello@getmycruise.com"],
    });

    await transporter.sendMail({
      from: process.env.AWS_SES_FROM,
      to: "nisanth.kumar@getmycruise.com",
      replyTo: email,
      subject: `New CruiseStack Academy ${formType}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2 style="margin: 0 0 16px;">New CruiseStack Academy ${escapeHtml(formType)}</h2>
          <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
            <tr><td style="font-weight: 700;">Name</td><td>${escapeHtml(name)}</td></tr>
            <tr><td style="font-weight: 700;">Email</td><td>${escapeHtml(email)}</td></tr>
            <tr><td style="font-weight: 700;">Mobile</td><td>${escapeHtml(mobile)}</td></tr>
            ${additionalDetails}
            <tr><td style="font-weight: 700;">Submitted at</td><td>${escapeHtml(submittedAt)}</td></tr>
          </table>
        </div>
      `,
    });

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
