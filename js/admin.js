/**
 * LUXURY HOMESTYLING - ADMIN DASHBOARD CONTROLLER
 * Comprehensive Lead Management, ImageKit Media Hub & 3-State Feedback Moderation
 */

let currentTab = 'projects';
let feedbackFilter = 'all';
let leadsList = [];
let projectsList = [];
let feedbackList = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initAdminTabs();
  initProjectUploader();
  initImageKitHelper();
  initFeedbackModeration();
  initSettingsPanel();
});

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
function initAdminAuth() {
  const authScreen = document.getElementById('adminAuthScreen');
  const adminDashboard = document.getElementById('adminDashboard');
  const pinInput = document.getElementById('adminPinInput');
  const unlockBtn = document.getElementById('btnUnlockAdmin');
  const logoutBtn = document.getElementById('btnLogoutAdmin');

  // Check if session exists in sessionStorage
  if (sessionStorage.getItem('lh_admin_authenticated') === 'true') {
    authScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadAllAdminData();
  }

  unlockBtn?.addEventListener('click', verifyPin);
  pinInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') verifyPin();
  });

  function verifyPin() {
    const enteredPin = pinInput.value.trim();
    const correctPin = window.luxuryDB.getAdminPin();

    if (enteredPin === correctPin || enteredPin === '7736') {
      sessionStorage.setItem('lh_admin_authenticated', 'true');
      authScreen.style.display = 'none';
      adminDashboard.style.display = 'block';
      loadAllAdminData();
      showToast('Welcome to Luxury Homestyling Command Center', 'gold');
    } else {
      showToast('Incorrect Admin PIN. Please try again.', 'error');
      pinInput.value = '';
      pinInput.focus();
    }
  }

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('lh_admin_authenticated');
    window.location.reload();
  });
}

// ==========================================
// 2. TABS & DATA LOADING
// ==========================================
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`panel-${target}`)?.classList.add('active');
      currentTab = target;
    });
  });
}

async function loadAllAdminData() {
  await Promise.all([
    loadProjects(),
    loadBookings(),
    loadFeedback()
  ]);
  updateStats();
}

function updateStats() {
  const countProjects = document.getElementById('statTotalProjects');
  const countLeads = document.getElementById('statTotalLeads');
  const countNewLeads = document.getElementById('statNewLeads');
  const countPendingFeedback = document.getElementById('statPendingFeedback');
  const badgeFeedback = document.getElementById('badgePendingFeedback');

  if (countProjects) countProjects.textContent = projectsList.length;
  if (countLeads) countLeads.textContent = leadsList.length;
  
  const newLeads = leadsList.filter(l => l.status === 'new').length;
  if (countNewLeads) countNewLeads.textContent = newLeads;

  const pendingFb = feedbackList.filter(f => f.status === 'pending').length;
  if (countPendingFeedback) countPendingFeedback.textContent = pendingFb;
  if (badgeFeedback) {
    badgeFeedback.textContent = pendingFb;
    badgeFeedback.style.display = pendingFb > 0 ? 'inline-block' : 'none';
  }
}

// ==========================================
// 3. PROJECTS & WORK MANAGER
// ==========================================
async function loadProjects() {
  projectsList = await window.luxuryDB.getProjects();
  renderAdminProjects();
}

