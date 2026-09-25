import nodemailer from "nodemailer";
import pool from "../../lib/db_mysql";

// Keep in sync with the options in src/app/contact-us/ContactForm.tsx
const CATEGORIES = [
  "General Enquiry",
  "Sales & Pricing",
  "Product Demo",
  "Partnerships",
  "Technical Support",
  "Other",
];

const MAX_MESSAGE_LENGTH = 5000;

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

async function ensureContactEnquiryTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS contact_enquiry (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      name varchar(200) NOT NULL,
      email varchar(200) NOT NULL,
      phone varchar(50) DEFAULT NULL,
      category varchar(100) NOT NULL,
      message text NOT NULL,
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

  const name = String(req.body?.name || "").trim().slice(0, 200);
  const email = String(req.body?.email || "").trim().slice(0, 200);
  const phone = String(req.body?.phone || "").trim().slice(0, 50);
  const category = String(req.body?.category || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !category || !message) {
    return res.status(400).json({
      message: "Please fill in all required fields",
      status: "failure",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
      status: "failure",
    });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: "Please select a message category",
      status: "failure",
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      message: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters`,
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
    to: "sr@getmycruise.com,tanisha.bajaj@getmycruise.com",
    cc: "sudipkv@gmail.com",
    subject: `New CruiseStack Contact Message: ${category}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">New Contact Us Message</h2>
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
            <td style="font-weight: 700;">Mobile</td>
            <td>${escapeHtml(phone || "Not provided")}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Category</td>
            <td>${escapeHtml(category)}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; vertical-align: top;">Message</td>
            <td style="white-space: pre-wrap;">${escapeHtml(message)}</td>
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
    await ensureContactEnquiryTable(connection);

    const [insertResult] = await connection.query(
      `
      INSERT INTO contact_enquiry
        (name, email, phone, category, message, email_sent)
      VALUES
        (?, ?, ?, ?, ?, 0)
      `,
      [name, email, phone || null, category, message],
    );

    await transporter.sendMail(mailOptions);

    await connection.query(
      `
      UPDATE contact_enquiry
      SET email_sent = 1
      WHERE id = ?
      `,
      [insertResult.insertId],
    );

    return res.status(200).json({
      message: "Message sent successfully",
      status: "success",
    });
  } catch (error) {
    console.error("CONTACT EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Unable to send your message. Please try again.",
      status: "failure",
    });
  } finally {
    if (connection) connection.release();
  }
}
