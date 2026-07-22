import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanHeader(value) {
  return String(value || "").replace(/[\r\n"]/g, "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request) {
  let connection;

  try {
    const admin = await getAdminMasterFromSession(request);

    if (!admin) {
      return NextResponse.json(
        { message: "Master admin login required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const companyId = Number(body.companyId || 0);
    const toEmail = String(body.toEmail || "").trim().toLowerCase();

    if (!companyId || !validEmail(toEmail)) {
      return NextResponse.json(
        { message: "Select a company and enter a valid recipient email" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      `
      SELECT
        c.company_name,
        c.slug,
        ec.smtp_host,
        ec.smtp_port,
        ec.smtp_username,
        ec.smtp_password,
        ec.from_email,
        ec.from_name,
        ec.reply_to_email
      FROM companies c
      INNER JOIN company_email_config ec
        ON ec.id = (
          SELECT email_config.id
          FROM company_email_config email_config
          WHERE email_config.company_id = c.id
          ORDER BY email_config.updated_at DESC, email_config.id DESC
          LIMIT 1
        )
      WHERE c.id = ?
      LIMIT 1
      `,
      [companyId],
    );
    const config = rows[0];

    if (
      !config?.smtp_host ||
      !config?.smtp_port ||
      !config?.smtp_username ||
      !config?.smtp_password ||
      !config?.from_email
    ) {
      return NextResponse.json(
        { message: "Save complete SMTP details before sending a test email" },
        { status: 400 },
      );
    }

    const smtpPort = Number(config.smtp_port);
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
    });
    const fromName = cleanHeader(config.from_name || config.company_name || config.slug);
    const fromEmail = cleanHeader(config.from_email);
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;

    await transporter.sendMail({
      from,
      to: toEmail,
      replyTo: config.reply_to_email || undefined,
      subject: `SMTP test email from ${fromName || config.slug}`,
      text: `This is a test email for the ${config.company_name || config.slug} tenant. The SMTP configuration is working correctly.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2 style="margin-bottom:8px">SMTP configuration test</h2>
          <p>This test email was sent successfully using the saved SMTP configuration for <strong>${escapeHtml(config.company_name || config.slug)}</strong>.</p>
          <p>No customer email flow was triggered.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin master SMTP test error:", error);
    const smtpMessage =
      error && typeof error === "object" && "code" in error
        ? `SMTP test failed (${String(error.code)})`
        : "Unable to send the SMTP test email";

    return NextResponse.json({ message: smtpMessage }, { status: 502 });
  } finally {
    if (connection) connection.release();
  }
}