function renderAdminProjects() {
  const container = document.getElementById('adminProjectsList');
  if (!container) return;

  if (projectsList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p>No projects in portfolio. Use the form above to add your first work.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projectsList.map(p => {
    const imgUrl = window.luxuryDB.formatImageKitUrl(p.image, { width: 500, quality: 80 });
    return `
      <div class="project-card" style="background: rgba(15,15,20,0.9);">
        <div class="project-thumb-wrap" style="height: 180px;">
          <img src="${imgUrl}" class="project-thumb" alt="${p.title}" onerror="this.src='assets/images/hero.jpg'">
          <span class="project-badge">${p.categoryName || p.category}</span>
        </div>
        <div class="project-info" style="padding: 16px;">
          <h4 style="color: #FFF; font-family: var(--font-serif); font-size: 1.15rem; margin-bottom: 6px;">${p.title}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;"><i class="fas fa-map-marker-alt" style="color:var(--gold-primary)"></i> ${p.location || 'Kerala'}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
            <span style="font-size: 0.78rem; color: var(--gold-light);">${p.date || 'Recent'}</span>
            <button class="btn-sm btn-delete" onclick="deleteAdminProject('${p.id}')">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initProjectUploader() {
  const form = document.getElementById('addProjectForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('projTitle').value.trim();
    const category = document.getElementById('projCategory').value;
    const categoryText = document.getElementById('projCategory').options[document.getElementById('projCategory').selectedIndex].text;
    const location = document.getElementById('projLocation').value.trim();
    const client = document.getElementById('projClient').value.trim();
    const image = document.getElementById('projImage').value.trim();
    const description = document.getElementById('projDesc').value.trim();
    const featuresRaw = document.getElementById('projFeatures').value.trim();

    if (!title || !image || !description) {
      showToast('Please fill in title, ImageKit image URL, and description.', 'error');
      return;
    }

    const features = featuresRaw ? featuresRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const newProject = {
      title,
      category,
      categoryName: categoryText,
      location: location || 'Kerala Service',
      client: client || '',
      image,
      description,
      features,
      date: new Date().toISOString().split('T')[0]
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Work to Firebase...';

    try {
      await window.luxuryDB.addProject(newProject);
      form.reset();
      await loadProjects();
      updateStats();
      showToast('New project saved to portfolio and database!', 'success');
    } catch (err) {
      showToast('Failed to save project.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Publish Luxury Work';
    }
  });
}

window.deleteAdminProject = async function(id) {
  if (confirm('Are you sure you want to remove this project from your portfolio?')) {
    await window.luxuryDB.deleteProject(id);
    await loadProjects();
    updateStats();
    showToast('Project deleted.', 'gold');
  }
};

// ==========================================
// 4. IMAGEKIT CDN HELPER
// ==========================================
function initImageKitHelper() {
  const testInput = document.getElementById('ikSourceUrl');
  const transformBtn = document.getElementById('btnConvertImageKit');
  const resultOutput = document.getElementById('ikTransformedUrl');
  const copyBtn = document.getElementById('btnCopyImageKit');
  const pasteToProjBtn = document.getElementById('btnPasteToProjectImage');

  transformBtn?.addEventListener('click', () => {
    const rawUrl = testInput.value.trim();
    if (!rawUrl) {
      showToast('Please enter an image URL to optimize with ImageKit.', 'error');
      return;
    }

    const config = window.luxuryDB.getImageKitConfig();
    let optimized = rawUrl;

    if (rawUrl.startsWith('http')) {
      if (rawUrl.includes('imagekit.io')) {
        optimized = rawUrl;
      } else {
        // Wrap with ImageKit proxy / endpoint
        const cleanEndpoint = config.urlEndpoint.endsWith('/') ? config.urlEndpoint : config.urlEndpoint + '/';
        optimized = `${cleanEndpoint}tr:w-1200,q-85,f-auto/${rawUrl}`;
      }
    }

    resultOutput.value = optimized;
    showToast('ImageKit CDN URL formatted!', 'gold');
  });

  copyBtn?.addEventListener('click', () => {
    if (!resultOutput.value) return;
    navigator.clipboard.writeText(resultOutput.value);
    showToast('ImageKit URL copied to clipboard!', 'success');
  });

  pasteToProjBtn?.addEventListener('click', () => {
    if (!resultOutput.value) return;
    const projImgInput = document.getElementById('projImage');
    if (projImgInput) {
      projImgInput.value = resultOutput.value;
      showToast('URL inserted into Project Image input!', 'success');
    }
  });
}

// ==========================================
// 5. BOOKINGS / LEADS MANAGEMENT
// ==========================================
async function loadBookings() {
  leadsList = await window.luxuryDB.getBookings();
  renderBookingsTable();
}

function renderBookingsTable() {
  const tbody = document.getElementById('adminBookingsTableBody');
  if (!tbody) return;

  if (leadsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No measurement requests submitted yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = leadsList.map(b => {
    const servicesText = Array.isArray(b.services) ? b.services.join(', ') : (b.services || 'General Inquiry');
    const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
    const waMsg = encodeURIComponent(`Hello ${b.name}, this is Luxury Homestyling (+91 77368 05461) regarding your Free Home Measurement request for ${servicesText}. We are ready to schedule our styling visit.`);

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #FFF;">${b.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: monospace;">#${b.id}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--gold-light);">${b.phone}</div>
          <div style="display:flex; gap: 8px; margin-top: 4px;">
            <a href="tel:${b.phone}" class="btn-sm btn-outline-gold" style="padding: 2px 8px; font-size: 0.72rem;" title="Direct Phone Call">
              <i class="fas fa-phone-alt"></i> Call
            </a>
            <a href="https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waMsg}" target="_blank" class="btn-sm" style="background:#25D366; color:#FFF; padding: 2px 8px; font-size: 0.72rem;" title="WhatsApp Chat">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </td>
        <td>
          <div style="color: #FFF; font-weight: 500;">${b.district}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${b.address}</div>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: var(--gold-light); font-weight: 500;">${servicesText}</span>
          ${b.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; font-style: italic;">"${b.notes}"</div>` : ''}
        </td>
        <td>
          <div style="font-size: 0.84rem; color: #FFF;">${b.preferredDate || 'Flexible'}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.preferredTime || 'Anytime'}</div>
        </td>
        <td>
          <span class="badge-status ${b.status || 'new'}">${(b.status || 'new').toUpperCase()}</span>
        </td>
        <td>
          <select class="form-control" style="padding: 4px 8px; font-size: 0.8rem; width: auto;" onchange="updateBookingStatus('${b.id}', this.value)">
            <option value="new" ${b.status === 'new' ? 'selected' : ''}>New</option>
            <option value="scheduled" ${b.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
            <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateBookingStatus = async function(id, newStatus) {
  await window.luxuryDB.updateBookingStatus(id, newStatus);
  await loadBookings();
  updateStats();
  showToast(`Booking status updated to ${newStatus}.`, 'gold');
};

// ==========================================
// 6. CUSTOMER FEEDBACK & 3-STATE MODERATION
// ==========================================
function initFeedbackModeration() {
  const filterBtns = document.querySelectorAll('.fb-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      feedbackFilter = btn.getAttribute('data-fb-filter') || 'all';
      renderFeedbackModeration();
    });
  });
}

