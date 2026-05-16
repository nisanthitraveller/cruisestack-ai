import React from 'react';
import './style.css'; // Adjust this path based on where you save the CSS file
import heroImg from '../assets/hero.png'
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
import Image from 'next/image';
import Link from "next/link";

export default function CruiseCommercePage() {

  const sectionStyle = {
    backgroundImage: `url(${heroImg.src})`,
    backgroundSize: 'cover',
    
  };
const ftrimgsect = {
    backgroundImage: `url(${ftrImg.src})`,
    backgroundSize: 'cover',
    
  };
  return (
    <div className="cruise-page-body">
      
      {/* ───── NAV ───── */}
      <nav>
        <a href="#" className="nav-logo">
          <div className="anchor-icon">⚓</div>
          <div className="logo-text">
            <span className="logo-name">CruiseEngine</span>
            <span className="logo-sub">Powering Cruise Commerce</span>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#">Product <span className="chevron">▾</span></a></li>
          <li><a href="#">Solutions <span className="chevron">▾</span></a></li>
          <li><a href="#">Resources <span className="chevron">▾</span></a></li>
          <li><a href="#">Company <span className="chevron">▾</span></a></li>
        </ul>
        
        <div className="nav-actions">
        <Link href="/signup" className="btn-ghost">
         Sign Up
        </Link>

        <Link href="/bookdemo" className="btn-primary">
         Book a Demo
        </Link>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="hero" style={sectionStyle}>
        <div className="hero-content">
          <span className="hero-badge">All-in-one Cruise Booking Engine</span>
          <h1>The Complete Cruise Commerce Platform for Modern Travel Businesses</h1>
          <p>Power your brand with real-time inventory, instant quotations, secure bookings and end-to-end operations—across 32+ global cruise lines.</p>
          <div className="hero-btns">
            <button className="btn-primary" style={{ padding: '13px 28px', fontSize: '15px' }}>Book a Demo</button>
            <button className="btn-outline" style={{ padding: '11px 28px', fontSize: '15px' }}>View Pricing</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="num">32+</span><span className="label">Cruise Lines</span></div>
            <div className="stat"><span className="num">500+</span><span className="label">Travel Partners</span></div>
            <div className="stat"><span className="num">99.9%</span><span className="label">Uptime</span></div>
            <div className="stat"><span className="num">4.9/5</span><span className="label">Customer Rating</span></div>
          </div>
        </div>

        <div className="hero-right">
          {/* Search card */}
          <div className="search-card">
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
          </div>

          {/* Deal card */}
          <div className="deal-card">
            <div className="deal-info">
              <div className="deal-label">Today&apos;s Top Deal</div>
              <div className="deal-title">7 Night Western Caribbean from Miami, USA</div>
              <div className="deal-price">US$ 699 <span>/pp</span></div>
              <div className="deal-link">View Details</div>
            </div>
            <div className="deal-img">
              <img src="https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=144&q=80" alt="cruise ship" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── TRUST BAR ───── */}
      <section className="trust-bar">
        <p>Trusted by Leading Travel Brands Worldwide</p>
        <div className="trust-logos">
          <span className="trust-logo script">Dream Vacations</span>
          <span className="trust-logo blue">FLY CRUISE</span>
          <span className="trust-logo">🧳 Travel Leaders</span>
          <span className="trust-logo green">⚙ Nexion Travel Group</span>
          <span className="trust-logo">🚢 Cruise Planners</span>
          <span className="trust-logo blue">➕ Expedia TAAP</span>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="features">
        <div className="section-header">
          <h2>Everything You Need to Sell Cruises, Effortlessly</h2>
          <p>Built for travel agencies, OTAs, and enterprises to grow, automate and scale.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon">📡</div>
            <h4>Real-time Inventory</h4>
            <p>Access live availability from 32+ cruise lines.</p>
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
          <h2>Powerful Platform.<br />Seamless Experience.</h2>
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
            <span className="db-logo">⚓ CruiseEngine</span>
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
          <h2>Integrated with 32+ Leading Cruise Lines</h2>
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

      {/* ───── CTA ───── */}
      <section className="cta" style={ftrimgsect}>
        <div className="cta-content">
          <h2>Ready to Grow Your Cruise Business?</h2>
          <p>Join hundreds of travel businesses that trust CruiseEngine to power their cruise commerce.</p>
          <div className="cta-btns">
            <button className="btn-white">Book a Demo</button>
            <button className="btn-outline-white">Talk to Sales</button>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo" style={{ textDecoration: 'none' }}>
              <div className="anchor-icon">⚓</div>
              <div className="logo-text">
                <span className="logo-name">CruiseEngine</span>
                <span className="logo-sub" style={{ color: 'rgba(255,255,255,.4)' }}>Powering Cruise Commerce</span>
              </div>
            </a>
            <p>The most complete cruise booking engine for travel companies worldwide.</p>
            <div className="social-links">
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">▶</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Integrations</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><a href="#">Travel Agencies</a></li>
              <li><a href="#">OTAs</a></li>
              <li><a href="#">Enterprises</a></li>
              <li><a href="#">Host Agencies</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Case Studies</a></li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>Have Questions? Let&apos;s Talk.</h4>
            <p>Our experts are ready to help you choose the right plan and grow your cruise business.</p>
            <div className="footer-contact-btns">
              <button className="btn-primary">Book a Demo</button>
              <button className="btn-outline-white">Contact Sales</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 CruiseEngine. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
