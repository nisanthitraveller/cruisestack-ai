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
import Footer from '@/components/Footer/footer';
import Header from '@/components/Header/header';

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

      {/* ───── FEATURES ───── */}
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
