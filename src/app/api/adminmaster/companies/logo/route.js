import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import pool from "@/lib/db_mysql";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

function safeDirectoryName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function detectImageExtension(buffer) {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
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

    const formData = await request.formData();
    const companyId = Number(formData.get("companyId") || 0);
    const logo = formData.get("logo");

    if (!companyId || !(logo instanceof File)) {
      return NextResponse.json(
        { message: "Company and logo are required" },
        { status: 400 },
      );
    }

    if (!logo.size || logo.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { message: "Logo must be smaller than 2 MB" },
        { status: 400 },
      );
    }

    connection = await pool.getConnection();
    const [companies] = await connection.query(
      "SELECT id, slug FROM companies WHERE id = ? LIMIT 1",
      [companyId],
    );
    const company = companies[0];
    const companyDirectory = safeDirectoryName(company?.slug);

    if (!company || !companyDirectory) {
      return NextResponse.json(
        { message: "Company was not found" },
        { status: 404 },
      );
    }

    const buffer = Buffer.from(await logo.arrayBuffer());
    const extension = detectImageExtension(buffer);

    if (!extension) {
      return NextResponse.json(
        { message: "Upload a PNG, JPG or WEBP image" },
        { status: 400 },
      );
    }

    const relativeDirectory = path.join(
      "uploads",
      "company-logos",
      companyDirectory,
    );
    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      relativeDirectory,
    );
    const filename = `logo-${randomUUID()}.${extension}`;
    const publicPath = `/${relativeDirectory.replaceAll(path.sep, "/")}/${filename}`;

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, filename), buffer, {
      flag: "wx",
    });
    await connection.query(
      "UPDATE companies SET logo = ? WHERE id = ? LIMIT 1",
      [publicPath, company.id],
    );

    return NextResponse.json({ logo: publicPath, success: true });
  } catch (error) {
    console.error("Adminmaster company logo upload error:", error);
    return NextResponse.json(
      { message: error.message || "Unable to upload company logo" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
