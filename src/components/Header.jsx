import React, { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className={`header-glass ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#home" className="brand-crest">
            <img src="/assets/images/logo.jpg" alt="Luxury Homestyling Logo" className="brand-crest-logo" />
            <div className="brand-crest-text">
              <span className="brand-crest-name">LUXURY</span>
              <span className="brand-crest-sub">HOMESTYLING</span>
            </div>
          </a>

          <ul className="nav-links">
            <li><a href="#home" className="nav-link active">Home</a></li>
            <li><a href="#collections" className="nav-link">Collections</a></li>
            <li><a href="#projects" className="nav-link">Our Projects</a></li>
            <li><a href="#why-us" className="nav-link">Why Us</a></li>
            <li><a href="#measurement" className="nav-link">Free Measurement</a></li>
            <li><a href="#reviews" className="nav-link">Reviews</a></li>
          </ul>

          <div className="nav-actions">
            <a href="#measurement" className="btn-gold">
              <span>Book Free Visit</span>
              <i className="fas fa-arrow-right"></i>
            </a>
            <button 
              className="mobile-toggle" 
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Open Navigation Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div 
        className={`drawer-backdrop ${drawerOpen ? 'show' : ''}`}
        onClick={closeDrawer}
      ></div>
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="brand-crest">
            <img src="/assets/images/logo.jpg" alt="Luxury Homestyling" className="brand-crest-logo" style={{ width: '42px', height: '42px' }} />
            <span className="brand-crest-name" style={{ fontSize: '1.1rem' }}>LUXURY</span>
          </div>
          <button className="drawer-close" onClick={closeDrawer}>&times;</button>
        </div>
        <ul className="drawer-links">
          <li><a href="#home" className="drawer-link" onClick={closeDrawer}>Home <i className="fas fa-chevron-right"></i></a></li>
          <li><a href="#collections" className="drawer-link" onClick={closeDrawer}>Collections <i className="fas fa-chevron-right"></i></a></li>
          <li><a href="#projects" className="drawer-link" onClick={closeDrawer}>Our Projects <i className="fas fa-chevron-right"></i></a></li>
          <li><a href="#why-us" className="drawer-link" onClick={closeDrawer}>Why Luxury Homestyling <i className="fas fa-chevron-right"></i></a></li>
          <li><a href="#measurement" className="drawer-link" onClick={closeDrawer}>Free Measurement <i className="fas fa-chevron-right"></i></a></li>
          <li><a href="#reviews" className="drawer-link" onClick={closeDrawer}>Client Reviews <i className="fas fa-chevron-right"></i></a></li>
        </ul>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="tel:+917736805461" className="btn-outline-gold" style={{ width: '100%' }}>
            <i className="fas fa-phone-alt"></i> Call +91 77368 05461
          </a>
          <a 
            href="https://wa.me/917736805461?text=Hello%20Luxury%20Homestyling!%20I%20want%20to%20book%20a%20home%20styling%20visit." 
            target="_blank" 
            rel="noreferrer"
            className="btn-whatsapp" 
            style={{ width: '100%' }}
          >
            <i className="fab fa-whatsapp"></i> Chat on WhatsApp
          </a>
        </div>
      </aside>
    </>
  );
}
