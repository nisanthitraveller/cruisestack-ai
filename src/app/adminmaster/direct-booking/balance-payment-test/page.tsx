import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";
import BalancePaymentTestClient from "./BalancePaymentTestClient";
import "../../adminmaster.css";

export const dynamic = "force-dynamic";

export default async function CordeliaBalancePaymentTestPage() {
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
            <Link href="/adminmaster/direct-booking/booking-test">UAT Booking Test</Link>
            <Link
              className="active"
              href="/adminmaster/direct-booking/balance-payment-test"
            >
              UAT Balance Payment
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
              <h1>Cordelia UAT Balance Payment</h1>
              <p>
                Retrieve an existing UAT booking’s live balance and test the
                documented repay_due_amount operation against that same booking.
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
            <BalancePaymentTestClient />
          </section>
        </section>
      </div>
    </main>
  );
}
