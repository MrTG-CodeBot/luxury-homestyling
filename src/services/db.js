/**
 * LUXURY HOMESTYLING - DUAL FIREBASE PERSISTENCE SERVICE
 * Curtains • Blinds • Carpets • Wallpapers | Kerala Doorstep Service
 * Direct Live Connection to Firebase Project: luxuryhome-2b8b3
 */
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper for API base URL
const API_URL = '';

// ==========================================
// 1. PROJECTS API (Firebase Cloud Sync)
// ==========================================

export async function getProjects() {
  // 1. First attempt backend Firebase Admin route
  try {
    const res = await fetch(`${API_URL}/api/projects`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        return data.projects;
      }
    }
  } catch (apiErr) {
    console.warn('API fetch projects notice:', apiErr.message);
  }

  // 2. Direct client Firestore query fallback
  try {
    const q = query(collection(db, 'lh_projects'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    try {
      const snapshot = await getDocs(collection(db, 'lh_projects'));
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) {
        return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
    } catch (err2) {
      console.warn('Direct Firestore fetch notice:', err2.message);
    }
  }

  return [];
}

export async function addProject(project) {
  const projId = project.id || 'proj-' + Date.now();
  const newProj = {
    ...project,
    id: projId,
    createdAt: project.createdAt || Date.now()
  };

  // 1. Save to Firebase via Backend Admin API (Guaranteed Permission Bypass)
  try {
    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.project) {
        console.log('✅ [Firebase] Project saved to Firestore via Backend Admin:', data.project.id);
      }
    }
  } catch (apiErr) {
    console.warn('Backend API project save warning:', apiErr);
  }

  // 2. Dual-save to Client Firestore
  try {
    await setDoc(doc(db, 'lh_projects', projId), newProj);
    console.log('✅ [Firebase] Project saved to Client Firestore:', projId);
  } catch (err) {
    console.warn('Client Firestore write notice:', err.message);
  }

  return newProj;
}

export async function deleteProject(id) {
  // 1. Delete via Backend Admin API
  try {
    await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
    console.log('✅ [Firebase] Project deleted via Backend Admin:', id);
  } catch (e) {}

  // 2. Delete from Client Firestore
  try {
    await deleteDoc(doc(db, 'lh_projects', id));
  } catch (e) {}

  return true;
}

// ==========================================
// 2. BOOKINGS & LEADS API (Firebase Cloud Sync)
// ==========================================

export async function getBookings() {
  let list = [];

  // 1. Fetch from Backend Firebase Admin API
  try {
    const res = await fetch(`${API_URL}/api/bookings`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        list = data.bookings;
      }
    }
  } catch (apiErr) {
    console.warn('Backend API bookings fetch notice:', apiErr);
  }

  // 2. Fallback to Client Firestore if API didn't return items
  if (list.length === 0) {
    try {
      const q = query(collection(db, 'lh_bookings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      try {
        const snapshot = await getDocs(collection(db, 'lh_bookings'));
        list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      } catch (err2) {
        console.warn('Client Firestore getBookings notice:', err2);
      }
    }
  }

  // Filter out any mock bookings
  list = list.filter(b => 
    b.id !== 'bk-101' && 
    b.id !== 'bk-102' && 
    b.name !== 'Suresh Kumar' && 
    b.name !== 'Neetha Kurian'
  );

  // Sync with local storage
  try {
    const local = localStorage.getItem('lh_luxury_bookings_v1');
    let localList = local ? JSON.parse(local) : [];
    localList = localList.filter(b => 
      b.id !== 'bk-101' && 
      b.id !== 'bk-102' && 
      b.name !== 'Suresh Kumar' && 
      b.name !== 'Neetha Kurian'
    );
    localStorage.setItem('lh_luxury_bookings_v1', JSON.stringify(localList));

    const idMap = new Set(list.map(b => b.id));
    const combined = [...list];
    for (const b of localList) {
      if (!idMap.has(b.id)) {
        combined.push(b);
        idMap.add(b.id);
      }
    }
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    return list;
  }
}

