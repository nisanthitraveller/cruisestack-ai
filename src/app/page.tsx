import React from 'react';
import type { Metadata } from "next";
import './style.css'; // Adjust this path based on where you save the CSS file
import heroImg from '../assets/hero.webp'
import ftrImg from '../assets/ftr.png'
import lg1 from "../assets/1-Carnival.svg";
import lg2 from "../assets/2-RCL.svg";
import lg3 from "../assets/3-Celebrity.svg";
import lg4 from "../assets/4-Cordelia.svg";
import lg5 from "../assets/5-MSC.svg";
import lg6 from "../assets/6-Norwegian.svg";
import lg7 from "../assets/7-Holland.svg";
import lg8 from "../assets/8-Princess.svg";
import lg9 from "../assets/9-Costa.svg";
import lg10 from "../assets/10-RWC.svg";
import lg11 from "../assets/11-Windstar.svg";
import lg12 from "../assets/12-Seabourn.svg";
import lg13 from "../assets/13-Disney.svg";
import lg14 from "../assets/14-Crystal.svg";
import lg15 from "../assets/15-Ponant.svg";
import lg16 from "../assets/16-Cunard.svg";
import lg17 from "../assets/17-Oceania.svg";
import lg18 from "../assets/18-Fred Olsen.svg";
import lg19 from "../assets/19-Azamara.svg";
import lg20 from "../assets/20-Viking.svg";
import lg21 from "../assets/21-Silversea.svg";
import lg22 from "../assets/22-Star Cruise.svg";
import lg23 from "../assets/23-Emerald.svg";
import lg24 from "../assets/24-Avalon.svg";
import lg25 from "../assets/25-Uniworld.svg";
import lg26 from "../assets/26-Celestyal.svg";
import lg27 from "../assets/27-AMA.svg";
import lg28 from "../assets/28-Virgin.svg";
import lg29 from "../assets/29-Croisi.svg";
import lg30 from "../assets/emerald-cruises.svg";
import logoMain from "../assets/logo.png";
import logoft from "../assets/logo-white.png";
import Image from 'next/image';
import Link from "next/link";
import logoone from "../assets/aerticket.png";
import logtwo from "../assets/Satguru.png";
import logthree from "../assets/toptraveltrip.png";
import logofour from "../assets/travelwings.png";
import logofive from "../assets/travtips.png";
import logosix from "../assets/kesari.png";
import logoseven from "../assets/sotc.png";
import logoeight from "../assets/triploft.png";
import logonine from "../assets/thomascook.png";
import backerTechstars from "../assets/techstars-logo-vector.png";
import backerInflection from "../assets/inflection.png";
import backerAh from "../assets/ah-venture.png";
import backerDigital from "../assets/digital-futurists.png";
import cruisestackLogo from "../assets/cs-logo-reverse.svg";
import shipImg from "../assets/book.webp";
import brandHeroImg from "../assets/hero-r.png";
import agencyImg from "../assets/solutions.webp";
import otaImg from "../assets/Company.webp";
import operatorImg from "../assets/mission.png";
import isoBadge from "../assets/iso.png";
import gdprBadge from "../assets/gdpr.webp";
import soc2Badge from "../assets/aicpa.png";
import awsBadge from "../assets/sws.svg.webp";
import { Caveat } from "next/font/google";
import Footer from '@/components/Footer/footer';
import Header from '@/components/Header/header';

