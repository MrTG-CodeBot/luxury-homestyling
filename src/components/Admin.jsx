import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getProjects, addProject, deleteProject,
  getBookings, updateBookingStatus, deleteBooking,
  getFeedback, approveFeedback, declineFeedback, deleteFeedback,
  getAdminPin, setAdminPin
} from '../services/db';
import { uploadToImageKit, formatImageKitUrl } from '../services/imagekit';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('lh_admin_authenticated') === 'true'
  );
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [feedbackFilter, setFeedbackFilter] = useState('all');

  // Data states
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Project Form & Edit State
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'curtains',
    location: '',
    client: '',
    image: '',
    description: '',
    features: ''
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // PIN change
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setLoading(true);
    const [pData, lData, fData] = await Promise.all([
      getProjects(),
      getBookings(),
      getFeedback(true)
    ]);
    setProjects(pData);
    setLeads(lData);
    setFeedbackList(fData);
    setLoading(false);
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    const correctPin = await getAdminPin();
    if (pinInput === correctPin) {
      sessionStorage.setItem('lh_admin_authenticated', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Admin Security PIN. Please try again.');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('lh_admin_authenticated');
    setIsAuthenticated(false);
  };

  // Image Upload Handler (Supports Single or Multiple Files)
  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    setUploadProgress(`Uploading 1 of ${files.length}...`);
    try {
      const newUrls = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading & converting ${i + 1} of ${files.length} to ImageKit...`);
        const file = files[i];
        const res = await uploadToImageKit(file, `project_${Date.now()}_${i}`);
        const finalUrl = res.optimizedUrl || res.url;
        if (finalUrl) {
          newUrls.push(finalUrl);
        }
      }

      setUploadedImages(prev => {
        const combined = [...prev, ...newUrls];
        if (combined.length > 0) {
          setNewProject(p => ({ ...p, image: combined[0] }));
        }
        return combined;
      });

      alert(`Successfully uploaded and converted ${newUrls.length} image(s) to ImageKit CDN!`);
    } catch (err) {
      console.error(err);
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  const removeUploadedImage = (indexToRemove) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setNewProject(p => ({
        ...p,
        image: updated.length > 0 ? updated[0] : ''
      }));
      return updated;
    });
  };

  const handleStartEditProject = (project) => {
    setEditingProjectId(project.id);
    const cat = (project.category || 'curtains').toLowerCase();
    const validCategory = ['curtains', 'blinds', 'carpets', 'wallpapers'].includes(cat) ? cat : 'curtains';
    
    setNewProject({
      title: project.title || '',
      category: validCategory,
      location: project.location || '',
      client: project.client || '',
      image: project.image || '',
      description: project.description || '',
      features: Array.isArray(project.features) ? project.features.join(', ') : (project.features || '')
    });
    
    const imgs = project.images && project.images.length > 0 
      ? project.images 
      : (project.image ? [project.image] : []);
    setUploadedImages(imgs);

    // Smooth scroll to project form
    setTimeout(() => {
      const formCard = document.getElementById('projectFormCard');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setNewProject({
      title: '',
      category: 'curtains',
      location: '',
      client: '',
      image: '',
      description: '',
      features: ''
    });
    setUploadedImages([]);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const finalImage = newProject.image || (uploadedImages.length > 0 ? uploadedImages[0] : '');

    if (!newProject.title || !finalImage || !newProject.description) {
      alert('Please provide title, at least one project image, and description.');
      return;
    }

    const categoryNames = {
      curtains: 'Curtains & Drapes',
      blinds: 'Motorized Blinds',
      carpets: 'Carpets & Rugs',
      wallpapers: 'Designer Wallpapers'
    };

    const featuresArr = newProject.features 
      ? newProject.features.split(',').map(s => s.trim()).filter(Boolean) 
      : [];

    const isEditing = Boolean(editingProjectId);

    await addProject({
      ...newProject,
      id: isEditing ? editingProjectId : undefined,
      image: finalImage,
      images: uploadedImages.length > 0 ? uploadedImages : [finalImage],
      categoryName: categoryNames[newProject.category] || newProject.category,
      features: featuresArr,
      date: newProject.date || new Date().toISOString().split('T')[0]
    });

    alert(isEditing ? 'Masterpiece project updated successfully!' : 'New masterpiece project published live to Portfolio!');
    handleCancelEdit();
    loadAllData();
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Delete this project from portfolio?')) {
      if (editingProjectId === id) {
        handleCancelEdit();
      }
      await deleteProject(id);
      loadAllData();
    }
  };

  // Leads
  const handleStatusChange = async (id, status) => {
    await updateBookingStatus(id, status);
    loadAllData();
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Delete this measurement request?')) {
      await deleteBooking(id);
      loadAllData();
    }
  };

  // Feedback 3-State Moderation
  const handleApproveFeedback = async (id) => {
    await approveFeedback(id);
    alert('Feedback approved! It is now live on the public website.');
    loadAllData();
  };

  const handleDeclineFeedback = async (id) => {
    const reason = window.prompt('Decline reason (Archived for admin records):', 'Reviewed by admin');
    await declineFeedback(id, reason || 'Declined by Admin');
    alert('Feedback declined. It remains safely archived in records (hidden from public visitors).');
    loadAllData();
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm('Permanently remove this review?')) {
      await deleteFeedback(id);
      loadAllData();
    }
  };

  // PIN Change
  const handleChangePin = async (e) => {
    e.preventDefault();
    const currentPin = await getAdminPin();
    if (oldPin !== currentPin) {
      alert('Current PIN is incorrect.');
      return;
    }
    if (newPin.length < 4) {
      alert('New PIN must be at least 4 digits.');
      return;
    }
    await setAdminPin(newPin);
    alert('Admin Security PIN updated successfully!');
    setOldPin('');
    setNewPin('');
  };

  const pendingCount = feedbackList.filter(f => f.status === 'pending').length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  const filteredFeedback = feedbackFilter === 'all'
    ? feedbackList
    : feedbackList.filter(f => f.status === feedbackFilter);

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-screen">
        <div className="auth-card">
          <h2 className="auth-title">ADMIN CONTROL CENTER</h2>
          <p className="auth-subtitle">Enter your Master Security PIN to access project uploads, lead management, and feedback moderation.</p>
          
          <form onSubmit={handleUnlock}>
            <div style={{ marginBottom: '24px' }}>
              <input 
                type="password" 
                className="form-control pin-input" 
                maxLength={6} 
                placeholder="••••" 
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                autoFocus 
              />
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', padding: '14px' }}>
              <i className="fas fa-unlock-alt"></i> Access Command Center
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              <i className="fas fa-arrow-left"></i> Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Interface
  return (
    <div className="admin-body">
      <header className="admin-header">
        <div className="admin-header-main">
          <Link to="/" className="admin-header-brand">
            <div>
              <span className="admin-header-title">LUXURY HOMESTYLING</span>
              <span className="admin-header-badge"><i className="fas fa-shield-alt"></i> ADMIN</span>
            </div>
          </Link>

          <div className="admin-actions">
            <button onClick={handleLogout} className="btn-sm btn-delete" title="Logout of Admin">
              <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
            </button>
          </div>
        </div>

        <nav className="admin-nav-tabs" aria-label="Admin Navigation Tabs">
          <button 
            className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <i className="fas fa-folder-open"></i>
            <span className="tab-text">Projects</span>
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <i className="fas fa-ruler-combined"></i>
            <span className="tab-text">Leads</span>
            {newLeadsCount > 0 && <span className="tab-badge">{newLeadsCount}</span>}
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <i className="fas fa-comments"></i>
            <span className="tab-text">Feedback</span>
            {pendingCount > 0 && <span className="tab-badge" style={{ background: '#EF4444', color: '#FFF' }}>{pendingCount}</span>}
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-sliders-h"></i>
            <span className="tab-text">Settings</span>
          </button>
        </nav>
      </header>

      <main className="admin-main">
        {/* Top Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-layer-group"></i></div>
            <div>
              <div className="stat-val">{projects.length}</div>
              <div className="stat-label">Published Projects</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div>
              <div className="stat-val">{leads.length}</div>
              <div className="stat-label">Measurement Requests</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-star-half-alt"></i></div>
            <div>
              <div className="stat-val">{pendingCount}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-cloud-check"></i></div>
            <div>
              <div className="stat-val" style={{ fontSize: '1.1rem', color: 'var(--gold-light)' }}>Cloud Synchronized</div>
              <div className="stat-label">Real-time Connected</div>
            </div>
          </div>
        </div>

        {/* TAB 1: PROJECTS & WORKS */}
        {activeTab === 'projects' && (
          <section className="admin-panel active">
            {/* Add / Edit Project Form with Integrated Multi-Image Upload */}
            <div className="admin-form-card" id="projectFormCard" style={{ border: editingProjectId ? '2px solid var(--gold-primary)' : '1px solid var(--gold-border)' }}>
              <div className="panel-header-row">
                <div>
                  <h3 className="panel-title">
                    <i className={editingProjectId ? "fas fa-edit" : "fas fa-plus-circle"}></i> 
                    {editingProjectId ? `Edit Luxury Work: ${newProject.title || 'Untitled'}` : 'Upload New Luxury Work'}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: editingProjectId ? 'var(--gold-light)' : 'var(--text-muted)' }}>
                    {editingProjectId ? `Updating active portfolio item (#${editingProjectId})` : 'Publishes immediately across Kerala portfolio'}
                  </span>
                </div>

                {editingProjectId && (
                  <button 
                    type="button" 
                    className="btn-sm btn-outline-gold" 
                    onClick={handleCancelEdit}
                  >
                    <i className="fas fa-times"></i> Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleAddProject}>
                <div className="booking-form-grid">
                  <div>
                    <label className="form-label" htmlFor="projTitle">Project Title *</label>
                    <input 
                      type="text" 
                      id="projTitle" 
                      className="form-control" 
                      placeholder="e.g. Waterfront Royal Penthouse" 
                      value={newProject.title}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                      required 
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="projCategory">Category *</label>
                    <select 
                      id="projCategory" 
                      className="form-control"
                      value={newProject.category}
                      onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                      required
                    >
                      <option value="curtains">Curtains &amp; Drapes</option>
                      <option value="blinds">Motorized Blinds</option>
                      <option value="carpets">Carpets &amp; Rugs</option>
                      <option value="wallpapers">Designer Wallpapers</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="projLocation">Kerala Location / City *</label>
                    <input 
                      type="text" 
                      id="projLocation" 
                      className="form-control" 
                      placeholder="e.g. Panampilly Nagar, Kochi" 
                      value={newProject.location}
                      onChange={e => setNewProject({ ...newProject, location: e.target.value })}
                      required 
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="projClient">Client / Property Name (Optional)</label>
                    <input 
                      type="text" 
                      id="projClient" 
                      className="form-control" 
                      placeholder="e.g. Dr. K. Joseph Villa" 
                      value={newProject.client}
                      onChange={e => setNewProject({ ...newProject, client: e.target.value })}
                    />
                  </div>

                  {/* Multi/Single Image Uploader converting directly to ImageKit CDN */}
                  <div className="form-group-full">
                    <label className="form-label">
                      <i className="fas fa-cloud-upload-alt" style={{ color: 'var(--gold-primary)', marginRight: '6px' }}></i>
                      Project Images (Select one or multiple images — automatically converted to ImageKit links) *
                    </label>

                    <div style={{
                      border: '2px dashed var(--gold-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 20px',
                      textAlign: 'center',
                      background: 'rgba(212, 175, 55, 0.04)',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleMultipleFilesUpload}
                        disabled={uploadingImage}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <i className="fas fa-images" style={{ fontSize: '2.2rem', color: 'var(--gold-primary)', marginBottom: '10px', display: 'block' }}></i>
                      <div style={{ fontWeight: 600, color: '#FFF', fontSize: '1rem', marginBottom: '4px' }}>
                        Click or Drag &amp; Drop to Choose One or Multiple Photos
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Files will be uploaded and converted into high-speed ImageKit.io CDN links
                      </div>
                      {uploadingImage && (
                        <div style={{ marginTop: '12px', color: 'var(--gold-primary)', fontSize: '0.92rem', fontWeight: 600 }}>
                          <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> {uploadProgress || 'Uploading to ImageKit...'}
                        </div>
                      )}
                    </div>

                    {/* Previews of converted ImageKit images */}
                    {uploadedImages.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gold-light)', marginBottom: '8px', fontWeight: 600 }}>
                          ImageKit Converted Images ({uploadedImages.length}):
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {uploadedImages.map((imgUrl, idx) => (
                            <div key={idx} style={{ 
                              position: 'relative', 
                              width: '90px', 
                              height: '90px', 
                              borderRadius: '8px', 
                              overflow: 'hidden', 
                              border: idx === 0 ? '2px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.2)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                            }}>
                              <img src={imgUrl} alt={`Upload ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {idx === 0 && (
                                <span style={{ position: 'absolute', top: 3, left: 3, background: 'var(--gold-primary)', color: '#000', fontSize: '0.65rem', padding: '1px 5px', fontWeight: 700, borderRadius: '3px' }}>
                                  PRIMARY
                                </span>
                              )}
                              <button 
                                type="button" 
                                onClick={() => removeUploadedImage(idx)}
                                style={{ 
                                  position: 'absolute', 
                                  top: 3, 
                                  right: 3, 
                                  background: 'rgba(239,68,68,0.9)', 
                                  color: '#FFF', 
                                  border: 'none', 
                                  borderRadius: '50%', 
                                  width: '20px', 
                                  height: '20px', 
                                  fontSize: '0.75rem', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center' 
                                }}
                                title="Remove this image"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Or Manual URL input */}
                    <div style={{ marginTop: '12px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Or enter/paste an ImageKit URL directly (e.g. https://ik.imagekit.io/luxuryhome/...)"
                        value={newProject.image}
                        onChange={e => {
                          const val = e.target.value;
                          setNewProject(p => ({ ...p, image: val }));
                          if (val && !uploadedImages.includes(val)) {
                            setUploadedImages([val]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group-full">
                    <label className="form-label" htmlFor="projDesc">Project Description &amp; Styling Details *</label>
                    <textarea 
                      id="projDesc" 
                      className="form-control" 
                      rows={3} 
                      placeholder="Describe the fabrics, motorization, ceiling height, or tailoring technique..." 
                      value={newProject.description}
                      onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group-full">
                    <label className="form-label" htmlFor="projFeatures">Key Highlights / Tags (Comma-separated)</label>
                    <input 
                      type="text" 
                      id="projFeatures" 
                      className="form-control" 
                      placeholder="e.g. Motorized Drapes, Belgian Velvet, Somfy Motor, Double Height" 
                      value={newProject.features}
                      onChange={e => setNewProject({ ...newProject, features: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {editingProjectId && (
                    <button 
                      type="button" 
                      className="btn-outline-gold" 
                      style={{ padding: '12px 24px' }} 
                      onClick={handleCancelEdit}
                    >
                      <i className="fas fa-times"></i> Cancel Edit
                    </button>
                  )}
                  <button type="submit" className="btn-gold" style={{ padding: '12px 32px' }} disabled={uploadingImage}>
                    <i className={editingProjectId ? "fas fa-save" : "fas fa-plus-circle"}></i> 
                    {editingProjectId ? 'Save & Update Work' : 'Publish Luxury Work'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Projects Grid */}
            <div className="panel-header-row">
              <h3 className="panel-title"><i className="fas fa-images"></i> Existing Masterpiece Works ({projects.length})</h3>
            </div>
            <div className="projects-grid">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  className="project-card" 
                  style={{ 
                    background: 'rgba(15,15,20,0.9)', 
                    border: editingProjectId === p.id ? '2px solid var(--gold-primary)' : '1px solid var(--gold-border)' 
                  }}
                >
                  <div className="project-thumb-wrap" style={{ height: '180px' }}>
                    <img 
                      src={formatImageKitUrl(p.image, { width: 500, quality: 80 })} 
                      className="project-thumb" 
                      alt={p.title} 
                      onError={(e) => { e.target.src = '/assets/images/hero.jpg'; }}
                    />
                    <span className="project-badge">{p.categoryName || p.category}</span>
                  </div>
                  <div className="project-info" style={{ padding: '16px' }}>
                    <h4 style={{ color: '#FFF', fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '6px' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: 'var(--gold-primary)' }}></i> {p.location || 'Kerala'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold-light)' }}>{p.date || 'Recent'}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-sm btn-edit" 
                          onClick={() => handleStartEditProject(p)} 
                          title="Edit this project"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="btn-sm btn-delete" 
                          onClick={() => handleDeleteProject(p.id)} 
                          title="Delete from portfolio"
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: MEASUREMENT LEADS */}
        {activeTab === 'leads' && (
          <section className="admin-panel active">
            <div className="panel-header-row">
              <div>
                <h3 className="panel-title"><i className="fas fa-ruler-combined"></i> Free Home Measurement Leads ({leads.length})</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Real-time measurement requests submitted by homeowners across Kerala.
                </p>
              </div>
              <button className="btn-sm btn-outline-gold" onClick={loadAllData}>
                <i className="fas fa-sync-alt"></i> Refresh Leads
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client Name &amp; ID</th>
                    <th>Contact &amp; Quick Actions</th>
                    <th>District &amp; Address</th>
                    <th>Services Requested</th>
                    <th>Preferred Date / Time</th>
                    <th>Status</th>
                    <th>Status &amp; Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No measurement requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    leads.map(b => {
                      const servicesText = Array.isArray(b.services) ? b.services.join(', ') : (b.services || 'General Inquiry');
                      const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
                      const waMsg = encodeURIComponent(`Hello ${b.name}, this is Luxury Homestyling (+91 77368 05461) regarding your Free Home Measurement request for ${servicesText}. We are ready to schedule our styling visit.`);

                      return (
                        <tr key={b.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#FFF' }}>{b.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{b.id}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--gold-light)' }}>{b.phone}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <a href={`tel:${b.phone}`} className="btn-sm btn-outline-gold" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                                <i className="fas fa-phone-alt"></i> Call
                              </a>
                              <a 
                                href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waMsg}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn-sm" 
                                style={{ background: '#25D366', color: '#FFF', padding: '2px 8px', fontSize: '0.72rem' }}
                              >
                                <i className="fab fa-whatsapp"></i> WhatsApp
                              </a>
                            </div>
                          </td>
                          <td>
                            <div style={{ color: '#FFF', fontWeight: 500 }}>{b.district}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.address}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 500 }}>{servicesText}</span>
                            {b.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>"{b.notes}"</div>}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.84rem', color: '#FFF' }}>{b.preferredDate || 'Flexible'}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.preferredTime || 'Anytime'}</div>
                          </td>
                          <td>
                            <span className={`badge-status ${b.status || 'new'}`}>{(b.status || 'new').toUpperCase()}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select 
                                className="form-control" 
                                style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                                value={b.status || 'new'}
                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              >
                                <option value="new">New</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button 
                                className="btn-sm btn-delete" 
                                onClick={() => handleDeleteBooking(b.id)}
                                title="Delete lead"
                                style={{ padding: '4px 8px' }}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: FEEDBACK & 3-STATE MODERATION */}
        {activeTab === 'feedback' && (
          <section className="admin-panel active">
            <div className="panel-header-row">
              <div>
                <h3 className="panel-title"><i className="fas fa-comments"></i> Customer Feedback Moderation</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <strong>Approve</strong> to publish live, <strong>Decline</strong> to hide from visitors while safely keeping in records, or <strong>Delete</strong>.
                </p>
              </div>

              <div className="filter-container" style={{ margin: 0 }}>
                <button 
                  className={`filter-btn ${feedbackFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setFeedbackFilter('all')}
                >
                  All Reviews
                </button>
                <button 
                  className={`filter-btn ${feedbackFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFeedbackFilter('pending')}
                >
                  Pending ({pendingCount})
                </button>
                <button 
                  className={`filter-btn ${feedbackFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => setFeedbackFilter('approved')}
                >
                  Approved (Live)
                </button>
                <button 
                  className={`filter-btn ${feedbackFilter === 'declined' ? 'active' : ''}`}
                  onClick={() => setFeedbackFilter('declined')}
                >
                  Declined (In DB)
                </button>
              </div>
            </div>

            <div className="feedback-moderation-grid">
              {filteredFeedback.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No feedback found in "{feedbackFilter}" tab.
                </div>
              ) : (
                filteredFeedback.map(f => {
                  const stars = '★'.repeat(f.rating || 5) + '☆'.repeat(5 - (f.rating || 5));
                  const statusClass = f.status === 'approved' ? 'status-approved' : (f.status === 'declined' ? 'status-declined' : 'status-pending');
                  return (
                    <div key={f.id} className={`mod-feedback-card ${statusClass}`}>
                      <div className="mod-card-header">
                        <div>
                          <div className="mod-author-title">{f.name}</div>
                          <div className="mod-author-sub">{f.location || 'Kerala'} • <span style={{ color: 'var(--gold-primary)' }}>{f.service || 'Styling'}</span></div>
                        </div>
                        <span className={`badge-status ${f.status || 'pending'}`}>{(f.status || 'pending').toUpperCase()}</span>
                      </div>
                      
                      <div style={{ color: 'var(--gold-primary)', marginBottom: '8px', fontSize: '0.95rem' }}>{stars}</div>
                      
                      <div className="mod-review-body">
                        "{f.message}"
                      </div>

                      {f.declineReason && (
                        <div style={{ fontSize: '0.75rem', color: '#FBBF24', marginBottom: '10px' }}>
                          <i className="fas fa-info-circle"></i> Decline Note: {f.declineReason}
                        </div>
                      )}

                      <div className="mod-actions-row">
                        {f.status !== 'approved' ? (
                          <button className="btn-sm btn-approve" onClick={() => handleApproveFeedback(f.id)}>
                            <i className="fas fa-check-circle"></i> Approve &amp; Publish
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 600 }}>
                            <i className="fas fa-check-double"></i> Live on Website
                          </span>
                        )}

                        {f.status !== 'declined' ? (
                          <button className="btn-sm btn-decline" onClick={() => handleDeclineFeedback(f.id)}>
                            <i className="fas fa-times-circle"></i> Decline (Keep in DB)
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#FBBF24' }}>
                            <i className="fas fa-shield-alt"></i> Safely Preserved in DB
                          </span>
                        )}

                        <button className="btn-sm btn-delete" onClick={() => handleDeleteFeedback(f.id)} style={{ marginLeft: 'auto' }}>
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <section className="admin-panel active">
            <div className="admin-form-card" style={{ maxWidth: '540px' }}>
              <h3 className="panel-title" style={{ marginBottom: '16px' }}><i className="fas fa-key"></i> Change Admin Security PIN</h3>
              <form onSubmit={handleChangePin}>
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label" htmlFor="oldAdminPin">Current PIN</label>
                  <input 
                    type="password" 
                    id="oldAdminPin" 
                    className="form-control" 
                    placeholder="••••" 
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" htmlFor="newAdminPin">New PIN (4 to 6 digits)</label>
                  <input 
                    type="password" 
                    id="newAdminPin" 
                    className="form-control" 
                    placeholder="••••" 
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="btn-outline-gold" style={{ width: '100%' }}>
                  Update Admin PIN
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
