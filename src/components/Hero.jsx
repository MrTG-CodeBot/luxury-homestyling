import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-bg-container">
        <img src="/assets/images/hero.jpg" alt="Luxury Curtains and Blinds Living Room" className="hero-bg-image" />
        <div className="hero-overlay"></div>
      </div>

      <div className="container hero-content">
        <div className="hero-badge">
          <i className="fas fa-crown"></i>
          <span>All Kerala Premium Doorstep Service</span>
        </div>

        <h1 className="hero-title">
          Premium Curtains &amp; Blinds for <span className="gold-gradient-text">Beautiful Homes</span>
        </h1>

        <p className="hero-subtitle">
          Transform your living spaces with bespoke drapery, motorized smart blinds, handcrafted luxury rugs, and designer European wallpapers — tailored with millimeter precision anywhere in Kerala.
        </p>

        <div className="hero-ctas">
          <a href="#measurement" className="btn-gold" style={{ padding: '15px 34px', fontSize: '1rem' }}>
            <span>Book Free Home Measurement</span>
            <i className="fas fa-ruler-combined"></i>
          </a>
          <a href="#projects" className="btn-outline-gold" style={{ padding: '14px 30px', fontSize: '1rem' }}>
            <span>Explore Masterpieces</span>
            <i className="fas fa-arrow-down"></i>
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div className="hero-trust-bar">
          <div className="trust-item">
            <i className="fas fa-home-user"></i>
            <span>Free Doorstep Measurement</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-award"></i>
            <span>Master Crafted Quality</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-tools"></i>
            <span>White-Glove Installation</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-map-marked-alt"></i>
            <span>All 14 Kerala Districts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
