import React, { useState } from 'react';
import { addBooking } from '../services/db';

const WHATSAPP_NUMBER = '917736805461';

export default function FreeMeasurementForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    district: '',
    services: ['Curtains & Drapes', 'Motorized Blinds'],
    preferredDate: '',
    preferredTime: 'Morning (9:30 AM - 1:00 PM)',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [savedBooking, setSavedBooking] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const availableServices = [
    { label: 'Curtains', val: 'Curtains & Drapes', icon: 'fa-scroll' },
    { label: 'Blinds', val: 'Motorized Blinds', icon: 'fa-bars' },
    { label: 'Carpets', val: 'Carpets & Rugs', icon: 'fa-border-all' },
    { label: 'Wallpapers', val: 'Designer Wallpapers', icon: 'fa-paint-roller' },
    { label: 'Full Villa Package', val: 'Complete Villa Package', icon: 'fa-crown' }
  ];

  const handleServiceToggle = (val) => {
    setFormData(prev => {
      const exists = prev.services.includes(val);
      const newServices = exists
        ? prev.services.filter(s => s !== val)
        : [...prev.services, val];
      return { ...prev, services: newServices };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.district) {
      alert('Please fill out all required measurement details.');
      return;
    }

    setLoading(true);
    try {
      const newBooking = await addBooking({
        ...formData,
        preferredDate: formData.preferredDate || 'Earliest Available'
      });
      setSavedBooking(newBooking);
      setShowSuccessModal(true);
      setFormData({
        name: '',
        phone: '',
        address: '',
        district: '',
        services: ['Curtains & Drapes'],
        preferredDate: '',
        preferredTime: 'Morning (9:30 AM - 1:00 PM)',
        notes: ''
      });
    } catch (err) {
      console.error(err);
      alert('Booking error. Please call +91 77368 05461 directly.');
    } finally {
      setLoading(false);
    }
  };

  const waServices = savedBooking ? (savedBooking.services || []).join(', ') : '';
  const waMsg = savedBooking ? encodeURIComponent(
    `*⚜️ NEW HOME MEASUREMENT BOOKING — LUXURY HOMESTYLING ⚜️*\n\n` +
    `*Client Name:* ${savedBooking.name}\n` +
    `*Phone Number:* ${savedBooking.phone}\n` +
    `*District / City:* ${savedBooking.district}\n` +
    `*Address:* ${savedBooking.address}\n` +
    `*Service Required:* ${waServices}\n` +
    `*Preferred Date:* ${savedBooking.preferredDate}\n` +
    `*Preferred Time:* ${savedBooking.preferredTime}\n` +
    `*Notes:* ${savedBooking.notes || 'None'}\n\n` +
    `_Booked via Luxury Homestyling Portal_`
  ) : '';

  return (
    <section className="section-padding booking-section" id="measurement">
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag"><i className="fas fa-calendar-check"></i> Doorstep Consultation</div>
          <h2 className="section-title">Schedule Your <span className="gold-gradient-text">Free Home Measurement</span></h2>
          <p className="section-subtitle">
            Tell us about your home and our Kerala styling consultant will visit with tactile fabric samples and laser measuring equipment at no charge.
          </p>
        </div>

        <div className="booking-card-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="booking-form-grid">
              
              {/* Full Name */}
              <div>
                <label className="form-label" htmlFor="bmName">
                  <i className="fas fa-user" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Full Name *
                </label>
                <input 
                  type="text" 
                  id="bmName" 
                  className="form-control" 
                  placeholder="e.g. Suresh Nambiar" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>

              {/* Phone Number / WhatsApp */}
              <div>
                <label className="form-label" htmlFor="bmPhone">
                  <i className="fas fa-phone-alt" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Phone / WhatsApp Number *
                </label>
                <input 
                  type="tel" 
                  id="bmPhone" 
                  className="form-control" 
                  placeholder="+91 98470 XXXXX" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required 
                />
              </div>

              {/* Kerala District Selector */}
              <div>
                <label className="form-label" htmlFor="bmDistrict">
                  <i className="fas fa-map-marker-alt" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Kerala District *
                </label>
                <select 
                  id="bmDistrict" 
                  className="form-control" 
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  required
                >
                  <option value="" disabled>Select your district</option>
                  <option value="Ernakulam (Kochi)">Ernakulam (Kochi)</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="Kozhikode (Calicut)">Kozhikode (Calicut)</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Kottayam">Kottayam</option>
                  <option value="Kannur">Kannur</option>
                  <option value="Malappuram">Malappuram</option>
                  <option value="Kollam">Kollam</option>
                  <option value="Palakkad">Palakkad</option>
                  <option value="Alappuzha">Alappuzha</option>
                  <option value="Pathanamthitta">Pathanamthitta</option>
                  <option value="Idukki">Idukki</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Kasaragod">Kasaragod</option>
                </select>
              </div>

              {/* Preferred Date */}
              <div>
                <label className="form-label" htmlFor="bmDate">
                  <i className="fas fa-calendar-alt" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Preferred Visit Date
                </label>
                <input 
                  type="date" 
                  id="bmDate" 
                  className="form-control" 
                  value={formData.preferredDate}
                  onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                />
              </div>

              {/* Full Address & Landmark */}
              <div className="form-group-full">
                <label className="form-label" htmlFor="bmAddress">
                  <i className="fas fa-home" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> House Name / Villa Name &amp; Full Address *
                </label>
                <input 
                  type="text" 
                  id="bmAddress" 
                  className="form-control" 
                  placeholder="e.g. Villa 14, Royal Palm Meadows, Near Marine Drive, Kochi" 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required 
                />
              </div>

              {/* Services Checkboxes */}
              <div className="form-group-full">
                <label className="form-label">
                  <i className="fas fa-layer-group" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Services You Require (Select All That Apply):
                </label>
                <div className="services-checkboxes">
                  {availableServices.map((svc, i) => {
                    const isSelected = formData.services.includes(svc.val);
                    return (
                      <div 
                        key={i} 
                        className={`service-check-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleServiceToggle(svc.val)}
                      >
                        <i className={`fas ${svc.icon}`}></i>
                        <span>{svc.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Time & Notes */}
              <div>
                <label className="form-label" htmlFor="bmTime">
                  <i className="fas fa-clock" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Preferred Time Slot
                </label>
                <select 
                  id="bmTime" 
                  className="form-control" 
                  value={formData.preferredTime}
                  onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                >
                  <option value="Morning (9:30 AM - 1:00 PM)">Morning (9:30 AM - 1:00 PM)</option>
                  <option value="Afternoon (1:30 PM - 4:30 PM)">Afternoon (1:30 PM - 4:30 PM)</option>
                  <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="bmNotes">
                  <i className="fas fa-comment-alt" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i> Additional Notes / Windows Count
                </label>
                <input 
                  type="text" 
                  id="bmNotes" 
                  className="form-control" 
                  placeholder="e.g. 5 bedrooms, motorized double height curtain required" 
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

            </div>

            <div className="booking-submit-row">
              <div className="direct-call-hint">
                <i className="fas fa-headset" style={{ color: 'var(--gold-primary)', fontSize: '1.3rem' }}></i>
                <span>Need immediate guidance? Call <a href="tel:+917736805461">+91 77368 05461</a></span>
              </div>
              
              <button 
                type="submit" 
                className="btn-gold" 
                style={{ padding: '15px 36px', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? (
                  <span><i className="fas fa-spinner fa-spin"></i> Reserving Slot...</span>
                ) : (
                  <>
                    <span>Confirm Free Measurement Visit</span>
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      {showSuccessModal && (
        <div className="modal-backdrop show" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-box" style={{ textAlign: 'center', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>&times;</button>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gold-gradient-subtle)', border: '2px solid var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--gold-primary)', fontSize: '2rem' }}>
              <i className="fas fa-check"></i>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#FFF', marginBottom: '8px' }}>
              Appointment Reserved!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Thank you. Your Free Home Measurement request has been recorded with Reference <strong style={{ color: 'var(--gold-light)' }}>#{savedBooking?.id}</strong>.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Our Kerala stylist director will contact you shortly to confirm the exact visit time and bring fabric swatch catalogs.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn-whatsapp" 
                style={{ width: '100%' }}
              >
                <i className="fab fa-whatsapp"></i> Send Booking Confirmation via WhatsApp
              </a>
              <button 
                className="btn-outline-gold" 
                onClick={() => setShowSuccessModal(false)} 
                style={{ width: '100%' }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
