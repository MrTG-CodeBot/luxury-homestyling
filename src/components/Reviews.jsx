import React, { useState, useEffect, useRef } from 'react';
import { getFeedback, addFeedback, INITIAL_FIREBASE_FEEDBACK } from '../services/db';

export default function Reviews() {
  const [reviews, setReviews] = useState(INITIAL_FIREBASE_FEEDBACK || []);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    service: 'Curtains & Drapes',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    loadReviews();
  }, []);

  // Update items per view based on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1100) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadReviews = async () => {
    try {
      const data = await getFeedback(false);
      if (data && data.length > 0) {
        setReviews(data);
      }
    } catch (err) {
      console.warn('Feedback loading note:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert('Please fill out your name and review message.');
      return;
    }

    setSubmitting(true);
    try {
      await addFeedback({
        ...formData,
        location: formData.location || 'Kerala',
        rating
      });
      alert('Thank you! Your testimonial has been submitted and will appear once approved by our styling team.');
      setShowModal(false);
      setFormData({ name: '', location: '', service: 'Curtains & Drapes', message: '' });
      setRating(5);
      loadReviews();
    } catch (err) {
      alert('Failed to submit testimonial. Please try again or reach out on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-padding" id="reviews">
      <div className="container">
        <div className="testimonials-header">
          <div>
            <div className="section-tag"><i className="fas fa-star"></i> Verified Experiences</div>
            <h2 className="section-title">What Our <span className="gold-gradient-text">Clients Say</span></h2>
            <p className="section-subtitle" style={{ margin: 0 }}>
              Real reviews from luxury homeowners and interior architects across Kerala.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Carousel Navigation Arrows */}
            {reviews.length > itemsPerView && (
              <div className="carousel-nav-buttons">
                <button 
                  className="carousel-arrow-btn" 
                  onClick={prevSlide}
                  aria-label="Previous Testimonial"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="carousel-arrow-btn" 
                  onClick={nextSlide}
                  aria-label="Next Testimonial"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
            
            <button className="btn-outline-gold" onClick={() => setShowModal(true)}>
              <i className="fas fa-pen-fancy"></i> Share Your Experience
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--gold-primary)' }}>
            <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '14px', display: 'block' }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading verified client testimonials...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--gold-border)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <i className="fas fa-comments" style={{ fontSize: '2.5rem', color: 'var(--gold-primary)', marginBottom: '16px', display: 'block' }}></i>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#FFF', marginBottom: '8px' }}>Be the First to Review</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Have you worked with Luxury Homestyling for your curtains, blinds, or flooring? Share your story with us.
            </p>
            <button className="btn-gold" onClick={() => setShowModal(true)}>
              <i className="fas fa-pen"></i>
              <span>Write a Testimonial</span>
            </button>
          </div>
        )}

        {/* Reviews Left / Right Carousel Slider */}
        {!loading && reviews.length > 0 && (
          <div 
            className="reviews-carousel-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="reviews-carousel-track"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              {reviews.map(r => {
                const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
                const initial = (r.name || 'C').charAt(0).toUpperCase();
                return (
                  <div 
                    key={r.id} 
                    className="reviews-carousel-item"
                    style={{ flex: `0 0 ${100 / itemsPerView}%`, maxWidth: `${100 / itemsPerView}%` }}
                  >
                    <div className="review-card">
                      <i className="fas fa-quote-right review-quote-icon"></i>
                      <div className="star-rating">{stars}</div>
                      <p className="review-text">"{r.message}"</p>
                      <div className="review-author">
                        <div className="author-avatar">{initial}</div>
                        <div>
                          <div className="author-name">{r.name}</div>
                          <div className="author-meta">
                            {r.location || 'Kerala'} • <span style={{ color: 'var(--gold-primary)' }}>{r.service || 'Home Styling'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Dots Pagination */}
            {reviews.length > itemsPerView && (
              <div className="reviews-dots-container">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`carousel-dot ${currentIndex === idx ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showModal && (
        <div className="modal-backdrop show" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <i className="fas fa-gem" style={{ fontSize: '2rem', color: 'var(--gold-primary)', marginBottom: '8px', display: 'block' }}></i>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF' }}>Share Your Experience</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Your feedback helps us continuously deliver Kerala's finest homestyling craftsmanship.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="fbName">Your Name *</label>
                <input 
                  type="text" 
                  id="fbName" 
                  className="form-control" 
                  placeholder="e.g. Dr. Thomas Mathew" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="fbLocation">District / City</label>
                  <input 
                    type="text" 
                    id="fbLocation" 
                    className="form-control" 
                    placeholder="e.g. Kochi, Ernakulam" 
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="fbService">Service Availed</label>
                  <select 
                    id="fbService" 
                    className="form-control"
                    value={formData.service}
                    onChange={e => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="Curtains & Drapes">Curtains &amp; Drapes</option>
                    <option value="Motorized Blinds">Motorized Blinds</option>
                    <option value="Carpets & Rugs">Carpets &amp; Rugs</option>
                    <option value="Designer Wallpapers">Designer Wallpapers</option>
                    <option value="Complete Villa Package">Complete Villa Package</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">Your Rating *</label>
                <div className="star-select-wrap">
                  {[1, 2, 3, 4, 5].map(val => (
                    <i 
                      key={val} 
                      className={`fas fa-star ${(hoverRating || rating) >= val ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(val)}
                    ></i>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="fbMessage">Your Review / Testimonial *</label>
                <textarea 
                  id="fbMessage" 
                  className="form-control" 
                  rows="4" 
                  placeholder="Tell us about the fabric quality, measurement precision, or installation experience..." 
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-gold" 
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting Your Testimonial...' : 'Submit Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

