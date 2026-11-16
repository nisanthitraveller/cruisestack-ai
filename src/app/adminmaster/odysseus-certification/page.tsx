import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import OdysseusCertificationClient from "./OdysseusCertificationClient";
import "../adminmaster.css";
import "./odysseus-certification.css";

export const dynamic = "force-dynamic";

export default async function OdysseusCertificationPage() {
  const admin = await getAdminMasterFromSession(await cookies());
  if (!admin) redirect("/adminmaster/login");

  return (
    <main className="adminmaster-page">
      <div className="adminmaster-shell">
        <aside className="adminmaster-sidebar">
          <div className="adminmaster-brand">
            <span>CruiseStack</span>
            <strong>Master Admin</strong>
          </div>
          <nav className="adminmaster-nav" aria-label="Certification navigation">
            <Link href="/adminmaster">Master Admin home</Link>
            <Link className="active" href="/adminmaster/odysseus-certification">
              Odysseus certification
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content ody-page-content">
          <header className="adminmaster-header ody-page-header">
            <div>
              <p className="adminmaster-kicker">Cruise-line API testing</p>
              <h1>Odysseus Certification Console</h1>
              <p>
                Test any supported cruise line against the Odysseus sandbox,
                inspect each request and response, and download certification
                evidence.
              </p>
            </div>
            <div className="ody-environment">
              <span>Environment</span>
              <strong>Sandbox</strong>
              <small>Logged in as {admin.name || admin.email}</small>
            </div>
          </header>

          <OdysseusCertificationClient />
        </section>
      </div>
    </main>
  );
}
