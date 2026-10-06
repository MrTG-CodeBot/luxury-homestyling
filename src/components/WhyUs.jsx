import React from 'react';

export default function WhyUs() {
  const districts = [
    'Ernakulam (Kochi)', 'Thiruvananthapuram', 'Kozhikode (Calicut)',
    'Thrissur', 'Kottayam', 'Kannur', 'Malappuram', 'Kollam',
    'Palakkad', 'Alappuzha', 'Pathanamthitta', 'Idukki',
    'Wayanad', 'Kasaragod'
  ];

  return (
    <section className="section-padding" id="why-us">
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag"><i className="fas fa-check-circle"></i> The Luxury Difference</div>
          <h2 className="section-title">Why <span className="gold-gradient-text">Luxury Homestyling?</span></h2>
          <p className="section-subtitle">
            We don't just sell curtains and blinds; we curate architectural harmony with three golden promises.
          </p>
        </div>

        <div className="why-us-grid">
          {/* Pillar 1: Pre-Measurement */}
          <div className="why-pillar-card">
            <span className="pillar-number">01</span>
            <div className="pillar-icon-wrap">
              <i className="fas fa-ruler-combined"></i>
            </div>
            <h3 className="pillar-title">Precision Pre-Measurement</h3>
            <p className="pillar-desc">
              Our styling directors visit your home anywhere in Kerala with laser measuring tools and a master catalog of 500+ tactile fabric swatches.
            </p>
            <ul className="pillar-highlights">
              <li><i className="fas fa-check"></i> 100% Free Doorstep Kerala Consultation</li>
              <li><i className="fas fa-check"></i> Laser-accurate window &amp; floor sizing</li>
              <li><i className="fas fa-check"></i> Personalized lighting &amp; color matching</li>
            </ul>
          </div>

          {/* Pillar 2: Uncompromising Quality */}
          <div className="why-pillar-card">
            <span className="pillar-number">02</span>
            <div className="pillar-icon-wrap">
              <i className="fas fa-medal"></i>
            </div>
            <h3 className="pillar-title">Bespoke Quality &amp; Fabrics</h3>
            <p className="pillar-desc">
              Every curtain pleat, blind slat, and carpet knot is crafted using premium imported textiles, triple-layer stitching, and motorized smart actuators.
            </p>
            <ul className="pillar-highlights">
              <li><i className="fas fa-check"></i> High-density fade &amp; moisture-resistant textiles</li>
              <li><i className="fas fa-check"></i> Somfy &amp; Tuya smart automated motorization</li>
              <li><i className="fas fa-check"></i> Handcrafted triple-hem tailoring</li>
            </ul>
          </div>

          {/* Pillar 3: White-Glove Installation */}
          <div className="why-pillar-card">
            <span className="pillar-number">03</span>
            <div className="pillar-icon-wrap">
              <i className="fas fa-tools"></i>
            </div>
            <h3 className="pillar-title">Flawless Expert Installation</h3>
            <p className="pillar-desc">
              Our certified in-house technicians handle everything from ceiling bracket anchors to steam-pressing drapes on-site with zero dust or hassle.
            </p>
            <ul className="pillar-highlights">
              <li><i className="fas fa-check"></i> Clean, quiet, and dust-free mounting</li>
              <li><i className="fas fa-check"></i> On-site steam pressing &amp; pleat setting</li>
              <li><i className="fas fa-check"></i> 5-Year hardware &amp; motor warranty support</li>
            </ul>
          </div>
        </div>

        {/* Kerala-Wide Service Presence Banner */}
        <div className="kerala-presence-box">
          <div className="kerala-presence-info">
            <h3><i className="fas fa-map-marked-alt" style={{ marginRight: '8px' }}></i> Available Across All 14 Kerala Districts</h3>
            <p>Our mobile styling vans and measurement directors are active daily across the state:</p>
          </div>
          <div className="districts-pill-wrap">
            {districts.map((d, i) => (
              <span key={i} className="district-tag">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
