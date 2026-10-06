/**
 * LUXURY HOMESTYLING - UNIFIED SINGLE FULL-STACK SERVER
 * Serves React SPA + Node.js ImageKit Backend API on a SINGLE Port
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initializeApp as initAdminApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Initialize Firebase Admin SDK with serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env
let adminFirestore = null;
const serviceAccountPath = path.join(rootDir, 'serviceAccountKey.json');
try {
  let serviceAccount = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    }
  } else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }

  if (serviceAccount && !getApps().length) {
    initAdminApp({
      credential: cert(serviceAccount)
    });
    adminFirestore = getAdminFirestore();
    console.log('🔥 Firebase Admin SDK initialized successfully');
  }
} catch (err) {
  console.error('Firebase Admin initialization error:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize ImageKit SDK
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_+UakMhQEG9oqkCM3AEsiXKW7SZM=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_Wl6cmsEfoJNlVNjIbyyirr0f1Rk=",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/luxuryhome/"
});

// Configure Multer for in-memory file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30 MB max
});

// ==========================================
// 1. BACKEND API ENDPOINTS
// ==========================================

// Health check route with Firebase connection status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'Luxury Homestyling Kerala',
    service: 'Curtains • Blinds • Carpets • Wallpapers',
    firebase: adminFirestore ? 'connected (luxuryhome-2b8b3)' : 'local-mode',
    mode: 'unified-single-server',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ImageKit Authentication Parameters
app.get('/api/imagekit/auth', (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json(authenticationParameters);
  } catch (error) {
    console.error('ImageKit Auth Error:', error);
    res.status(500).json({ error: 'Failed to generate ImageKit authentication parameters' });
  }
});

// ImageKit Upload Endpoint
app.post('/api/imagekit/upload', upload.single('image'), async (req, res) => {
  try {
    let fileData;
    let fileName = req.body.fileName || `luxury_${Date.now()}.jpg`;

    if (req.file) {
      fileData = req.file.buffer.toString('base64');
      fileName = req.file.originalname || fileName;
    } else if (req.body.file) {
      fileData = req.body.file;
    } else {
      return res.status(400).json({ error: 'No image file or base64 data provided' });
    }

    const folder = req.body.folder || '/luxury-homestyling-projects/';
    const tags = req.body.tags ? req.body.tags.split(',') : ['luxury', 'kerala'];

    const uploadResponse = await imagekit.upload({
      file: fileData,
      fileName: fileName,
      folder: folder,
      tags: tags,
      useUniqueFileName: true
    });

    const optimizedUrl = imagekit.url({
      src: uploadResponse.url,
      transformation: [{
        width: 1200,
        quality: 85,
        format: 'auto'
      }]
    });

    res.json({
      success: true,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      url: uploadResponse.url,
      optimizedUrl: optimizedUrl,
      thumbnailUrl: uploadResponse.thumbnailUrl
    });
  } catch (error) {
    console.error('ImageKit Upload Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ImageKit upload failed'
    });
  }
});

// ==========================================
// 1.1 FIREBASE FIRESTORE API: PROJECTS
// ==========================================

app.get('/api/projects', async (req, res) => {
  try {
    if (!adminFirestore) return res.json({ success: true, projects: [] });
    const snap = await adminFirestore.collection('lh_projects').orderBy('createdAt', 'desc').get();
    const projects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, projects });
  } catch (error) {
    try {
      const snap = await adminFirestore.collection('lh_projects').get();
      const projects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      res.json({ success: true, projects });
    } catch (err2) {
      console.error('Firebase Admin get projects error:', err2);
      res.status(500).json({ success: false, error: err2.message });
    }
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = req.body;
    const projId = project.id || 'proj-' + Date.now();
    const newProj = {
      ...project,
      id: projId,
      createdAt: project.createdAt || Date.now()
    };
    if (adminFirestore) {
      await adminFirestore.collection('lh_projects').doc(projId).set(newProj, { merge: true });
      console.log('🔥 [Firebase Firestore] Saved project:', projId, '-', newProj.title || 'Untitled');
    }
    res.json({ success: true, project: newProj });
  } catch (error) {
    console.error('Firebase Admin add project error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (adminFirestore) {
      await adminFirestore.collection('lh_projects').doc(id).delete();
      console.log('🔥 [Firebase Firestore] Deleted project:', id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Firebase Admin delete project error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 1.2 FIREBASE FIRESTORE API: BOOKINGS / LEADS
// ==========================================

app.get('/api/bookings', async (req, res) => {
  try {
    if (!adminFirestore) return res.json({ success: true, bookings: [] });
    const snap = await adminFirestore.collection('lh_bookings').orderBy('createdAt', 'desc').get();
    let bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filter out mock names
    bookings = bookings.filter(b => 
      b.id !== 'bk-101' && 
      b.id !== 'bk-102' && 
      b.name !== 'Suresh Kumar' && 
      b.name !== 'Neetha Kurian'
    );
    res.json({ success: true, bookings });
  } catch (error) {
    try {
      const snap = await adminFirestore.collection('lh_bookings').get();
      let bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .filter(b => 
          b.id !== 'bk-101' && 
          b.id !== 'bk-102' && 
          b.name !== 'Suresh Kumar' && 
          b.name !== 'Neetha Kurian'
        );
      res.json({ success: true, bookings });
    } catch (err2) {
      console.error('Firebase Admin get bookings error:', err2);
      res.status(500).json({ success: false, error: err2.message });
    }
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = req.body;
    const bookingId = booking.id || 'bk-' + Date.now().toString().slice(-6);
    const newBooking = {
      ...booking,
      id: bookingId,
      status: booking.status || 'new',
      createdAt: booking.createdAt || Date.now()
    };
    if (adminFirestore) {
      await adminFirestore.collection('lh_bookings').doc(bookingId).set(newBooking, { merge: true });
      console.log('🔥 [Firebase Firestore] Saved Free Home Measurement Lead:', bookingId, '-', newBooking.name, '(', newBooking.phone, ')');
    }
    res.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error('Firebase Admin add booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: Date.now() };
    if (adminFirestore) {
      await adminFirestore.collection('lh_bookings').doc(id).set(updates, { merge: true });
      console.log('🔥 [Firebase Firestore] Updated Booking Status:', id, updates);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Firebase Admin update booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (adminFirestore) {
      await adminFirestore.collection('lh_bookings').doc(id).delete();
      console.log('🔥 [Firebase Firestore] Deleted Booking Lead:', id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Firebase Admin delete booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 1.3 FIREBASE FIRESTORE API: FEEDBACK & REVIEWS
// ==========================================

const INITIAL_REVIEWS = [
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

app.get('/api/feedback', async (req, res) => {
  try {
    if (!adminFirestore) return res.json({ success: true, feedback: INITIAL_REVIEWS });
    const snap = await adminFirestore.collection('lh_feedback').get();
    let feedback = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (feedback.length === 0) {
      // Auto seed
      for (const item of INITIAL_REVIEWS) {
        await adminFirestore.collection('lh_feedback').doc(item.id).set(item);
      }
      feedback = INITIAL_REVIEWS;
      console.log('🔥 [Firebase Firestore] Seeded initial luxury reviews');
    }
    feedback.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Firebase Admin get feedback error:', error);
    res.json({ success: true, feedback: INITIAL_REVIEWS });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const item = req.body;
    const feedbackId = item.id || 'fb-' + Date.now();
    const newFb = {
      ...item,
      id: feedbackId,
      status: item.status || 'pending',
      isDeleted: false,
      createdAt: item.createdAt || Date.now()
    };
    if (adminFirestore) {
      await adminFirestore.collection('lh_feedback').doc(feedbackId).set(newFb, { merge: true });
      console.log('🔥 [Firebase Firestore] Saved Feedback Review:', feedbackId, '-', newFb.name);
    }
    res.json({ success: true, feedback: newFb });
  } catch (error) {
    console.error('Firebase Admin add feedback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: Date.now() };
    if (adminFirestore) {
      await adminFirestore.collection('lh_feedback').doc(id).set(updates, { merge: true });
      console.log('🔥 [Firebase Firestore] Updated Feedback Review:', id, updates);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Firebase Admin update feedback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (adminFirestore) {
      await adminFirestore.collection('lh_feedback').doc(id).delete();
      console.log('🔥 [Firebase Firestore] Deleted Feedback Review:', id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Firebase Admin delete feedback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 1.4 FIREBASE FIRESTORE API: SETTINGS / PIN
// ==========================================

app.get('/api/settings/pin', async (req, res) => {
  try {
    if (!adminFirestore) return res.json({ success: true, pin: '7736' });
    const doc = await adminFirestore.collection('lh_settings').doc('admin_config').get();
    const pin = (doc.exists && doc.data().pin) ? doc.data().pin : '7736';
    res.json({ success: true, pin });
  } catch (error) {
    res.json({ success: true, pin: '7736' });
  }
});

app.post('/api/settings/pin', async (req, res) => {
  try {
    const { pin } = req.body;
    if (adminFirestore && pin) {
      await adminFirestore.collection('lh_settings').doc('admin_config').set({
        pin,
        updatedAt: Date.now()
      }, { merge: true });
      console.log('🔥 [Firebase Firestore] Updated Admin PIN to:', pin);
    }
    res.json({ success: true, pin });
  } catch (error) {
    console.error('Firebase Admin update PIN error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. STATIC ASSETS & REACT SPA SERVING
// ==========================================

// Serve static assets folder
app.use('/assets', express.static(path.join(rootDir, 'assets')));

// Serve Vite compiled React production bundle (dist/)
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for all other routes (React Router support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist does not exist yet, inform with a friendly message
  app.get('/', (req, res) => {
    res.send('<h1>Building Luxury Homestyling React app... Please run "npm run build"</h1>');
  });
}

// Start Unified Server when run directly
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`⚜️  LUXURY HOMESTYLING UNIFIED SERVER IS RUNNING`);
    console.log(`🌐  Website & React App: http://localhost:${PORT}`);
    console.log(`🛡️  Admin Control Center: http://localhost:${PORT}/ashik`);
    console.log(`⚡  Node.js ImageKit API:  http://localhost:${PORT}/api/health`);
    console.log('================================================================');
  });
}

export default app;
