import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import BookingTestClient from "./BookingTestClient";
import "../../adminmaster.css";

export const dynamic = "force-dynamic";

export default async function AdminMasterBookingTestPage() {
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
          <nav className="adminmaster-nav" aria-label="Master admin navigation">
            <Link href="/adminmaster/subscriptions">Manual payments</Link>
            <Link href="/adminmaster/online-payment">Online payments</Link>
            <Link href="/adminmaster/commission-control">Commission Control</Link>
            <Link href="/adminmaster/companies">Companies</Link>
            <Link href="/adminmaster/subscription-plans">Subscription plans</Link>
            <Link href="/adminmaster/billing-usage">Billing usage</Link>
            <Link href="/adminmaster/email-config">Email configuration</Link>
            <Link href="/adminmaster/direct-booking">Direct booking</Link>
            <Link className="active" href="/adminmaster/direct-booking/booking-test">
              Cordelia UAT Console
            </Link>
            <form action="/api/adminmaster/logout" method="post">
              <button type="submit">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="adminmaster-content">
          <header className="adminmaster-header">
            <div>
              <p className="adminmaster-kicker">Isolated supplier test</p>
              <h1>Cordelia UAT Test Console</h1>
              <p>
                Test authentication, wallet access, availability, pricing,
                controlled UAT booking, and existing-booking balance payment.
              </p>
            </div>
            <div className="adminmaster-header-actions">
              <span className="adminmaster-user">
                Logged in as {admin.name || admin.email}
              </span>
              <Link className="adminmaster-refresh" href="/adminmaster/direct-booking">
                Back to integrations
              </Link>
            </div>
          </header>

          <section className="adminmaster-panel isolated-booking-panel">
            <BookingTestClient />
          </section>
        </section>
      </div>
    </main>
  );
}
