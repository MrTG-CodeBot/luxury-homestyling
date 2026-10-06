import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-luxury">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <a href="#home" className="brand-crest">
              <img src="/assets/images/logo.jpg" alt="Luxury Homestyling" className="brand-crest-logo" style={{ width: '48px', height: '48px' }} />
              <div className="brand-crest-text">
                <span className="brand-crest-name" style={{ fontSize: '1.15rem' }}>LUXURY</span>
                <span className="brand-crest-sub" style={{ fontSize: '0.65rem' }}>HOMESTYLING</span>
              </div>
            </a>
            <p>
              Kerala's premier destination for custom motorized curtains, designer blinds, bespoke hand-tufted carpets, and European luxury wallpapers.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links">
              <li><a href="#collections">Curtains &amp; Drapes</a></li>
              <li><a href="#collections">Motorized Blinds</a></li>
              <li><a href="#collections">Carpets &amp; Rugs</a></li>
              <li><a href="#collections">Designer Wallpapers</a></li>
              <li><a href="#collections">Motorized Automation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#projects">Our Projects</a></li>
              <li><a href="#why-us">Why Us</a></li>
              <li><a href="#measurement">Free Measurement</a></li>
              <li><a href="#reviews">Client Reviews</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Doorstep Service</h4>
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>All Kerala Doorstep Service (Kochi, Trivandrum, Calicut, Thrissur, Kottayam, Kannur &amp; more)</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone-alt"></i>
              <span><a href="tel:+917736805461" style={{ color: 'inherit', textDecoration: 'none' }}>+91 77368 05461</a></span>
            </div>
            <div className="footer-contact-item">
              <i className="fab fa-whatsapp"></i>
              <span><a href="https://wa.me/917736805461" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 77368 05461</a></span>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div>
            &copy; 2026 Luxury Homestyling. All Rights Reserved. Crafted for Beautiful Homes.
          </div>
        </div>
      </div>
    </footer>
  );
}