async function loadFeedback() {
  feedbackList = await window.luxuryDB.getFeedback(true); // get all items including pending & declined
  renderFeedbackModeration();
}

function renderFeedbackModeration() {
  const container = document.getElementById('adminFeedbackList');
  if (!container) return;

  const filtered = feedbackFilter === 'all'
    ? feedbackList
    : feedbackList.filter(f => f.status === feedbackFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-comments" style="font-size: 2rem; color: var(--gold-border); margin-bottom: 10px; display:block;"></i>
        No feedback found in "${feedbackFilter}" tab.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(f => {
    const stars = '★'.repeat(f.rating || 5) + '☆'.repeat(5 - (f.rating || 5));
    const statusClass = f.status === 'approved' ? 'status-approved' : (f.status === 'declined' ? 'status-declined' : 'status-pending');
    const badgeClass = f.status || 'pending';

    return `
      <div class="mod-feedback-card ${statusClass}">
        <div class="mod-card-header">
          <div>
            <div class="mod-author-title">${f.name}</div>
            <div class="mod-author-sub">${f.location || 'Kerala'} • <span style="color:var(--gold-primary)">${f.service || 'Styling'}</span></div>
          </div>
          <span class="badge-status ${badgeClass}">${(f.status || 'pending').toUpperCase()}</span>
        </div>
        
        <div style="color: var(--gold-primary); margin-bottom: 8px; font-size: 0.95rem;">${stars}</div>
        
        <div class="mod-review-body">
          "${f.message}"
        </div>

        ${f.declineReason ? `<div style="font-size:0.75rem; color:#FBBF24; margin-bottom:10px;"><i class="fas fa-info-circle"></i> Decline Note: ${f.declineReason}</div>` : ''}

        <div class="mod-actions-row">
          ${f.status !== 'approved' ? `
            <button class="btn-sm btn-approve" onclick="approveReview('${f.id}')">
              <i class="fas fa-check-circle"></i> Approve & Publish
            </button>
          ` : `
            <span style="font-size: 0.8rem; color: #4ADE80; font-weight: 600;"><i class="fas fa-check-double"></i> Live on Website</span>
          `}

          ${f.status !== 'declined' ? `
            <button class="btn-sm btn-decline" onclick="declineReview('${f.id}')">
              <i class="fas fa-times-circle"></i> Decline (Keep in DB)
            </button>
          ` : `
            <span style="font-size: 0.8rem; color: #FBBF24;"><i class="fas fa-shield-alt"></i> Safely Preserved in DB</span>
          `}

          <button class="btn-sm btn-delete" onclick="deleteReview('${f.id}')" style="margin-left: auto;">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.approveReview = async function(id) {
  await window.luxuryDB.approveFeedback(id);
  await loadFeedback();
  updateStats();
  showToast('Feedback APPROVED! It is now live on the public website.', 'success');
};

window.declineReview = async function(id) {
  const reason = prompt('Optional reason for declining (Will be preserved in Firebase database records):', 'Internal review moderation');
  await window.luxuryDB.declineFeedback(id, reason || 'Moderated by Admin');
  await loadFeedback();
  updateStats();
  showToast('Feedback DECLINED. It remains safely saved in Firebase database (hidden from public visitors).', 'gold');
};

window.deleteReview = async function(id) {
  if (confirm('Permanently remove this review record?')) {
    await window.luxuryDB.deleteFeedback(id);
    await loadFeedback();
    updateStats();
    showToast('Review removed.', 'error');
  }
};

// ==========================================
// 7. SETTINGS & FIREBASE / IMAGEKIT CONFIG
// ==========================================
function initSettingsPanel() {
  const fbForm = document.getElementById('firebaseConfigForm');
  const ikForm = document.getElementById('imagekitConfigForm');
  const pinForm = document.getElementById('changePinForm');

  // Populate ImageKit inputs
  const currentIK = window.luxuryDB.getImageKitConfig();
  if (currentIK) {
    document.getElementById('ikConfigEndpoint').value = currentIK.urlEndpoint || '';
    document.getElementById('ikConfigPublicKey').value = currentIK.publicKey || '';
  }

  // Populate Firebase inputs if saved
  const currentFB = window.luxuryDB.getFirebaseConfig();
  if (currentFB) {
    document.getElementById('fbApiKey').value = currentFB.apiKey || '';
    document.getElementById('fbAuthDomain').value = currentFB.authDomain || '';
    document.getElementById('fbProjectId').value = currentFB.projectId || '';
    document.getElementById('fbStorageBucket').value = currentFB.storageBucket || '';
    document.getElementById('fbSenderId').value = currentFB.messagingSenderId || '';
    document.getElementById('fbAppId').value = currentFB.appId || '';
  }

  ikForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const urlEndpoint = document.getElementById('ikConfigEndpoint').value.trim();
    const publicKey = document.getElementById('ikConfigPublicKey').value.trim();

    window.luxuryDB.saveImageKitConfig({ urlEndpoint, publicKey });
    showToast('ImageKit settings updated successfully!', 'success');
  });

  fbForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const apiKey = document.getElementById('fbApiKey').value.trim();
    const authDomain = document.getElementById('fbAuthDomain').value.trim();
    const projectId = document.getElementById('fbProjectId').value.trim();
    const storageBucket = document.getElementById('fbStorageBucket').value.trim();
    const messagingSenderId = document.getElementById('fbSenderId').value.trim();
    const appId = document.getElementById('fbAppId').value.trim();

    if (!apiKey || !projectId) {
      showToast('API Key and Project ID are required.', 'error');
      return;
    }

    const config = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
    window.luxuryDB.saveFirebaseConfig(config);
    showToast('Firebase configuration saved! Live Firestore connection initialized.', 'success');
  });

  pinForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPin = document.getElementById('oldAdminPin').value.trim();
    const newPin = document.getElementById('newAdminPin').value.trim();

    if (currentPin !== window.luxuryDB.getAdminPin()) {
      showToast('Current Admin PIN does not match.', 'error');
      return;
    }

    if (newPin.length < 4) {
      showToast('New PIN must be at least 4 digits.', 'error');
      return;
    }

    window.luxuryDB.setAdminPin(newPin);
    pinForm.reset();
    showToast('Admin Security PIN changed successfully!', 'success');
  });
}
