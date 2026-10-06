/**
 * LUXURY HOMESTYLING - MAIN APPLICATION LOGIC
 * Curtains • Blinds • Carpets • Wallpapers | All Kerala Service
 * Phone / WhatsApp: +91 77368 05461
 */

const WHATSAPP_NUMBER = '917736805461';
const PHONE_NUMBER = '+917736805461';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProjectsSection();
  initFeedbackSection();
  initBookingForm();
  initModals();
});

// ==========================================
// 1. NAVIGATION & SCROLL
// ==========================================
function initNavigation() {
  const header = document.querySelector('.header-glass');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Drawer Toggle
  const openDrawer = () => {
    mobileDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('show');
    document.body.style.overflow = '';
  };

  mobileToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

// ==========================================
// 2. PORTFOLIO & PROJECTS SECTION
// ==========================================
let currentProjectsList = [];

async function initProjectsSection() {
  const grid = document.getElementById('projectsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!grid) return;

  currentProjectsList = await window.luxuryDB.getProjects();
  renderProjects(currentProjectsList, 'all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      renderProjects(currentProjectsList, filter);
    });
  });
}

function renderProjects(projects, filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const filtered = filter === 'all' 
    ? projects 
    : projects.filter(p => (p.category || '').toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="fas fa-gem" style="font-size: 2.5rem; color: var(--gold-primary); margin-bottom: 12px; display: block;"></i>
        <h3 style="font-family: var(--font-royal); color: var(--gold-light);">No projects in this collection yet</h3>
        <p>Stay tuned as we upload recent Kerala installations.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const formattedImg = window.luxuryDB.formatImageKitUrl(p.image, { width: 800, quality: 85 });
    return `
      <div class="project-card" onclick="openProjectLightbox('${p.id}')">
        <div class="project-thumb-wrap">
          <img src="${formattedImg}" alt="${p.title}" class="project-thumb" loading="lazy" onerror="this.src='assets/images/hero.jpg'">
          <span class="project-badge">${p.categoryName || p.category || 'Luxury Work'}</span>
          <div class="project-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${p.location || 'Kerala'}</span>
          </div>
        </div>
        <div class="project-info">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-brief">${p.description || ''}</p>
          <div class="project-action-row">
            <span class="view-project-link">
              View Specs & Styling <i class="fas fa-arrow-right"></i>
            </span>
            <span style="font-size: 0.78rem; color: var(--gold-light); font-family: var(--font-royal);">
              ${p.client ? `Client: ${p.client}` : 'Verified Project'}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openProjectLightbox = function(id) {
  const project = currentProjectsList.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('projectLightboxModal');
  const imgElem = document.getElementById('lightboxImg');
  const titleElem = document.getElementById('lightboxTitle');
  const catElem = document.getElementById('lightboxCat');
  const locElem = document.getElementById('lightboxLocation');
  const descElem = document.getElementById('lightboxDesc');
  const tagsElem = document.getElementById('lightboxFeatures');
  const whatsappCta = document.getElementById('lightboxWhatsAppBtn');

  if (imgElem) imgElem.src = window.luxuryDB.formatImageKitUrl(project.image, { width: 1200, quality: 90 });
  if (titleElem) titleElem.textContent = project.title;
  if (catElem) catElem.textContent = project.categoryName || project.category || 'Luxury Styling';
  if (locElem) locElem.innerHTML = `<i class="fas fa-map-marker-alt" style="color: var(--gold-primary); margin-right: 6px;"></i> ${project.location || 'All Kerala'}`;
  if (descElem) descElem.textContent = project.description;

  if (tagsElem && project.features) {
    tagsElem.innerHTML = project.features.map(f => `<span class="cat-pill"><i class="fas fa-check" style="color:var(--gold-primary); margin-right: 4px;"></i>${f}</span>`).join('');
  }

  if (whatsappCta) {
    const msg = encodeURIComponent(`Hello Luxury Homestyling! I saw your project "${project.title}" (${project.location || 'Kerala'}). I would like a consultation and free home measurement for similar styling in my home.`);
    whatsappCta.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }

  modal?.classList.add('show');
};

// ==========================================
// 3. FEEDBACK & TESTIMONIALS SECTION
// ==========================================
async function initFeedbackSection() {
  const reviewsContainer = document.getElementById('reviewsContainer');
  if (!reviewsContainer) return;

  const approvedReviews = await window.luxuryDB.getFeedback(false);
  renderFeedback(approvedReviews);

  // Modal Rating selector
  const starIcons = document.querySelectorAll('#feedbackStarSelect i');
  let selectedRating = 5;

  starIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      const val = parseInt(icon.getAttribute('data-val') || '5');
      highlightStars(val);
    });
    icon.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
    });
    icon.addEventListener('click', () => {
      selectedRating = parseInt(icon.getAttribute('data-val') || '5');
      document.getElementById('feedbackRatingInput').value = selectedRating;
      highlightStars(selectedRating);
    });
  });

  function highlightStars(val) {
    starIcons.forEach(i => {
      const starVal = parseInt(i.getAttribute('data-val') || '1');
      if (starVal <= val) {
        i.classList.add('active');
      } else {
        i.classList.remove('active');
      }
    });
  }

  // Handle Feedback Submission
  const feedbackForm = document.getElementById('feedbackForm');
  feedbackForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('fbName').value.trim();
    const location = document.getElementById('fbLocation').value.trim();
    const service = document.getElementById('fbService').value;
    const rating = parseInt(document.getElementById('feedbackRatingInput').value) || 5;
    const message = document.getElementById('fbMessage').value.trim();

    if (!name || !message) {
      showToast('Please fill in your name and feedback message.', 'error');
      return;
    }

    const btn = feedbackForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
      await window.luxuryDB.addFeedback({
        name,
        location: location || 'Kerala',
        service: service || 'Curtains & Blinds',
        rating,
        message
      });

      feedbackForm.reset();
      highlightStars(5);
      closeModal('feedbackModal');
      showToast('Thank you! Your feedback has been submitted for review.', 'gold');
    } catch (err) {
      showToast('Could not submit feedback. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Testimonial';
    }
  });
}

function renderFeedback(reviews) {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p>No client reviews approved yet. Be the first to share your experience!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map(r => {
    const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
    const initial = (r.name || 'C').charAt(0).toUpperCase();

    return `
      <div class="review-card">
        <i class="fas fa-quote-right review-quote-icon"></i>
        <div class="star-rating">${stars}</div>
        <p class="review-text">"${r.message}"</p>
        <div class="review-author">
          <div class="author-avatar">${initial}</div>
          <div>
            <div class="author-name">${r.name}</div>
            <div class="author-meta">${r.location || 'Kerala'} • <span style="color:var(--gold-primary)">${r.service || 'Home Styling'}</span></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 4. FREE HOME MEASUREMENT BOOKING ENGINE
// ==========================================
function initBookingForm() {
  const form = document.getElementById('homeMeasurementForm');
  if (!form) return;

  // Multi-select service pills styling toggle
  const serviceLabels = form.querySelectorAll('.service-check-pill');
  serviceLabels.forEach(label => {
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('bmName').value.trim();
    const phone = document.getElementById('bmPhone').value.trim();
    const address = document.getElementById('bmAddress').value.trim();
    const district = document.getElementById('bmDistrict').value;
    const date = document.getElementById('bmDate').value;
    const time = document.getElementById('bmTime').value;
    const notes = document.getElementById('bmNotes').value.trim();

    // Collect checked services
    const checkedServices = [];
    form.querySelectorAll('input[name="bmService"]:checked').forEach(cb => {
      checkedServices.push(cb.value);
    });

    if (!name || !phone || !address || !district) {
      showToast('Please fill out all required measurement details.', 'error');
      return;
    }

    const submitBtn = document.getElementById('btnSubmitMeasurement');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reserving Slot...';

    const bookingPayload = {
      name,
      phone,
      address,
      district,
      services: checkedServices.length > 0 ? checkedServices : ['Curtains & Blinds'],
      preferredDate: date || 'Earliest available',
      preferredTime: time || 'Morning',
      notes
    };

    try {
      const savedBooking = await window.luxuryDB.addBooking(bookingPayload);

      // Generate WhatsApp formatted message
      const waServices = (bookingPayload.services || []).join(', ');
      const waMsg = encodeURIComponent(
        `*⚜️ NEW HOME MEASUREMENT BOOKING — LUXURY HOMESTYLING ⚜️*\n\n` +
        `*Client Name:* ${name}\n` +
        `*Phone Number:* ${phone}\n` +
        `*District / City:* ${district}\n` +
        `*Address:* ${address}\n` +
        `*Service Required:* ${waServices}\n` +
        `*Preferred Date:* ${bookingPayload.preferredDate}\n` +
        `*Preferred Time:* ${bookingPayload.preferredTime}\n` +
        `*Notes:* ${notes || 'None'}\n\n` +
        `_Booked via Luxury Homestyling Portal_`
      );

      // Show confirmation dialog with WhatsApp button
      const confirmModal = document.getElementById('bookingSuccessModal');
      const refElem = document.getElementById('successBookingRef');
      const waLinkElem = document.getElementById('successWhatsAppDispatchBtn');

      if (refElem) refElem.textContent = `#${savedBooking.id}`;
      if (waLinkElem) {
        waLinkElem.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;
      }

      form.reset();
      serviceLabels.forEach(l => l.classList.remove('selected'));
      confirmModal?.classList.add('show');
      showToast('Free measurement request booked successfully!', 'success');
    } catch (err) {
      showToast('Booking error. Please contact +91 77368 05461 directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Confirm Free Measurement Visit</span> <i class="fas fa-arrow-right"></i>';
    }
  });
}

// ==========================================
// 5. MODAL HELPERS & TOASTS
// ==========================================
function initModals() {
  window.openModal = (id) => {
    document.getElementById(id)?.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = (id) => {
    document.getElementById(id)?.classList.remove('show');
    document.body.style.overflow = '';
  };

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });
}

function showToast(message, type = 'gold') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'gold') icon = 'fa-gem';

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}
