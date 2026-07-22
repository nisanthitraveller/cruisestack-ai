import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

function clean(value) {
  return String(value || "").trim();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    const smtpHost = clean(body.smtpHost);
    const smtpPort = Number(body.smtpPort || 0);
    const smtpUsername = clean(body.smtpUsername);
    const smtpPassword = String(body.smtpPassword || "");
    const fromEmail = clean(body.fromEmail).toLowerCase();
    const fromName = clean(body.fromName);
    const replyToEmail = clean(body.replyToEmail).toLowerCase();
    const isEnabled = body.isEnabled === true || Number(body.isEnabled) === 1;

    if (!companyId) {
      return NextResponse.json({ message: "Company is required" }, { status: 400 });
    }

    if (smtpPort && (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535)) {
      return NextResponse.json(
        { message: "SMTP port must be between 1 and 65535" },
        { status: 400 },
      );
    }

    if (fromEmail && !validEmail(fromEmail)) {
      return NextResponse.json({ message: "From email is invalid" }, { status: 400 });
    }

    if (replyToEmail && !validEmail(replyToEmail)) {
      return NextResponse.json(
        { message: "Reply-to email is invalid" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [companies] = await connection.query(
      "SELECT id FROM companies WHERE id = ? LIMIT 1",
      [companyId],
    );

    if (!companies[0]) {
      await connection.rollback();
      return NextResponse.json({ message: "Company was not found" }, { status: 404 });
    }

    const [configs] = await connection.query(
      `
      SELECT id, smtp_password
      FROM company_email_config
      WHERE company_id = ?
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
      `,
      [companyId],
    );
    const existing = configs[0] || null;
    const passwordToSave = smtpPassword || existing?.smtp_password || "";

    if (
      isEnabled &&
      (!smtpHost || !smtpPort || !smtpUsername || !passwordToSave || !fromEmail)
    ) {
      await connection.rollback();
      return NextResponse.json(
        { message: "Complete all required SMTP fields before enabling tenant SMTP" },
        { status: 400 },
      );
    }

    if (existing) {
      await connection.query(
        `
        UPDATE company_email_config
        SET
          is_enabled = ?,
          smtp_host = ?,
          smtp_port = ?,
          smtp_username = ?,
          smtp_password = ?,
          from_email = ?,
          from_name = ?,
          reply_to_email = ?
        WHERE id = ?
        `,
        [
          isEnabled ? 1 : 0,
          smtpHost || null,
          smtpPort || null,
          smtpUsername || null,
          passwordToSave || null,
          fromEmail || null,
          fromName || null,
          replyToEmail || null,
          existing.id,
        ],
      );
    } else {
      await connection.query(
        `
        INSERT INTO company_email_config
          (company_id, is_enabled, smtp_host, smtp_port, smtp_username,
           smtp_password, from_email, from_name, reply_to_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          companyId,
          isEnabled ? 1 : 0,
          smtpHost || null,
          smtpPort || null,
          smtpUsername || null,
          passwordToSave || null,
          fromEmail || null,
          fromName || null,
          replyToEmail || null,
        ],
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error("Admin master email configuration error:", error);
    return NextResponse.json(
      { message: "Unable to save SMTP configuration" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