const iconProps = { width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const featureGroups = [
  {
    title: "Search & Inventory",
    desc: "Give your team and customers access to live cruise availability and pricing.",
    icon: <svg {...iconProps}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.5-4.5" /></svg>,
    items: ["Real-time Inventory", "Instant Quotes", "Smart Search", "Live Pricing"],
  },
  {
    title: "Booking & Payments",
    desc: "Turn cruise searches into secure, seamless bookings from one platform.",
    icon: <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3M15.5 15h1.5" /></svg>,
    items: ["Secure Bookings", "Cabin Blocking", "Online Payments", "Booking Management"],
  },
  {
    title: "Operations & CRM",
    desc: "Manage customers, leads, quotations and after-sales operations efficiently.",
    icon: <svg {...iconProps}><circle cx="12" cy="8" r="3" /><path d="M6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M5.5 11.5a2.2 2.2 0 1 1 0-4.4M3 17c0-2 1-3.3 2.5-3.8M18.5 11.5a2.2 2.2 0 1 0 0-4.4M21 17c0-2-1-3.3-2.5-3.8" /></svg>,
    items: ["Leads CRM", "PDF Quotations", "Back Office", "Customer Management"],
  },
  {
    title: "Automation & Analytics",
    desc: "Automate repetitive work and understand what\u2019s driving your business.",
    icon: <svg {...iconProps}><rect x="4" y="13" width="3.5" height="7" rx="1" /><rect x="10.25" y="9" width="3.5" height="11" rx="1" /><rect x="16.5" y="4" width="3.5" height="16" rx="1" /></svg>,
    items: ["Reports & Analytics", "Workflow Automation", "Performance Tracking", "Business Insights"],
  },
];

const burst = (
  <svg className="hiw-burst" width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <path d="M6 16 2 13M11 10l-1.5-5M18 11l3-4M21 17l5-1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const shipThumb = (
  <span className="hiw-thumb">
    <Image src={shipImg} alt="" fill sizes="120px" style={{ objectFit: "cover", objectPosition: "62% 62%" }} />
  </span>
);

const howSteps = [
  {
    title: "Search & Explore",
    desc: "Access a wide range of cruise inventory from global cruise lines with real-time availability, fares and rich content.",
    art: (
      <div className="hiw-laptop">
        <div className="hiw-laptop-screen">
          <div className="hiw-search">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.4" /><path d="m20 20-4.5-4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            Search Cruises
          </div>
          <div className="hiw-row">
            {shipThumb}
            <div className="hiw-lines"><i /><i /><i className="short" /></div>
          </div>
        </div>
        <div className="hiw-laptop-base" />
      </div>
    ),
  },
  {
    title: "Plan & Customize",
    desc: "Compare options, create itineraries, and customize packages to match your customer\u2019s needs.",
    art: (
      <div className="hiw-window">
        <div className="hiw-window-bar"><i /><i /><i /></div>
        <div className="hiw-row">
          {shipThumb}
          <div className="hiw-lines"><i /><i className="short" /><i /><i className="short" /></div>
        </div>
        <span className="hiw-btn">Add to Quote</span>
        {burst}
      </div>
    ),
  },
  {
    title: "Quote & Book",
    desc: "Generate professional quotes, book with confidence and manage the entire process in one place.",
    art: (
      <div className="hiw-panel">
        <strong>Create Quote</strong>
        {[
          <path key="bed" d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M6.5 11.5h.01" />,
          <path key="plane" d="M10 20l2-7-6 1.5L4 12l8-2 3-6h2l-1 6 5 1v2l-5 1-1 6z" />,
          <path key="shield" d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Zm-3 8.5 2 2 4-4" />,
        ].map((path) => (
          <div className="hiw-panel-row" key={path.key}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
            <div className="hiw-lines"><i /><i className="short" /></div>
          </div>
        ))}
        <svg className="hiw-cursor" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6 1.5 3.5 6.5-2.5 1.3-3.5-6.6L6 18z" fill="#0a1f44" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" /></svg>
        {burst}
      </div>
    ),
  },
  {
    title: "Deliver & Grow",
    desc: "Provide an exceptional customer experience with built-in tools and support \u2014 and unlock new revenue opportunities.",
    art: (
      <div className="hiw-panel hiw-chart">
        <strong>Grow Your Business</strong>
        <div className="hiw-bars"><i /><i /><i /><i /><i /></div>
        <span className="hiw-grow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    ),
  },
];

const scriptFont = Caveat({ subsets: ["latin"], weight: ["600"] });

const wlIcon = { width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const whiteLabelFeatures = [
  {
    title: "Your Branding",
    desc: "Fully customizable with your logo, colors and domain.",
    icon: <svg {...wlIcon}><path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20z" /><circle cx="8" cy="8" r="1.5" /></svg>,
  },
  {
    title: "Comprehensive Content",
    desc: "Access global cruise inventory, fares, images and rich content via API or white-label.",
    icon: <svg {...wlIcon}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12.5 9 5 9-5M3 16.5l9 5 9-5" /></svg>,
  },
  {
    title: "Flexible Integration",
    desc: "Use our robust APIs to integrate cruise search, pricing, booking and post-booking services.",
    icon: <svg {...wlIcon}><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" /></svg>,
  },
  {
    title: "Scalable for Growth",
    desc: "Built to support travel agencies, OTAs, tour operators and enterprises of any size.",
    icon: <svg {...wlIcon}><path d="M5 20v-6M10 20V10M15 20v-8M20 20V5" strokeWidth="2.6" /></svg>,
  },
];

const wlPillIcon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const bfIcon = { width: 34, height: 34, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const bfBadge = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const builtFor = [
  {
    title: "Travel Agencies",
    desc: "Streamline your cruise sales, access real-time inventory and manage your customers with ease.",
    img: agencyImg,
    pos: "50% 55%",
    icon: <svg {...bfIcon}><path d="M4 9.5V20h16V9.5M3 5h18l-1 4.5a2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0L3 5ZM9.5 20v-5h5v5" /></svg>,
  },
  {
    title: "OTAs",
    desc: "Integrate cruise content, fares and booking capabilities to expand your travel offerings.",
    img: otaImg,
    pos: "60% 60%",
    icon: <svg {...bfIcon}><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>,
  },
  {
    title: "Tour Operators",
    desc: "Create and manage cruise packages, group bookings and custom itineraries \u2014 all in one place.",
    img: operatorImg,
    pos: "55% 60%",
    icon: <svg {...bfIcon}><circle cx="12" cy="8" r="3" /><path d="M6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M5.5 11.5a2.2 2.2 0 1 1 0-4.4M3 17c0-2 1-3.3 2.5-3.8M18.5 11.5a2.2 2.2 0 1 0 0-4.4M21 17c0-2-1-3.3-2.5-3.8" /></svg>,
  },
  {
    title: "Enterprise",
    desc: "A robust, scalable platform with flexible integrations and dedicated support for larger organizations.",
    img: shipImg,
    pos: "40% 60%",
    icon: <svg {...bfIcon}><path d="M4 21V5.5L12 3v18M12 8h8v13M2.5 21h19M7 8v.01M7 11.5v.01M7 15v.01M15.5 12v.01M15.5 15.5v.01" /></svg>,
    badges: [
      { label: "Scalable", icon: <svg {...bfBadge}><path d="M5 20v-6M10 20V10M15 20v-8M20 20V5" /></svg> },
      { label: "Secure", icon: <svg {...bfBadge}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Zm-3 8.5 2 2 4-4" /></svg> },
      { label: "Reliable", icon: <svg {...bfBadge}><path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.5A4 4 0 0 1 17 18z" /></svg> },
      { label: "Global Coverage", icon: <svg {...bfBadge}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></svg> },
    ],
  },
];

const secIcon = { width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const secPillIcon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const securityFeatures = [
  {
    title: "Enterprise-Grade Security",
    desc: "Industry best practices, regular audits and proactive threat monitoring.",
    icon: <svg {...secIcon}><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Zm-3 8.5 2 2 4-4" /></svg>,
  },
  {
    title: "Global Infrastructure",
    desc: "Hosted on reliable, scalable cloud infrastructure for high availability and performance.",
    icon: <svg {...secIcon}><path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.5A4 4 0 0 1 17 18z" /></svg>,
  },
  {
    title: "Data Privacy",
    desc: "Your data is encrypted in transit and at rest, with strict access controls.",
    icon: <svg {...secIcon}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" /></svg>,
  },
  {
    title: "Compliance Ready",
    desc: "Built to support global privacy and data protection standards.",
    icon: <svg {...secIcon}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6" /></svg>,
  },
  {
    title: "High Availability",
    desc: "Designed for 99.9% uptime to keep your business running smoothly.",
    icon: <svg {...secIcon}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  },
  {
    title: "Trusted by Industry",
    desc: "Powering travel businesses worldwide with a secure and reliable platform.",
    icon: <svg {...secIcon}><circle cx="12" cy="8" r="3" /><path d="M6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M5.5 11.5a2.2 2.2 0 1 1 0-4.4M3 17c0-2 1-3.3 2.5-3.8M18.5 11.5a2.2 2.2 0 1 0 0-4.4M21 17c0-2-1-3.3-2.5-3.8" /></svg>,
  },
];

const complianceBadges = [
  { title: "ISO 27001", sub: "Best practices", img: isoBadge, pad: true },
  { title: "GDPR", sub: "Data protection", img: gdprBadge },
  { title: "SOC 2", sub: "Security controls", img: soc2Badge },
  { title: "AWS", sub: "Global infrastructure", img: awsBadge, pad: true },
  {
    title: "Ongoing Monitoring",
    sub: "& Audits",
    badge: (
      <svg viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="46" fill="#fff" />
        <path d="M48 16 24 26v17c0 16 10 27 24 33 14-6 24-17 24-33V26z" fill="none" stroke="#1f9d55" strokeWidth="5" strokeLinejoin="round" />
        <path d="m37 46 8 8 15-16" fill="none" stroke="#1f9d55" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export const metadata: Metadata = {
  title: "cruisestack - all-in-one cruise booking & management platform",
  description: "Power your cruise business with live inventory, instant quotes, and secure bookings across 30+ cruise lines. Built for travel agencies, OTAs & enterprises."
};

export default function CruiseCommercePage() {

  const sectionStyle = {
    backgroundImage: `url(${heroImg.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
  };
const ftrimgsect = {
    backgroundImage: `url(${ftrImg.src})`,
    backgroundSize: 'cover',
    
  };
  return (
    <div className="cruise-page-body">
      
      {/* ───── NAV ───── */}
     <Header/>

      {/* ───── HERO ───── */}
      <section className="hero" style={sectionStyle}>
      <div className='container-hero'>
        <div className="hero-content">
          <span className="hero-badge">All-in-one AI Cruise Booking Engine </span>

          <h1>AI operating system for next generation cruise businesses</h1>
          <p>Search, sell, book, and manage cruises from one intelligent platform - powered by live inventory, automation, and AI.</p>
          <div className="hero-btns">
            <Link href="/bookdemo" className="btn-primary">Book a Demo</Link>
            <Link href="/pricing" className="btn-outline" style={{ padding: '11px 28px', fontSize: '15px' }}>View Pricing</Link>
            
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="num">30+</span><span className="label">Cruise Lines</span></div>
            <div className="stat"><span className="num">500+</span><span className="label">Travel Partners</span></div>
            <div className="stat"><span className="num">99.9%</span><span className="label">Uptime</span></div>
            <div className="stat"><span className="num">1K+</span><span className="label">Bookings Processed</span></div>
          </div>
        </div>

        <div className="hero-right">
          {/* Search card */}
          {/* <div className="search-card">
            <h3>Search Cruises</h3>
            <div className="form-field">
              <label>Destination</label>
              <select><option>Any Destination</option><option>Caribbean</option><option>Mediterranean</option><option>Alaska</option></select>
            </div>
            <div className="form-field">
              <label>Sailing Date</label>
              <select><option>Any Date</option><option>June 2026</option><option>July 2026</option></select>
            </div>
            <div className="form-field">
              <label>Duration</label>
              <select><option>Any Duration</option><option>3–5 Nights</option><option>7 Nights</option><option>10+ Nights</option></select>
            </div>
            <div className="form-field">
              <label>Guests</label>
              <select><option>2 Adults</option><option>1 Adult</option><option>2 Adults + 1 Child</option></select>
            </div>
            <button className="btn-primary">Search Cruises</button>
          </div> */}

          {/* Deal card */}
          {/* <div className="deal-card">
            <div className="deal-info">
              <div className="deal-label">Today&apos;s Top Deal</div>
              <div className="deal-title">7 Night Western Caribbean from Miami, USA</div>
              <div className="deal-price">US$ 699 <span>/pp</span></div>
              <div className="deal-link">View Details</div>
            </div>
            <div className="deal-img">
              <img src="https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=144&q=80" alt="cruise ship" />
            </div>
          </div> */}
        </div></div>
      </section>

      {/* ───── TRUST BAR ───── */}
      <section className="trust-bar">
        <p>TRUSTED BY TRAVEL BUSINESSES WORLDWIDE</p>
        <div className="trust-logos container">
           <span className="trust-logo">
            <Image src={logonine} alt="Thomas Cook" width={180} />
          </span>
          <span className="trust-logo script">
            <Image src={logoone} alt="Aerticket" width={180} />
          </span>
          <span className="trust-logo blue">
             <Image src={logtwo} alt="Satguru" width={180} />
          </span>
          <span className="trust-logo">
            <Image src={logthree} alt="Top Travel Trip" width={180} />
          </span>
          <span className="trust-logo green">
            <Image src={logofour} alt="Travelwings" width={180} />
          </span>
          <span className="trust-logo">
            <Image src={logofive} alt="Travtips" width={180} />
          </span>
           <span className="trust-logo">
            <Image src={logosix} alt="Kesari" width={60} />
          </span>
           <span className="trust-logo">
            <Image src={logoseven} alt="SOTC" width={180} />
          </span>
           <span className="trust-logo">
            <Image src={logoeight} alt="Triploft" width={60} />
          </span>
          
         
        </div>
      </section>

      {/* ───── FEATURES (old, kept for reference) ─────
      <section className="features">
        <div className="section-header">
          <h2>Everything you need to sell cruises, effortlessly</h2>
          <p>Built for travel agencies, OTAs, and enterprises to grow, automate and scale.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon">📡</div>
            <h4>Real-time Inventory</h4>
            <p>Access live availability from 30+ cruise lines.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">💬</div>
            <h4>Instant Quotes</h4>
            <p>Get accurate pricing and availability in seconds.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">🔒</div>
            <h4>Secure Bookings</h4>
            <p>Accept online-direct payments online.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">🛏</div>
            <h4>Cabin Blocking</h4>
            <p>Hold cabins with real-time blocking & management.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">📄</div>
            <h4>PDF Quotations</h4>
            <p>Create branded, professional PDF quotes instantly.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">👥</div>
            <h4>Leads CRM</h4>
            <p>Manage leads and follow-ups from one dashboard.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">⚙️</div>
            <h4>Ops & Back Office</h4>
            <p>End-to-end booking ops and after-sales support.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon">📊</div>
            <h4>Reports & Analytics</h4>
            <p>Track performance and grow your business.</p>
          </div>
        </div>
      </section>
      */}

      {/* ───── FEATURES ───── */}
      <section className="fx">
        <div className="fx-header">
          <span className="fx-eyebrow">One platform. <span>From search to settlement.</span></span>
          <h2>Everything You Need to Sell Cruises, Effortlessly</h2>
          <p>From live inventory and instant pricing to bookings, operations and analytics — CruiseStack brings your entire cruise commerce workflow together.</p>
        </div>
        <div className="fx-grid">
          {featureGroups.map((group) => (
            <div className="fx-card" key={group.title}>
              <div className="fx-card-head">
                <div className="fx-icon">{group.icon}</div>
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.desc}</p>
                </div>
              </div>
              <ul className="fx-list">
                {group.items.map((item) => (
                  <li key={item}>
                    <span className="fx-check" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="fx-footnote">Designed for travel agencies, OTAs, tour operators and enterprise cruise businesses.</p>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="hiw">
        <div className="hiw-header">
          <span className="hiw-eyebrow">How it works</span>
          <h2>How CruiseStack Works</h2>
          <p>From search to sale, CruiseStack gives you the tools, content and support you need — all in one platform.</p>
        </div>
        <ol className="hiw-steps">
          {howSteps.map((step, i) => (
            <li className="hiw-step" key={step.title}>
              <span className="hiw-num">{i + 1}</span>
              <div className="hiw-art" aria-hidden="true">{step.art}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </li>
          ))}
        </ol>
        <div className="hiw-cta">
          <Link href="/bookdemo" className="hiw-cta-btn">
            Book a Demo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <p>See how CruiseStack can work for your business.</p>
        </div>
      </section>

      {/* ───── WHITE-LABEL & API ───── */}
      <section className="wl">
        <div className="wl-inner">
          <div className="wl-copy">
            <span className="wl-eyebrow">White-label &amp; API</span>
            <h2>Your Brand. Our Technology.</h2>
            <p className="wl-lead">
              Launch and grow your cruise business with CruiseStack&apos;s white-label platform or powerful APIs. Deliver a seamless booking experience under your own brand, with full flexibility and control.
            </p>
            <ul className="wl-features">
              {whiteLabelFeatures.map((f) => (
                <li key={f.title}>
                  <span className="wl-ficon">{f.icon}</span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/bookdemo" className="wl-btn">
              Talk to Our Team
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>

          <div className="wl-visual" aria-hidden="true">
            <div className="wl-diagram">
              <svg className="wl-links" viewBox="0 0 800 625" preserveAspectRatio="none">
                <g stroke="#006cea" strokeWidth="1.6" strokeDasharray="4 5" fill="none" vectorEffect="non-scaling-stroke">
                  <path d="M318 44 C362 50 386 76 382 104" vectorEffect="non-scaling-stroke" />
                  <path d="M670 98 C674 150 632 172 572 170" vectorEffect="non-scaling-stroke" />
                  <path d="M266 508 C266 522 258 532 246 540" vectorEffect="non-scaling-stroke" />
                  <path d="M444 508 C446 544 470 568 512 570" vectorEffect="non-scaling-stroke" />
                </g>
                <g fill="#006cea">
                  <circle cx="382" cy="104" r="3.5" /><circle cx="670" cy="98" r="3.5" /><circle cx="572" cy="170" r="3.5" />
                  <circle cx="266" cy="508" r="3.5" /><circle cx="444" cy="508" r="3.5" /><circle cx="512" cy="570" r="3.5" />
                </g>
              </svg>

              <div className="wl-pill wl-at-domain">
                <span className="wl-pill-icon"><svg {...wlPillIcon}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></svg></span>
                <div><strong>Your Domain</strong><span>www.yourbrand.com</span></div>
              </div>
              <div className="wl-pill wl-at-branding">
                <span className="wl-pill-icon"><svg {...wlPillIcon}><path d="M20 4 10 14M9 15.5c-2 0-4 1.2-4 3.5 0 .5-.5 1-1 1 1.3 1 2.7 1 4 1 2.3 0 3.5-1.8 3.5-3.5z" /></svg></span>
                <div><strong>Your Branding</strong><span>Logo, colors, style</span></div>
              </div>

              <div className="wl-browser">
                <div className="wl-browser-bar"><i /><i /><i /></div>
                <div className="wl-site-nav">
                  <span className="wl-site-logo">
                    <svg width="26" height="14" viewBox="0 0 26 14" fill="none"><path d="M1 6c3-4 6-4 8 0s5 4 8 0 6-4 8 0M1 11c3-4 6-4 8 0s5 4 8 0 6-4 8 0" stroke="#006cea" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    YourBrand
                  </span>
                  <span className="wl-site-links"><span>Cruises</span><span>Destinations</span><span>Deals</span>
                    <svg width="14" height="12" viewBox="0 0 14 12"><path d="M1 1h12M1 6h12M1 11h12" stroke="#0a1f44" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </span>
                </div>
                <div className="wl-site-hero">
                  <Image src={brandHeroImg} alt="" fill sizes="(max-width: 780px) 100vw, 520px" style={{ objectFit: "cover", objectPosition: "80% 60%" }} />
                  <div className="wl-site-copy">
                    <strong>Discover<br />Amazing Cruises</strong>
                    <span>Unforgettable journeys. Your way.</span>
                  </div>
                  <div className="wl-site-search">
                    <div><b>Destination</b><em>Any destination</em></div>
                    <div><b>Departure</b><em>Any date</em></div>
                    <div><b>Guests</b><em>2 Adults</em></div>
                    <span className="wl-site-btn">Search</span>
                  </div>
                </div>
              </div>

              <div className="wl-api">
                <span className="wl-api-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" /></svg></span>
                <strong>API Integration</strong>
                <ul>
                  {["Search & Availability", "Pricing & Fare Rules", "Booking & Payment", "Post-Booking Services"].map((t) => (
                    <li key={t}><span className="wl-tick"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="wl-pill wl-at-inventory">
                <span className="wl-pill-icon"><svg {...wlPillIcon}><ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" /><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" /></svg></span>
                <div><strong>Global Inventory</strong><span>Live rates &amp; real-time availability</span></div>
              </div>
              <div className="wl-pill wl-at-rules">
                <span className="wl-pill-icon"><svg {...wlPillIcon}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" /><circle cx="12" cy="12" r="6.6" /></svg></span>
                <div><strong>Your Business Rules</strong><span>Flexible &amp; configurable</span></div>
              </div>
            </div>

            <p className={`wl-tagline ${scriptFont.className}`}>
              Same Cruises. Your Brand.
              <svg viewBox="0 0 300 16" preserveAspectRatio="none"><path d="M60 12 C140 4 230 2 298 3" stroke="#006cea" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
            </p>
          </div>
        </div>
      </section>

      {/* ───── PLATFORM ───── */}
      <section className="platform">
        <div className='container'>
          <div className="platform-content">
          <h2>Powerful platform.<br />seamless experience.</h2>
          <ul className="platform-list">
            <li>iFrame integration in any website</li>
            <li>White-label &amp; brand customizable</li>
            <li>Multi-currency &amp; multi-language</li>
            <li>24/7 Ops &amp; technical support</li>
            <li>High performance &amp; 99.9% uptime</li>
          </ul>
        </div>

        <div className="dashboard-mockup">
          <div className="db-topbar">
            <span className="db-logo">
              <Image src={cruisestackLogo} alt="cruisestack Logo" width={151} height={20} /></span>
            <div className="db-dots"><div className="db-dot"></div><div className="db-dot"></div><div className="db-dot"></div></div>
          </div>
          <div className="db-body">
            <div className="db-sidebar">
              <div className="db-nav-item active">📊 Dashboard</div>
              <div className="db-nav-item">📋 Bookings</div>
              <div className="db-nav-item">👤 Leads</div>
              <div className="db-nav-item">💬 Quotes</div>
              <div className="db-nav-item">📈 Reports</div>
              <div className="db-nav-item">🚢 Inventory</div>
              <div className="db-nav-item">💰 Finance</div>
              <div className="db-nav-item">⚙ Settings</div>
            </div>
            <div className="db-main">
              <div className="db-title">Dashboard</div>
              <div className="db-stats-row">
                <div className="db-stat-card">
                  <div className="db-stat-label">Total Bookings</div>
                  <div className="db-stat-val">1,248</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-label">Confirmed</div>
                  <div className="db-stat-val">842</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-label">Revenue (USD)</div>
                  <div className="db-stat-val">$1.24M</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-label">Conversion Rate</div>
                  <div className="db-stat-val">26.5%</div>
                </div>
              </div>
              <div className="db-charts">
                <div className="db-chart-box">
                  <div className="db-chart-label">Bookings Overview</div>
                  <div className="db-chart-sub">Last 12 Months</div>
                  <svg className="mini-line" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity=".3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,50 L16,44 L33,48 L49,38 L65,40 L82,30 L98,28 L114,22 L131,18 L147,14 L163,10 L180,8 L200,4" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <path d="M0,50 L16,44 L33,48 L49,38 L65,40 L82,30 L98,28 L114,22 L131,18 L147,14 L163,10 L180,8 L200,4 L200,60 L0,60Z" fill="url(#lineGrad)" />
                  </svg>
                </div>
                <div className="db-chart-box">
                  <div className="db-chart-label">Bookings by Status</div>
                  <svg className="mini-donut" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="28" fill="none" stroke="#1e3a6e" strokeWidth="18" />
                    <circle cx="40" cy="40" r="28" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="117.9 175.9" strokeDashoffset="43.9" transform="rotate(-90 40 40)" />
                    <circle cx="40" cy="40" r="28" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="35.2 175.9" strokeDashoffset="-74" transform="rotate(-90 40 40)" />
                    <circle cx="40" cy="40" r="28" fill="none" stroke="#ef4444" strokeWidth="18" strokeDasharray="14.1 175.9" strokeDashoffset="-109" transform="rotate(-90 40 40)" />
                    <circle cx="40" cy="40" r="28" fill="none" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="8.8 175.9" strokeDashoffset="-123" transform="rotate(-90 40 40)" />
                  </svg>
                  <div className="donut-legend">
                    <div className="donut-legend-item"><div className="donut-dot" style={{ background: '#3b82f6' }}></div> Confirmed</div>
                    <div className="donut-legend-item"><div className="donut-dot" style={{ background: '#f59e0b' }}></div> Pending</div>
                    <div className="donut-legend-item"><div className="donut-dot" style={{ background: '#ef4444' }}></div> Cancelled</div>
                    <div className="donut-legend-item"><div className="donut-dot" style={{ background: '#8b5cf6' }}></div> On Hold</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        
      </section>

      {/* ───── BUILT FOR ───── */}
      <section className="bf">
        <div className="bf-header">
          <span className="bf-eyebrow">Built for...</span>
          <h2>Every Cruise Business, Big or Small</h2>
          <p>No matter your business model, CruiseStack gives you the tools, content and support to sell more cruises and create unforgettable travel experiences.</p>
        </div>
        <div className="bf-grid">
          {builtFor.map((b) => (
            <article className="bf-card" key={b.title}>
              <div className="bf-media">
                <Image src={b.img} alt="" fill sizes="(max-width: 780px) 100vw, (max-width: 1100px) 50vw, 320px" style={{ objectFit: "cover", objectPosition: b.pos }} />
                {b.badges && (
                  <ul className="bf-badges">
                    {b.badges.map((badge) => (
                      <li key={badge.label}>{badge.icon}{badge.label}</li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="bf-icon">{b.icon}</span>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </article>
          ))}
        </div>
        <div className="bf-cta">
          <h3>Ready to Take Your Cruise Business Further?</h3>
          <p>Let&apos;s show you how CruiseStack can work for you.</p>
          <Link href="/bookdemo" className="hiw-cta-btn">
            Book a Demo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </section>

      {/* ───── CRUISE LINES ───── */}
      <section className="cruise-lines">
        <div className="section-header">
          <h2>Integrated with 30+ leading cruise lines</h2>
          <p>Connect, compare and book from the world&apos;s best cruise brands.</p>
        </div>
        <div className="cruise-grid">
          
                <div className="row">
                  <div className="col lgs">
                    <Image src={lg1} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg2} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg3} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg4} alt="" width={100} height={100}  />
                  </div>
                  <div className="col lgs">
                    <Image src={lg5} alt="" width={100} height={100} />
                  </div>
               
                  <div className="col lgs">
                    <Image src={lg6} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg7} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg8} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg9} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg10} alt="" width={100} height={100} />
                  </div>
                
                  <div className="col lgs">
                    <Image src={lg11} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg12} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg13} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg14} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg15} alt="" width={100} height={100}  />
                  </div>
               
                  <div className="col lgs">
                    <Image src={lg16} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg17} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg18} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg19} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg20} alt="" width={100} height={100} />
                  </div>
               
                  <div className="col lgs">
                    <Image src={lg21} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg22} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg23} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg24} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg25} alt="" width={100} height={100} />
                  </div>
               
                  <div className="col lgs">
                    <Image src={lg26} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg27} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg28} alt="" width={100} height={100} />
                  </div>
                  <div className="col lgs">
                    <Image src={lg29} alt="" />
                  </div>
                 
                  <div className="col lgs">
                    <Image src={lg30} alt="" />
                  </div>
                </div>
              
          {/* <div className="cruise-logo-cell"><span>NCL<br />NORWEGIAN</span></div>
          <div className="cruise-logo-cell"><span>☀ MSC CRUISES</span></div>
          <div className="cruise-logo-cell"><span>Costa</span></div>
          <div className="cruise-logo-cell"><span>🌟 DREAM CRUISES</span></div>
          <div className="cruise-logo-cell"><span>CORDELIA CRUISES</span></div>
          <div className="cruise-logo-cell"><span>CELESTYAL</span></div>
          <div className="cruise-logo-cell"><span>🔱 PRINCESS</span></div>
          <div className="cruise-logo-cell"><span>Holland America Line</span></div>
          <div className="cruise-logo-cell"><span>Disney CRUISE LINE</span></div>
          <div className="cruise-logo-cell"><span>Virgin VOYAGES</span></div>
          <div className="cruise-logo-cell"><span>⚓ Royal Caribbean</span></div>
          <div className="cruise-logo-cell"><span>Celebrity X Cruises</span></div>
          <div className="cruise-logo-cell"><span>SILVERSEA</span></div>
          <div className="cruise-logo-cell"><span>🎭 Carnival</span></div>
          <div className="cruise-logo-cell"><span>EMERALD CRUISES</span></div>
          <div className="cruise-logo-cell"><span>✈ viva Cruises</span></div>
          <div className="cruise-logo-cell"><span>UNIWORLD</span></div>
          <div className="cruise-logo-cell"><span>CRYSTAL</span></div>
          <div className="cruise-logo-cell"><span>OCEANIA CRUISES</span></div>
          <div className="cruise-logo-cell"><span>🏅 CUNARD</span></div>
          <div className="cruise-logo-cell"><span>P&O CRUISES</span></div>
          <div className="cruise-logo-cell"><span>HX HURTIGRUTEN EXPEDITIONS</span></div>
          <div className="cruise-logo-cell"><span>⬡ HURTIGRUTEN</span></div>
          <div className="cruise-logo-cell more"><span>& MORE</span></div> */}
        </div>
      </section>

      {/* ───── SECURITY & INFRASTRUCTURE ───── */}
      <section className="sec">
        <div className="sec-top">
          <div className="sec-copy">
            <span className="sec-eyebrow">Security &amp; Infrastructure</span>
            <h2>Built on a Secure, Scalable Foundation</h2>
            <p className="sec-lead">Your data, your customers and your business are in safe hands. CruiseStack is built with enterprise-grade security, reliability and global infrastructure.</p>
            <ul className="sec-grid">
              {securityFeatures.map((f) => (
                <li className="sec-card" key={f.title}>
                  <span className="sec-icon">{f.icon}</span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="sec-visual" aria-hidden="true">
            <div className="sec-scene">
              <div className="sec-map" />
              <div className="sec-glow" />
              <div className="sec-rack sec-rack-1" /><div className="sec-rack sec-rack-2" />
              <div className="sec-rack sec-rack-3" /><div className="sec-rack sec-rack-4" />
              <div className="sec-podium" />
              <svg className="sec-ring" viewBox="0 0 300 120"><ellipse cx="150" cy="60" rx="140" ry="42" fill="none" stroke="url(#secRing)" strokeWidth="10" transform="rotate(-14 150 60)" /><defs><linearGradient id="secRing" x1="0" x2="1"><stop offset="0" stopColor="#bcd6fb" stopOpacity=".2" /><stop offset=".5" stopColor="#d9e8ff" stopOpacity=".9" /><stop offset="1" stopColor="#8ab7f7" stopOpacity=".5" /></linearGradient></defs></svg>
              <svg className="sec-shield" viewBox="0 0 200 240">
                <defs>
                  <linearGradient id="secShieldL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5aa2ff" /><stop offset="1" stopColor="#0b5ed7" /></linearGradient>
                  <linearGradient id="secShieldR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f86f6" /><stop offset="1" stopColor="#0647a6" /></linearGradient>
                </defs>
                <path d="M100 6 16 38v64c0 60 36 104 84 128z" fill="url(#secShieldL)" />
                <path d="M100 6l84 32v64c0 60-36 104-84 128z" fill="url(#secShieldR)" />
                <path d="M100 22 30 49v53c0 51 30 89 70 110 40-21 70-59 70-110V49z" fill="none" stroke="#a9ceff" strokeOpacity=".7" strokeWidth="3" />
                <rect x="68" y="104" width="64" height="54" rx="10" fill="#fff" />
                <path d="M80 104V90a20 20 0 0 1 40 0v14" fill="none" stroke="#fff" strokeWidth="11" />
                <circle cx="100" cy="126" r="7" fill="#0b4fb3" /><rect x="96.5" y="128" width="7" height="15" rx="3" fill="#0b4fb3" />
              </svg>
              <div className="sec-pill sec-at-uptime">
                <span className="sec-pill-icon"><svg {...secPillIcon}><path d="M20 12a8 8 0 1 1-4-6.9" /><path d="m8.5 12 3 3 8-8" /></svg></span>
                <div><strong>99.9%</strong><span>Uptime</span></div>
              </div>
              <div className="sec-pill sec-at-cloud">
                <span className="sec-pill-icon"><svg {...secPillIcon}><path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.5A4 4 0 0 1 17 18z" /></svg></span>
                <div><strong>Global</strong><span>Cloud Infrastructure</span></div>
              </div>
              <div className="sec-pill sec-at-encrypted">
                <span className="sec-pill-icon"><svg {...secPillIcon}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" /></svg></span>
                <div><strong>Encrypted</strong><span>&amp; Secure</span></div>
              </div>
              <div className="sec-pill sec-at-trusted">
                <span className="sec-pill-icon"><svg {...secPillIcon}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" /></svg></span>
                <div><strong>Trusted</strong><span>Worldwide</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="sec-compliance">
          <div className="sec-compliance-copy">
            <span className="sec-eyebrow">Compliance &amp; Standards</span>
            <h3>Trusted. Compliant.<br />Always Improving.</h3>
            <p>We follow industry best practices and global standards to ensure your business is always protected.</p>
          </div>
          <ul className="sec-badges">
            {complianceBadges.map((b) => (
              <li key={b.title}>
                <span className={`sec-badge${b.pad ? " sec-badge-pad" : ""}`} aria-hidden="true">
                  {b.img ? <Image src={b.img} alt="" fill sizes="96px" style={{ objectFit: "contain" }} /> : b.badge}
                </span>
                <strong>{b.title}</strong>
                <span>{b.sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="media">
        <div className="section-header">
          <h2>cruisestack in media</h2>
        </div>

        <div className="media-grid">
          <article className="elemt_in">
            <div className="media-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 152 56" fill="none" role="img" aria-label="News18">
                <path d="M122.637 14.765H1V54.9506H122.637V14.765Z" stroke="white" strokeWidth="0.678094" strokeMiterlimit="10" />
                <path d="M122.637 14.765H1V54.9506H122.637V14.765Z" fill="#061836" />
                <path fillRule="evenodd" clipRule="evenodd" d="M8.98065 22.4405V46.7891H14.8924V31.711L23.6571 46.7989L29.4904 46.7891V22.4405H23.51L23.5002 36.6333L15.0983 22.4307L8.98065 22.4405Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M32.942 22.4307L32.9125 46.7989H52.0792L52.0694 41.4486H39.0106L39.0204 36.536L50.4713 36.5458L50.4615 31.3803H39.0106L39.0204 27.8005L51.5007 27.8297V22.4307H32.942Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M53.2468 22.4308L60.2076 46.7989L66.3841 46.7892L69.5997 31.1274L72.9233 46.7989L78.4527 46.7892L85.4723 22.4308H79.188L75.8056 36.7695L72.8448 22.4308H66.2762L63.4723 35.9816L60.3056 22.4308H53.2468Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M99.5394 30.4557C99.5394 30.4557 100.343 27.4303 95.5394 26.9537C92.2453 26.6326 91.5688 28.9284 92.059 29.7942C93.0688 31.5549 100.677 31.5646 104.314 34.5997C107.441 37.2068 106.686 43.1796 103.383 45.3781C99.4218 48.0144 93.1767 47.5571 90.4316 46.3217C84.8924 43.8314 85.7845 38.4033 85.7845 38.4033H91.6473C91.6473 38.4033 91.3335 42.1485 95.961 42.1582C100.794 42.1582 100.804 39.6484 99.8041 38.6368C98.6963 37.5083 89.5884 37.1289 87.0786 33.374C85.4218 30.8837 85.1767 25.835 89.6277 23.1793C94.0786 20.5236 100.677 21.8271 103.079 24.3077C105.981 27.2941 105.52 30.4654 105.52 30.4654H99.5492L99.5394 30.4557Z" fill="white" />
                <path d="M110.441 1H151L150.971 41.1661H110.461L110.441 1Z" stroke="white" strokeWidth="0.678094" strokeMiterlimit="10" />
                <path fillRule="evenodd" clipRule="evenodd" d="M110.441 1H151L150.971 41.1661H110.461L110.441 1Z" fill="#EC2027" />
                <path fillRule="evenodd" clipRule="evenodd" d="M114.569 8.94757H124.442V33.8799H118.569V14.7064H114.569V8.94757Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M135.904 34.3179C141.09 34.2303 144.305 30.6408 144.688 27.2944C145.207 22.7321 142.756 21.1756 141.325 20.3099C142.913 19.2009 144.051 17.8779 143.864 14.8428C143.413 10.6501 139.864 8.54894 135.727 8.51003C131.58 8.47112 128.354 10.9712 127.766 14.6775C127.266 17.8779 129.345 19.7262 130.325 20.3001C128.364 21.341 126.521 24.1718 126.894 27.236C127.247 30.1155 130.217 34.4152 135.884 34.3179H135.904Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M138.344 15.8835C138.344 17.2552 137.275 18.4225 135.893 18.4225C134.51 18.4225 133.344 17.4011 133.383 15.8544C133.422 14.3271 134.746 13.4419 135.893 13.4516C137.275 13.4613 138.344 14.3757 138.344 15.8835Z" fill="#EC2027" />
                <path fillRule="evenodd" clipRule="evenodd" d="M138.743 25.6797C138.743 27.2653 137.655 28.5591 135.949 28.6272C134.322 28.6855 133.067 27.2653 133.047 25.6894C133.028 24.0162 134.224 22.8391 135.93 22.8294C137.518 22.8294 138.743 24.1524 138.743 25.6797Z" fill="#EC2027" />
              </svg>
            </div>
            <h4>Planning Your First Cruise In 2025? Here&apos;s Everything Indian Travellers Should Know</h4>
            <span className="dte">Updated: 04 September 2025, 17:53 IST</span>
            <p>
              <a href="https://www.news18.com/lifestyle/travel/planning-your-first-cruise-in-2025-heres-everything-indian-travellers-should-know-ws-l-9549631.html" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/insights.png" alt="ET Edge Insights" /></div>
            <h4>Why cruises are set to dominate India&apos;s outbound travel market</h4>
            <span className="dte">Updated: 23 August 2025, 9:05:31 AM IST</span>
            <p>
              <a href="https://etedge-insights.com/industry/travel-and-leisure/why-cruises-are-set-to-dominate-indias-outbound-travel-market/" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/cnbc.png" alt="CNBC TV18" /></div>
            <h4>Cruise travel drawing more Indian tourists but tax clarity still a challenge, say experts</h4>
            <span className="dte">Updated: 01 July 2025, 6:05:31 PM IST</span>
            <p>
              <a href="https://www.cnbctv18.com/travel/destinations/cruise-travel-sees-growth-indian-tourists-gst-income-tax-clarity-still-a-challenge-19629907.htm" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/times.png" alt="Times Entertainment" /></div>
            <h4>5 things Indians always ask before booking a cruise; and they should really be asking</h4>
            <span className="dte">Updated: 01 July 2025, 9:18 IST</span>
            <p>
              <a href="https://timesofindia.indiatimes.com/articleshow/122141337.cms" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/cnbc.png" alt="CNBC TV18" /></div>
            <h4>Cruise tourism in India booms: How travel insurance can safeguard your voyage</h4>
            <span className="dte">Updated: 03 June 2025, 5:34:25 PM IST</span>
            <p>
              <a href="https://www.cnbctv18.com/travel/lifestyle/cruise-tourism-rise-india-insurance-voyage-domestic-international-policies-19614898.htm" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/mint.png" alt="Mint" /></div>
            <h4>Startup GetMyCruise raises $700k in seed round led by Inflection Point Ventures</h4>
            <span className="dte">Updated: 13 Dec 2021, 12:17 PM IST</span>
            <p>
              <a href="https://www.livemint.com/companies/start-ups/saas-startup-unremot-raises-700k-in-seed-round-led-by-inflection-point-ventures-11639377533907.html" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/bwdisrupt.png" alt="BW Disrupt" /></div>
            <h4>Techstars Backed Startup GetMyCruise Raises $700k In A Seed Round</h4>
            <span className="dte">Updated: 13 Dec 2021, 12:17 PM IST</span>
            <p>
              <a href="http://bwdisrupt.businessworld.in/article/Techstars-Backed-SaaS-Startup-unremot-Raises-700k-In-A-Seed-Round/13-12-2021-414583/" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/yourstory.png" alt="YourStory" /></div>
            <h4>Startup GetMyCruise raises seed round from Inflection Point Ventures</h4>
            <span className="dte">By Payal Ganguly, December 13, 2021</span>
            <p>
              <a href="https://yourstory.com/2021/12/funding-alert-anakin-unremot-pingolearn-oben-ev-fananywhere/amp" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/vccircle.png" alt="VCCircle" /></div>
            <h4>Inflection Point Ventures Leads Seed Funding Round In Techstars-Backed startup GetMyCruise</h4>
            <span className="dte">By Nikhil Patwardhan, 13 Dec 2021</span>
            <p>
              <a href="https://www.vccircle.com/inflection-point-ventures-leads-seed-funding-round-in-techstars-backed-saas-firm-unremot" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/entrackr.png" alt="Entrackr" /></div>
            <h4>GetMyCruise secures $700k seed funding</h4>
            <span className="dte">Satyaki, December 13, 2021</span>
            <p>
              <a href="https://entrackr.com/2021/12/unremot-secures-700k-seed-funding/" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
          <article className="elemt_in">
            <div className="media-logo"><img src="/media/cnbc.png" alt="CNBC TV18" /></div>
            <h4>Funding Rundown: GetMyCruise raises $700k in seed funding round</h4>
            <span className="dte">Updated: 13 Dec 2021, 12:17 PM IST</span>
            <p>
              <a href="https://www.cnbctv18.com/startup/funding-rundown-flipkart-and-walmart-invest-145-mn-in-ninjacart-fullife-healthcare-raises-22-mn--anakin-secures-2-mn-in-seed-funding-round-11803092.htm" target="_blank" rel="noreferrer nofollow">Read more</a>
            </p>
          </article>
        </div>
      </section>

      {/* ───── BACKED BY ───── */}
      <section className="backers">
        <div className="section-header">
          <h2>We&apos;re backed by</h2>
        </div>
        <ul className="backers-logos">
          <li><Image src={backerTechstars} alt="Techstars" style={{height:70,width:220}}/></li>
          <li className="tall"><Image src={backerInflection} alt="Inflection Point Ventures" /></li>
          <li className="tall"><Image src={backerAh} alt="ah! Ventures" /></li>
          <li><Image src={backerDigital} alt="Digital Futurists Angels Network" style={{height:70,width:259}}/></li>
        </ul>
      </section>

      {/* ───── CTA ───── */}
      <section className="cta" style={ftrimgsect}>
        <div className="cta-content" style={{maxWidth:'1320px',marginRight:'auto',width:'100%'}}>
          <h2>Ready to grow your cruise business?</h2>
          <p>Join hundreds of travel businesses that trust cruisestack to power their cruise commerce.</p>
          <div className="cta-btns">
            <Link href="/bookdemo" className="btn-primary">Book a Demo</Link>
            
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
     <Footer/>

    </div>
  );
}