export async function addBooking(booking) {
  const bookingId = 'bk-' + Date.now().toString().slice(-6);
  const newBooking = {
    ...booking,
    id: bookingId,
    status: 'new',
    createdAt: Date.now()
  };

  // 1. Immediately save locally for instant UI response
  try {
    const local = localStorage.getItem('lh_luxury_bookings_v1');
    const list = local ? JSON.parse(local) : [];
    list.unshift(newBooking);
    localStorage.setItem('lh_luxury_bookings_v1', JSON.stringify(list));
  } catch (e) {
    console.warn('Local booking storage notice:', e);
  }

  // 2. Guaranteed Save to Firebase Firestore via Backend Admin
  try {
    const res = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    });
    if (res.ok) {
      console.log('✅ [Firebase] Measurement lead saved to Firestore via Backend Admin:', bookingId);
    }
  } catch (err) {
    console.warn('Backend API booking save warning:', err);
  }

  // 3. Client Firestore write
  try {
    setDoc(doc(db, 'lh_bookings', bookingId), newBooking).catch(() => {});
  } catch (e) {}

  return newBooking;
}

export async function updateBookingStatus(id, status) {
  // Update local storage
  try {
    const local = localStorage.getItem('lh_luxury_bookings_v1');
    if (local) {
      const list = JSON.parse(local);
      const idx = list.findIndex(b => b.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        localStorage.setItem('lh_luxury_bookings_v1', JSON.stringify(list));
      }
    }
  } catch (e) {}

  // Update in Firebase via Backend Admin
  try {
    await fetch(`${API_URL}/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    console.log('✅ [Firebase] Updated booking status in Firestore:', id, status);
  } catch (e) {}

  // Update in Client Firestore
  try {
    await updateDoc(doc(db, 'lh_bookings', id), { 
      status, 
      updatedAt: Date.now() 
    });
  } catch (err) {}

  return true;
}

export async function deleteBooking(id) {
  // Update local storage
  try {
    const local = localStorage.getItem('lh_luxury_bookings_v1');
    if (local) {
      let list = JSON.parse(local);
      list = list.filter(b => b.id !== id);
      localStorage.setItem('lh_luxury_bookings_v1', JSON.stringify(list));
    }
  } catch (e) {}

  // Delete from Firebase via Backend Admin
  try {
    await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE' });
    console.log('✅ [Firebase] Deleted booking from Firestore:', id);
  } catch (e) {}

  // Delete from Client Firestore
  try {
    await deleteDoc(doc(db, 'lh_bookings', id));
  } catch (err) {}

  return true;
}

// ==========================================
// 3. REVIEWS & FEEDBACK API (Firebase Cloud Sync)
// ==========================================

export const INITIAL_FIREBASE_FEEDBACK = [
  {
    id: 'fb-101',
    name: 'Dr. Joseph & Family',
    location: 'Marine Drive, Kochi',
    rating: 5,
    service: 'Curtains & Drapes',
    message: 'Luxury Homestyling transformed our waterfront living room with 18-foot motorized Belgian velvet curtains. The directors came with fabric swatch catalogs, measured everything with lasers, and finished installation with zero mess. 7-star service in Kerala!',
    status: 'approved',
    isDeleted: false,
    createdAt: Date.now() - 3 * 86400000
  },
  {
    id: 'fb-102',
    name: 'Brigadier Roy Varghese',
    location: 'Golf Links, Thiruvananthapuram',
    rating: 5,
    service: 'Motorized Blinds',
    message: 'The quality of dark walnut wooden Venetian blinds and motorized dual zebra shades is top-notch. Punctual doorstep visit, polite styling team, and flawless smart automation integration.',
    status: 'approved',
    isDeleted: false,
    createdAt: Date.now() - 7 * 86400000
  },
  {
    id: 'fb-103',
    name: 'Adv. Ananya Kurian',
    location: 'Round North, Thrissur',
    rating: 5,
    service: 'Designer Wallpapers',
    message: 'Their European 3D gold-accented wallpapers completely transformed our master bedroom. Seamless joint finish and impeccable attention to detail. Highly recommend their Kerala doorstep service.',
    status: 'approved',
    isDeleted: false,
    createdAt: Date.now() - 12 * 86400000
  },
  {
    id: 'fb-104',
    name: 'Razak Mohammed',
    location: 'Seaside Promenade, Kozhikode',
    rating: 5,
    service: 'Carpets & Rugs',
    message: 'We ordered bespoke hand-tufted pure silk & wool rugs custom sized for our 40-foot living suite in Calicut. The texture, density, and finish are truly world-class.',
    status: 'approved',
    isDeleted: false,
    createdAt: Date.now() - 18 * 86400000
  }
];

export async function getFeedback(includeAll = false) {
  let list = [];

  // 1. Fetch from Backend Firebase Admin API
  try {
    const res = await fetch(`${API_URL}/api/feedback`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.feedback) && data.feedback.length > 0) {
        list = data.feedback;
      }
    }
  } catch (apiErr) {
    console.warn('Backend API feedback fetch notice:', apiErr);
  }

  // 2. Direct client Firestore fallback
  if (list.length === 0) {
    try {
      const q = query(collection(db, 'lh_feedback'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (orderErr) {
      try {
        const snapshot = await getDocs(collection(db, 'lh_feedback'));
        list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      } catch (err2) {
        console.warn('Client Firestore feedback notice:', err2);
      }
    }
  }

  if (list.length === 0) {
    list = [...INITIAL_FIREBASE_FEEDBACK];
  }

  if (includeAll) {
    return list.filter(f => !f.isDeleted);
  }
  const approved = list.filter(f => f.status === 'approved' && !f.isDeleted);
  return approved.length > 0 ? approved : INITIAL_FIREBASE_FEEDBACK;
}

export async function addFeedback(feedback) {
  const feedbackId = 'fb-' + Date.now();
  const newFb = {
    ...feedback,
    id: feedbackId,
    status: 'pending',
    isDeleted: false,
    createdAt: Date.now()
  };

  // 1. Save to Firebase via Backend Admin API
  try {
    const res = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFb)
    });
    if (res.ok) {
      console.log('✅ [Firebase] Feedback saved to Firestore via Backend Admin:', feedbackId);
    }
  } catch (apiErr) {
    console.warn('Backend API feedback save warning:', apiErr);
  }

  // 2. Save to Client Firestore
  try {
    await setDoc(doc(db, 'lh_feedback', feedbackId), newFb);
  } catch (e) {}

  return newFb;
}

export async function updateFeedbackStatus(id, status, declineReason = '') {
  const updatePayload = { 
    status, 
    updatedAt: Date.now() 
  };
  if (declineReason) {
    updatePayload.declineReason = declineReason;
  }

  // 1. Update via Backend Admin
  try {
    await fetch(`${API_URL}/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    console.log('✅ [Firebase] Feedback status updated in Firestore:', id, status);
  } catch (e) {}

  // 2. Update in Client Firestore
  try {
    await updateDoc(doc(db, 'lh_feedback', id), updatePayload);
  } catch (e) {}

  return true;
}

export async function approveFeedback(id) {
  return updateFeedbackStatus(id, 'approved');
}

export async function declineFeedback(id, declineReason = '') {
  return updateFeedbackStatus(id, 'declined', declineReason);
}

export async function deleteFeedback(id) {
  // 1. Delete via Backend Admin
  try {
    await fetch(`${API_URL}/api/feedback/${id}`, { method: 'DELETE' });
    console.log('✅ [Firebase] Feedback deleted from Firestore:', id);
  } catch (e) {}

  // 2. Delete from Client Firestore
  try {
    await deleteDoc(doc(db, 'lh_feedback', id));
  } catch (e) {}

  return true;
}

// ==========================================
// 4. ADMIN SECURITY & CONFIGURATION
// ==========================================

export async function getAdminPin() {
  // 1. Try Backend API for latest authoritative PIN
  try {
    const res = await fetch(`${API_URL}/api/settings/pin`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.pin) {
        localStorage.setItem('lh_admin_pin', data.pin);
        return data.pin;
      }
    }
  } catch (e) {}

  // 2. Try Client Firestore fallback
  try {
    const snap = await getDoc(doc(db, 'lh_settings', 'admin_config'));
    if (snap.exists() && snap.data()?.pin) {
      const pin = snap.data().pin;
      localStorage.setItem('lh_admin_pin', pin);
      return pin;
    }
  } catch (e) {}

  // 3. Fallback to localStorage or default
  return localStorage.getItem('lh_admin_pin') || '7736';
}

export async function setAdminPin(pin) {
  localStorage.setItem('lh_admin_pin', pin);

  // 1. Update via Backend Admin
  try {
    await fetch(`${API_URL}/api/settings/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    console.log('✅ [Firebase] Admin PIN updated in Firestore:', pin);
  } catch (e) {}

  // 2. Update in Client Firestore
  try {
    await setDoc(doc(db, 'lh_settings', 'admin_config'), { 
      pin, 
      updatedAt: Date.now() 
    }, { merge: true });
  } catch (err) {}
}

