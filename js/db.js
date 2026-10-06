/**
 * LUXURY HOMESTYLING - PURE FIREBASE FIRESTORE DB LAYER (VANILLA JS COMPAT)
 * Direct Live Connection to Firebase (luxuryhome-2b8b3)
 */

const DB_KEYS = {
  FIREBASE_CONFIG: 'lh_firebase_config_v1',
  IMAGEKIT_CONFIG: 'lh_imagekit_config_v1',
  ADMIN_PIN: 'lh_admin_pin_v1'
};

class LuxuryDatabase {
  constructor() {
    this.firebaseApp = null;
    this.firestore = null;
    this.isFirebaseReady = false;
    this.initDatabase();
  }

  initDatabase() {
    this.connectFirebase();
  }

  connectFirebase() {
    try {
      const config = window.LUXURY_FIREBASE_CONFIG || this.getFirebaseConfig();
      if (config && config.apiKey && window.firebase) {
        if (!firebase.apps.length) {
          this.firebaseApp = firebase.initializeApp(config);
        } else {
          this.firebaseApp = firebase.app();
        }
        this.firestore = firebase.firestore();
        this.isFirebaseReady = true;
        console.log("⚜️ Live Firebase Firestore connected: luxuryhome-2b8b3");
      }
    } catch (err) {
      console.warn("Firebase initialization warning:", err);
      this.isFirebaseReady = false;
    }
  }

  // =================== PROJECTS API ===================
  async getProjects() {
    if (this.isFirebaseReady && this.firestore) {
      try {
        const snapshot = await this.firestore.collection('lh_projects').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        try {
          const snapshot = await this.firestore.collection('lh_projects').get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (e) {
          console.error("Firestore getProjects error:", e);
          return [];
        }
      }
    }
    return [];
  }

  async addProject(project) {
    const newProj = {
      ...project,
      id: project.id || 'proj-' + Date.now(),
      createdAt: Date.now()
    };

    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_projects').doc(newProj.id).set(newProj);
    }
    return newProj;
  }

  async deleteProject(id) {
    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_projects').doc(id).delete();
    }
    return true;
  }

  // =================== BOOKINGS / LEADS API ===================
  async getBookings() {
    if (this.isFirebaseReady && this.firestore) {
      try {
        const snapshot = await this.firestore.collection('lh_bookings').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        try {
          const snapshot = await this.firestore.collection('lh_bookings').get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (e) {
          console.error("Firestore getBookings error:", e);
          return [];
        }
      }
    }
    return [];
  }

  async addBooking(booking) {
    const newBooking = {
      ...booking,
      id: 'bk-' + Date.now().toString().slice(-6),
      status: 'new',
      createdAt: Date.now()
    };

    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_bookings').doc(newBooking.id).set(newBooking);
    }
    return newBooking;
  }

  async updateBookingStatus(id, status) {
    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_bookings').doc(id).update({ status, updatedAt: Date.now() });
    }
    return true;
  }

  // =================== FEEDBACK MODERATION API ===================
  async getFeedback(includeAll = false) {
    if (this.isFirebaseReady && this.firestore) {
      try {
        let snapshot;
        try {
          snapshot = await this.firestore.collection('lh_feedback').orderBy('createdAt', 'desc').get();
        } catch (e) {
          snapshot = await this.firestore.collection('lh_feedback').get();
        }
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        if (includeAll) {
          return list.filter(f => !f.isDeleted);
        }
        return list.filter(f => f.status === 'approved' && !f.isDeleted);
      } catch (err) {
        console.error("Firestore getFeedback error:", err);
        return [];
      }
    }
    return [];
  }

  async addFeedback(feedback) {
    const newFb = {
      ...feedback,
      id: 'fb-' + Date.now(),
      status: 'pending',
      isDeleted: false,
      createdAt: Date.now()
    };

    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_feedback').doc(newFb.id).set(newFb);
    }
    return newFb;
  }

  async approveFeedback(id) {
    return this.updateFeedbackStatus(id, 'approved');
  }

  async declineFeedback(id, declineReason = '') {
    return this.updateFeedbackStatus(id, 'declined', declineReason);
  }

  async deleteFeedback(id) {
    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_feedback').doc(id).delete();
    }
    return true;
  }

  async updateFeedbackStatus(id, status, declineReason = '') {
    const updatePayload = { status, updatedAt: Date.now() };
    if (declineReason) updatePayload.declineReason = declineReason;

    if (this.isFirebaseReady && this.firestore) {
      await this.firestore.collection('lh_feedback').doc(id).update(updatePayload);
    }
    return true;
  }

  // =================== IMAGEKIT & CONFIG API ===================
  getImageKitConfig() {
    const saved = localStorage.getItem(DB_KEYS.IMAGEKIT_CONFIG);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return window.LUXURY_IMAGEKIT_CONFIG || {
      publicKey: "public_+UakMhQEG9oqkCM3AEsiXKW7SZM=",
      urlEndpoint: "https://ik.imagekit.io/luxuryhome/"
    };
  }

  saveImageKitConfig(config) {
    localStorage.setItem(DB_KEYS.IMAGEKIT_CONFIG, JSON.stringify(config));
  }

  getFirebaseConfig() {
    const saved = localStorage.getItem(DB_KEYS.FIREBASE_CONFIG);
    return saved ? JSON.parse(saved) : (window.LUXURY_FIREBASE_CONFIG || null);
  }

  saveFirebaseConfig(config) {
    localStorage.setItem(DB_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    this.connectFirebase();
  }

  getAdminPin() {
    return localStorage.getItem(DB_KEYS.ADMIN_PIN) || '7736';
  }

  setAdminPin(pin) {
    localStorage.setItem(DB_KEYS.ADMIN_PIN, pin);
  }

  formatImageKitUrl(url, options = { width: 1000, quality: 85 }) {
    if (!url) return '/assets/images/hero.jpg';
    if (url.startsWith('assets/') || url.startsWith('/assets/')) return url;
    if (url.includes('imagekit.io')) {
      if (!url.includes('tr=')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}tr=w-${options.width},q-${options.quality},f-auto`;
      }
      return url;
    }
    return url;
  }
}

// Global Singleton Instance
window.luxuryDB = new LuxuryDatabase();
