import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/db';
import { formatImageKitUrl } from '../services/imagekit';

const WHATSAPP_NUMBER = '917736805461';

export default function Projects({ activeCategory, setActiveCategory }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects from Firebase:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filter = activeCategory || 'all';

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => (p.category || '').toLowerCase() === filter.toLowerCase());

  return (
    <section className="section-padding" id="projects" style={{ background: 'rgba(11, 11, 15, 0.6)' }}>
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag"><i className="fas fa-camera"></i> Live Portfolio</div>
          <h2 className="section-title">Our Masterpiece <span className="gold-gradient-text">Kerala Installations</span></h2>
          <p className="section-subtitle">
            Explore recent bespoke installations delivered to luxury villas, seaside mansions, and designer apartments across Kerala.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-container">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveCategory('all')}
          >
            All Masterpieces
          </button>
          <button 
            className={`filter-btn ${filter === 'curtains' ? 'active' : ''}`} 
            onClick={() => setActiveCategory('curtains')}
          >
            Curtains &amp; Drapes
          </button>
          <button 
            className={`filter-btn ${filter === 'blinds' ? 'active' : ''}`} 
            onClick={() => setActiveCategory('blinds')}
          >
            Motorized Blinds
          </button>
          <button 
            className={`filter-btn ${filter === 'carpets' ? 'active' : ''}`} 
            onClick={() => setActiveCategory('carpets')}
          >
            Carpets &amp; Rugs
          </button>
          <button 
            className={`filter-btn ${filter === 'wallpapers' ? 'active' : ''}`} 
            onClick={() => setActiveCategory('wallpapers')}
          >
            Wallpapers
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gold-primary)' }}>
            <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '16px', display: 'block' }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading curated Kerala installations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--gold-border)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <i className="fas fa-images" style={{ fontSize: '2.5rem', color: 'var(--gold-primary)', marginBottom: '16px', display: 'block' }}></i>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', marginBottom: '8px' }}>
              No Project Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
              {filter === 'all' 
                ? 'No installations currently found. Check back soon or contact our design team.'
                : `No project found under the "${filter}" category.`}
            </p>
            <a href="#measurement" className="btn-gold">
              <span>Book Free Measurement</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="projects-grid">
            {filteredProjects.map(p => {
              const formattedImg = formatImageKitUrl(p.image, { width: 800, quality: 85 });
              return (
                <div 
                  key={p.id} 
                  className="project-card" 
                  onClick={() => setSelectedProject(p)}
                >
                  <div className="project-thumb-wrap">
                    <img 
                      src={formattedImg} 
                      alt={p.title} 
                      className="project-thumb" 
                      loading="lazy" 
                      onError={(e) => { e.target.src = '/assets/images/hero.jpg'; }}
                    />
                    <span className="project-badge">{p.categoryName || p.category || 'Luxury Work'}</span>
                    <div className="project-location">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{p.location || 'Kerala'}</span>
                    </div>
                  </div>
                  <div className="project-info">
                    <h3 className="project-title">{p.title}</h3>
                    <p className="project-brief">{p.description || ''}</p>
                    <div className="project-action-row">
                      <span className="view-project-link">
                        View Specs &amp; Styling <i className="fas fa-arrow-right"></i>
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold-light)', fontFamily: 'var(--font-royal)' }}>
                        {p.client ? `Client: ${p.client}` : 'Verified Project'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Luxury Project Showcase Lightbox Modal */}
      {selectedProject && (
        <div className="modal-backdrop show" onClick={() => setSelectedProject(null)}>
          <div className="modal-box luxury-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn" 
              onClick={() => setSelectedProject(null)}
              aria-label="Close Showcase"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="luxury-lightbox-grid">
              {/* Left: Cinematic Image Gallery Column */}
              <div className="lightbox-gallery-col">
                <div className="lightbox-hero-img-wrap">
                  <img 
                    src={formatImageKitUrl(selectedProject.image, { width: 1200, quality: 90 })} 
                    alt={selectedProject.title} 
                    className="lightbox-hero-img" 
                  />
                  <div className="lightbox-hero-overlay"></div>
                  <span className="lightbox-hero-badge">
                    <i className="fas fa-crown" style={{ marginRight: '6px', color: 'var(--gold-primary)' }}></i>
                    {selectedProject.categoryName || selectedProject.category || 'Luxury Installation'}
                  </span>
                </div>

                {/* Multiple Images Thumbnail Strip (if available) */}
                {selectedProject.images && selectedProject.images.length > 1 && (
                  <div className="lightbox-thumbs-strip">
                    {selectedProject.images.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        className={`lightbox-thumb-item ${selectedProject.image === imgUrl ? 'active' : ''}`}
                        onClick={() => setSelectedProject(prev => ({ ...prev, image: imgUrl }))}
                      >
                        <img src={formatImageKitUrl(imgUrl, { width: 200, quality: 80 })} alt={`View angle ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Architectural Specifications & Inquiry Column */}
              <div className="lightbox-details-col">
                <div className="lightbox-details-scroll">
                  
                  {/* Top Metadata Tags */}
                  <div className="lightbox-meta-header">
                    <span className="section-tag" style={{ margin: 0 }}>
                      {selectedProject.categoryName || selectedProject.category}
                    </span>
                    <span className="lightbox-location-tag">
                      <i className="fas fa-map-marker-alt"></i>
                      {selectedProject.location || 'All Kerala'}
                    </span>
                  </div>

                  {/* Masterpiece Title */}
                  <h2 className="lightbox-title">
                    {selectedProject.title}
                  </h2>

                  {/* Project Overview Story */}
                  {selectedProject.description && (
                    <div className="lightbox-desc-box">
                      <h4 className="lightbox-section-heading">
                        <i className="fas fa-align-left"></i> Styling Concept &amp; Execution
                      </h4>
                      <p className="lightbox-desc-text">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}

                  {/* Key Specifications */}
                  {selectedProject.features && selectedProject.features.length > 0 && (
                    <div className="lightbox-specs-box">
                      <h4 className="lightbox-section-heading">
                        <i className="fas fa-layer-group"></i> Key Specifications &amp; Features
                      </h4>
                      <div className="lightbox-features-grid">
                        {selectedProject.features.map((f, i) => (
                          <div key={i} className="lightbox-feature-pill">
                            <i className="fas fa-check-circle"></i>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Assurance Badges */}
                  <div className="lightbox-trust-row">
                    <div className="lightbox-trust-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>5-Year Motor Warranty</span>
                    </div>
                    <div className="lightbox-trust-item">
                      <i className="fas fa-ruler-combined"></i>
                      <span>Laser-Measured Fit</span>
                    </div>
                    <div className="lightbox-trust-item">
                      <i className="fas fa-truck"></i>
                      <span>Kerala Doorstep Service</span>
                    </div>
                  </div>

                </div>

                {/* Fixed Bottom Action Call-To-Action Row */}
                <div className="lightbox-actions-footer">
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Luxury Homestyling! I am interested in your project "${selectedProject.title}" in ${selectedProject.location || 'Kerala'}. I would like to schedule a free home measurement visit with fabric samples.`)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-whatsapp lightbox-wa-btn"
                  >
                    <i className="fab fa-whatsapp"></i> Inquire on WhatsApp
                  </a>
                  <a 
                    href="#measurement" 
                    onClick={() => setSelectedProject(null)} 
                    className="btn-gold lightbox-book-btn"
                  >
                    <i className="fas fa-calendar-check"></i> Book Free Measurement
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
