import React from 'react';

export default function Collections({ onSelectCategory }) {
  const handleCategoryClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  return (
    <section className="section-padding" id="collections">
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag"><i className="fas fa-gem"></i> Bespoke Offerings</div>
          <h2 className="section-title">Signature <span className="gold-gradient-text">Home Styling</span> Collections</h2>
          <p className="section-subtitle">
            Curated from the finest global mills and engineered for tropical durability, light perfection, and effortless luxury.
          </p>
        </div>

        <div className="category-grid">
          {/* Curtains */}
          <div className="category-card">
            <div className="category-image-wrap">
              <img src="/assets/images/curtains.jpg" alt="Premium Curtains & Drapes" className="category-img" />
              <div className="category-overlay"></div>
              <span className="category-badge">Bespoke Drapery</span>
            </div>
            <div className="category-body">
              <h3 className="category-title">Curtains &amp; Drapes</h3>
              <p className="category-desc">
                Wave-fold drapes, sheer voile, Belgian linens, royal acoustic blackout velvets, and motorized ceiling systems with remote control.
              </p>
              <div className="category-tags">
                <span className="cat-pill">Motorized Drapes</span>
                <span className="cat-pill">Sheer Voile</span>
                <span className="cat-pill">Royal Velvet</span>
                <span className="cat-pill">Acoustic Blackout</span>
              </div>
              <a href="#projects" className="category-btn" onClick={() => handleCategoryClick('curtains')}>
                <span>View Curtains Projects</span>
                <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>

          {/* Blinds */}
          <div className="category-card">
            <div className="category-image-wrap">
              <img src="/assets/images/blinds.jpg" alt="Motorized & Designer Blinds" className="category-img" />
              <div className="category-overlay"></div>
              <span className="category-badge">Smart Shading</span>
            </div>
            <div className="category-body">
              <h3 className="category-title">Designer Blinds</h3>
              <p className="category-desc">
                High-precision motorized roller blinds, dual zebra shades, dark walnut wooden Venetian blinds, and honeycomb insulation blinds.
              </p>
              <div className="category-tags">
                <span className="cat-pill">Wooden Venetian</span>
                <span className="cat-pill">Zebra Duo Shades</span>
                <span className="cat-pill">Smart Motorized</span>
                <span className="cat-pill">Roman Drapes</span>
              </div>
              <a href="#projects" className="category-btn" onClick={() => handleCategoryClick('blinds')}>
                <span>View Blinds Projects</span>
                <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>

          {/* Carpets & Rugs */}
          <div className="category-card">
            <div className="category-image-wrap">
              <img src="/assets/images/carpets.jpg" alt="Luxury Handcrafted Carpets & Rugs" className="category-img" />
              <div className="category-overlay"></div>
              <span className="category-badge">Floor Couture</span>
            </div>
            <div className="category-body">
              <h3 className="category-title">Carpets &amp; Rugs</h3>
              <p className="category-desc">
                Hand-tufted pure silk &amp; New Zealand wool rugs, custom living room centerpieces, high-density velvet pile, and wall-to-wall luxury carpets.
              </p>
              <div className="category-tags">
                <span className="cat-pill">Hand-Tufted Silk</span>
                <span className="cat-pill">Custom Sizing</span>
                <span className="cat-pill">Stain Resistant</span>
                <span className="cat-pill">Wall-to-Wall</span>
              </div>
              <a href="#projects" className="category-btn" onClick={() => handleCategoryClick('carpets')}>
                <span>View Carpet Projects</span>
                <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>

          {/* Wallpapers */}
          <div className="category-card">
            <div className="category-image-wrap">
              <img src="/assets/images/wallpapers.jpg" alt="European Designer Wallpapers" className="category-img" />
              <div className="category-overlay"></div>
              <span className="category-badge">Wall Textures</span>
            </div>
            <div className="category-body">
              <h3 className="category-title">Designer Wallpapers</h3>
              <p className="category-desc">
                Imported textured European wallpapers, metallic gold inlays, seamless 3D fabric wall coverings, and moisture-resistant finishes.
              </p>
              <div className="category-tags">
                <span className="cat-pill">Gold Inlays</span>
                <span className="cat-pill">3D Textures</span>
                <span className="cat-pill">Seamless Finish</span>
                <span className="cat-pill">Anti-Moisture</span>
              </div>
              <a href="#projects" className="category-btn" onClick={() => handleCategoryClick('wallpapers')}>
                <span>View Wallpaper Projects</span>
                <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
