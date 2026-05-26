import nodemailer from "nodemailer";
import pool from "../../lib/db_mysql";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

async function ensureDemoEnquiryTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS demo_enquiry (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      name varchar(200) NOT NULL,
      email varchar(200) NOT NULL,
      phone varchar(50) DEFAULT NULL,
      source varchar(100) DEFAULT 'bookdemo',
      email_sent tinyint(1) NOT NULL DEFAULT 0,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY email (email),
      KEY created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export default async function handler(req, res) {
  let connection;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const phone = String(req.body?.phone || "").trim();
  const source = "bookdemo";

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required",
      status: "failure",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
      status: "failure",
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.AWS_SES_HOST,
    port: parseInt(process.env.AWS_SES_PORT, 10),
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

  const mailOptions = {
    from: process.env.AWS_SES_FROM,
    to: "sudipkv@gmail.com",
    subject: "New CruiseStack Book Demo Request",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">New Book Demo Request</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="font-weight: 700;">Name</td>
            <td>${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Email</td>
            <td>${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Phone</td>
            <td>${escapeHtml(phone || "Not provided")}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Submitted at</td>
            <td>${escapeHtml(submittedAt)}</td>
          </tr>
        </table>
      </div>
    `,
    replyTo: email,
  };

  try {
    connection = await pool.getConnection();
    await ensureDemoEnquiryTable(connection);

    const [insertResult] = await connection.query(
      `
      INSERT INTO demo_enquiry
        (name, email, phone, source, email_sent)
      VALUES
        (?, ?, ?, ?, 0)
      `,
      [name, email, phone || null, source],
    );

    await transporter.sendMail(mailOptions);

    await connection.query(
      `
      UPDATE demo_enquiry
      SET email_sent = 1
      WHERE id = ?
      `,
      [insertResult.insertId],
    );

    return res.status(200).json({
      message: "Demo request sent successfully",
      status: "success",
    });
  } catch (error) {
    console.error("DEMO EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Unable to send demo request",
      status: "failure",
    });
  } finally {
    if (connection) connection.release();
  }
}
