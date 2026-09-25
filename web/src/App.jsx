import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle, AlertTriangle, User, Calendar, Award,
  Users, DollarSign, Upload, FileText, Lock, ChevronRight,
  ExternalLink, Sparkles, RefreshCw, LogOut, Check, X,
  Smartphone, Monitor, Eye, Briefcase, Camera, ArrowLeft
} from 'lucide-react';

export default function App() {
  // Global Auth & Session state
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'

  // Navigation tab
  const [activeTab, setActiveTab] = useState('committees'); // 'committees' | 'events' | 'profile'
  const [authStep, setAuthStep] = useState('login'); // 'login' | 'step1' | 'verifying' | 'step2'

  // Data collections
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  // Onboarding registration state
  const [regFullName, setRegFullName] = useState('Rohan Sharma');
  const [regEmail, setRegEmail] = useState('rohan.sharma@college.edu');
  const [regUsername, setRegUsername] = useState('rohan_student');
  const [regPassword, setRegPassword] = useState('Password123!');
  const [regRole, setRegRole] = useState('student');
  const [cardImage, setCardImage] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=700&auto=format&fit=crop&q=80');
  const [ocrStatus, setOcrStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-09-22');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventAchievements, setNewEventAchievements] = useState('');
  const [newEventAttendees, setNewEventAttendees] = useState('320');
  const [newEventRevenue, setNewEventRevenue] = useState('45000');
  const [mediaList, setMediaList] = useState([
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000'
  ]);
  const [newMediaInput, setNewMediaInput] = useState('');
  const [rbacError, setRbacError] = useState(null);

  // Notification Banner
  const [notification, setNotification] = useState(null);

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial load
  useEffect(() => {
    fetchCommittees();
    fetchEvents();
    fetchTags();
    // Default fast login as Rohan for immediate demonstration
    handleQuickLogin('rohan_student');
  }, []);

  const fetchCommittees = async () => {
    try {
      const res = await fetch('/api/committees');
      const data = await res.json();
      if (data.committees) setCommittees(data.committees);
    } catch (e) {
      console.warn('Could not fetch committees:', e);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events/feed');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.warn('Could not fetch events:', e);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (data.tags) setAvailableTags(data.tags);
    } catch (e) {
      console.warn('Could not fetch tags:', e);
    }
  };

  const handleQuickLogin = async (username) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'Password123!' })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setSessionExpiresAt(data.expires_at);
        showNotice(`Signed in as ${data.user.full_name} (${data.user.role})`);
      } else {
        showNotice(data.error || 'Login failed', 'error');
      }
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // OCR Verification Call
  const handleRunOcr = async () => {
    setIsScanning(true);
    setOcrStatus(null);
    try {
      const res = await fetch('/api/auth/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_email: regEmail,
          customOcrText: `
            STATE INSTITUTE OF ENGINEERING & SCIENCE
            OFFICIAL STUDENT CARD
            Name: ${regFullName}
            Roll No: 2024CS08421
            Enrollment No: EN982341
            Validity: 2024 - 2028
            College Domain: ${regEmail}
          `
        })
      });
      const data = await res.json();
      if (data.verified) {
        setOcrStatus(data.details);
        showNotice('OCR Passed: Valid College ID & Enrollment detected!');
      } else {
        setOcrStatus(data.details || { valid: false, error: data.error });
        showNotice(data.error, 'error');
      }
    } catch (e) {
      showNotice(e.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Complete Step 2 Registration
  const handleRegisterStep2 = async () => {
    try {
      const res = await fetch('/api/auth/register/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regFullName,
          college_email: regEmail,
          username: regUsername,
          password: regPassword,
          id_card_url: cardImage,
          role: regRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setSessionExpiresAt(data.expires_at);
        setAuthStep('login');
        showNotice(`Welcome ${data.user.full_name}! Account created & verified.`);
      } else {
        showNotice(data.error, 'error');
      }
    } catch (e) {
      showNotice(e.message, 'error');
    }
  };

  // 45-day Session Expiry Simulator
  const handleSimulateExpiry = async () => {
    setShowExpiryModal(true);
  };

  const handleTestTokenRefresh = async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      const data = await res.json();
      if (res.ok) {
        setAccessToken(data.access_token);
        showNotice('✓ Session token refreshed (45-day TTL active)');
      } else {
        setShowExpiryModal(true);
      }
    } catch (e) {
      setShowExpiryModal(true);
    }
  };

  // Upload CV PDF Simulation
  const handleUploadCv = async () => {
    try {
      const res = await fetch('/api/users/me/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          cv_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          file_name: 'Verified_Resume_2026.pdf'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        showNotice('CV uploaded and timestamped successfully!');
      }
    } catch (e) {
      showNotice(e.message, 'error');
    }
  };

  // Toggle user tag
  const handleToggleTag = async (tagName) => {
    if (!currentUser) return;
    const currentTagNames = (currentUser.tags || []).map(t => t.name);
    let updated;
    if (currentTagNames.includes(tagName)) {
      updated = currentTagNames.filter(t => t !== tagName);
    } else {
      updated = [...currentTagNames, tagName];
    }

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ tags: updated })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        showNotice('Skills and interests updated');
      }
    } catch (e) {
      showNotice(e.message, 'error');
    }
  };

  // Create Event Recap (RBAC secured)
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setRbacError(null);

    const statsPayload = {
      attendees: parseInt(newEventAttendees, 10) || 0,
      revenue: parseInt(newEventRevenue, 10) || 0
    };

    try {
      const res = await fetch(`/api/events/committees/${selectedCommittee.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: newEventTitle,
          event_date: newEventDate,
          description: newEventDesc,
          achievements: newEventAchievements,
          stats: statsPayload,
          media_urls: mediaList
        })
      });

      const data = await res.json();

      if (res.ok) {
        showNotice('✓ Event recap successfully created under authorized credentials!');
        setIsCreatingEvent(false);
        fetchEvents();
        // Load committee events again
        handleSelectCommittee(selectedCommittee.id);
      } else {
        setRbacError(data.error || 'RBAC Access Denied: Authorized committee email required.');
      }
    } catch (err) {
      setRbacError(err.message);
    }
  };

  const handleSelectCommittee = async (id) => {
    try {
      const res = await fetch(`/api/committees/${id}/departments`);
      const data = await res.json();
      setSelectedCommittee({
        ...data.committee,
        departments: data.departments
      });
      // also fetch its events
      const evRes = await fetch(`/api/events/committees/${id}/events`);
      const evData = await evRes.json();
      setSelectedCommittee(prev => ({
        ...prev,
        events: evData.events || []
      }));
    } catch (e) {
      console.warn('Failed to load committee detail:', e);
    }
  };

  // Calculate if user can edit currently selected committee
  const canEditCommittee = currentUser && (
    currentUser.role === 'admin' ||
    (currentUser.committee_memberships || []).some(m => m.committee_id === selectedCommittee?.id)
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-3 sm:p-6 text-slate-100">
      {/* Top Bar / Global Demo Bar */}
      <header className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 py-3 px-4 mb-6 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xl">
            🏛️
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight text-white flex items-center gap-2">
              Student Committee Platform
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Cross-Platform
              </span>
            </h1>
            <p className="text-xs text-slate-400">Verified ID, RBAC Security & 45-Day Sessions</p>
          </div>
        </div>

        {/* Quick Demo Personas */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Demo Persona:</span>
          <button
            onClick={() => handleQuickLogin('rohan_student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentUser?.username === 'rohan_student'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <span>👨‍🎓</span> Rohan (Student)
          </button>
          <button
            onClick={() => handleQuickLogin('jane_events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentUser?.username === 'jane_events'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-cyan-400'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
            title="Authorized email: bbc.events@college.edu"
          >
            <span>⚡</span> Jane (BBC Events Lead - RBAC)
          </button>
          <button
            onClick={() => handleQuickLogin('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentUser?.username === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <span>🛡️</span> Admin
          </button>

          {/* Device viewport toggle */}
          <div className="flex items-center ml-2 pl-2 border-l border-slate-700/60 gap-1">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg transition-all ${deviceMode === 'mobile' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              title="Mobile App View"
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg transition-all ${deviceMode === 'desktop' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              title="Desktop Expanded View"
            >
              <Monitor size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 text-sm font-medium animate-bounce ${
          notification.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-600'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-600'
        }`}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main Container: Mobile Frame vs Desktop */}
      <div className={`w-full transition-all duration-300 ${
        deviceMode === 'mobile'
          ? 'max-w-[430px] rounded-[38px] border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-[#0a0f1d] overflow-hidden my-4 relative ring-1 ring-slate-800'
          : 'max-w-6xl rounded-2xl glass-panel p-6 bg-[#0a0f1d]'
      }`}>
        {/* Mobile Notch Bar */}
        {deviceMode === 'mobile' && (
          <div className="w-full h-7 bg-slate-900 flex items-center justify-between px-6 text-[11px] text-slate-400 font-semibold select-none">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black rounded-b-xl"></div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-slate-400 rounded-sm p-0.5">
                <div className="h-full bg-slate-200 rounded-xs"></div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={`${deviceMode === 'mobile' ? 'p-4 min-h-[700px] max-h-[750px] overflow-y-auto' : 'p-2'}`}>
          {/* Active User Header Card */}
          {currentUser ? (
            <div className="p-3.5 mb-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                  alt={currentUser.full_name}
                  className="w-10 h-10 rounded-full border border-indigo-500 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-white">{currentUser.full_name}</span>
                    {currentUser.id_verified && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ ID VERIFIED
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{currentUser.college_email}</span>
                </div>
              </div>

              {/* 45-Day Session Trigger */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateExpiry}
                  className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1"
                  title="Test 45-day session expiry enforcement"
                >
                  <Lock size={10} /> Test 45d Expiry
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated / Registration Onboarding */
            <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h2 className="text-base font-bold text-white mb-2">Student Verification & Onboarding</h2>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAuthStep('step1')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${authStep === 'step1' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Step 1: ID Scan
                </button>
                <button
                  onClick={() => setAuthStep('step2')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${authStep === 'step2' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Step 2: Account
                </button>
              </div>

              {authStep === 'step1' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Legal Name</label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">College Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* ID Card Optical Frame */}
                  <div className="relative h-44 rounded-xl overflow-hidden border-2 border-slate-700 bg-black">
                    <img src={cardImage} alt="ID Card" className="w-full h-full object-cover" />
                    {isScanning && <div className="scanner-laser" />}
                    {ocrStatus?.valid && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold tracking-wider">
                        ✓ ID VERIFIED
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleRunOcr}
                    disabled={isScanning}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Sparkles size={14} />
                    {isScanning ? 'Extracting Optical Text...' : '⚡ Scan College ID with OCR'}
                  </button>

                  {ocrStatus && (
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Keywords Matched:</span>
                        <span className={ocrStatus.matchCount >= 2 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          {ocrStatus.matchCount}/2 ({ocrStatus.matchedKeywords?.slice(0, 3).join(', ')})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Roll No Pattern:</span>
                        <span className={ocrStatus.hasIdPattern ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          {ocrStatus.hasIdPattern ? `Found (${ocrStatus.detectedRollNo})` : 'Missing (6+ digits)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Domain Match:</span>
                        <span className={ocrStatus.domainValid ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          {ocrStatus.domainValid ? 'Authorized Academic Domain' : 'Invalid'}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setAuthStep('step2')}
                    disabled={!ocrStatus?.valid}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      ocrStatus?.valid ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Step 2 →
                  </button>
                </div>
              )}

              {authStep === 'step2' && (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <span className="text-xs text-emerald-200">
                      ID card verified: <strong>{regFullName}</strong> ({regEmail})
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Username</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Role</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setRegRole('student')}
                        className={`p-2 rounded-lg border text-xs font-semibold ${regRole === 'student' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-700 text-slate-400'}`}
                      >
                        🎓 Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('committee_member')}
                        className={`p-2 rounded-lg border text-xs font-semibold ${regRole === 'committee_member' ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-700 text-slate-400'}`}
                      >
                        ⚡ Committee Rep
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRegisterStep2}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                  >
                    Complete Registration & Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MAIN TAB SWITCHER */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-4">
            <button
              onClick={() => { setActiveTab('committees'); setSelectedCommittee(null); setSelectedEvent(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'committees' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏛️</span> Committees
            </button>
            <button
              onClick={() => { setActiveTab('events'); setSelectedEvent(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'events' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎉</span> Event Recaps
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedCommittee(null); setSelectedEvent(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👤</span> My Profile
            </button>
          </div>

          {/* ===================== TAB 1: COMMITTEES ===================== */}
          {activeTab === 'committees' && (
            <div>
              {selectedCommittee ? (
                /* Committee Detail View */
                <div className="space-y-4">
                  <button
                    onClick={() => { setSelectedCommittee(null); setIsCreatingEvent(false); }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2"
                  >
                    <ArrowLeft size={14} /> Back to Directory
                  </button>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <h2 className="font-heading font-bold text-lg text-white mb-1">{selectedCommittee.name}</h2>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{selectedCommittee.description}</p>

                    {/* RBAC Action Bar */}
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <div className="text-[11px] text-slate-300">
                        {canEditCommittee ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Shield size={12} /> Authorized to publish event recaps
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Lock size={12} /> Read-only student mode
                          </span>
                        )}
                      </div>

                      {canEditCommittee && (
                        <button
                          onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                        >
                          {isCreatingEvent ? 'Cancel' : '+ Post Event Recap'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RBAC Event Editor Modal / Form */}
                  {isCreatingEvent && (
                    <form onSubmit={handleCreateEvent} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>✍️</span> Publish Committee Event Recap
                        </h3>
                        <span className="text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                          RBAC Verified
                        </span>
                      </div>

                      {rbacError && (
                        <div className="p-2.5 rounded bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300">
                          ⚠️ {rbacError}
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] uppercase font-bold text-slate-400">Event Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HackCon 2026 Grand Finale"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] uppercase font-bold text-slate-400">Date</label>
                          <input
                            type="date"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] uppercase font-bold text-slate-400">Attendees</label>
                          <input
                            type="number"
                            value={newEventAttendees}
                            onChange={(e) => setNewEventAttendees(e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-slate-400">Revenue Raised (₹)</label>
                        <input
                          type="number"
                          value={newEventRevenue}
                          onChange={(e) => setNewEventRevenue(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-slate-400">Recap Description</label>
                        <textarea
                          rows={3}
                          value={newEventDesc}
                          onChange={(e) => setNewEventDesc(e.target.value)}
                          placeholder="Event highlights, speakers, project showcases..."
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-slate-400">Key Achievements</label>
                        <textarea
                          rows={2}
                          value={newEventAchievements}
                          onChange={(e) => setNewEventAchievements(e.target.value)}
                          placeholder="Prizes, sponsors, college recognition..."
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                      >
                        Publish Official Recap
                      </button>
                    </form>
                  )}

                  {/* Departments List */}
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">
                    Departments & Authorized Emails
                  </h3>
                  <div className="space-y-2.5">
                    {(selectedCommittee.departments || []).map(dept => (
                      <div key={dept.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-white">{dept.name}</h4>
                          <span className="text-[10px] text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20">
                            Lead: {dept.lead?.full_name || 'Designated Lead'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{dept.description}</p>

                        <div className="p-2 rounded bg-slate-800/60 text-[11px] text-slate-300">
                          <span className="text-amber-400 font-bold block mb-0.5">Authorized RBAC Emails:</span>
                          {(dept.members && dept.members.length > 0) ? (
                            dept.members.map((m, i) => (
                              <div key={i} className="flex justify-between items-center text-[10px]">
                                <span>{m.full_name}</span>
                                <code className="text-cyan-400 font-mono">{m.committee_email}</code>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">Institutional department address designated</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Committee Directory List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      College Societies ({committees.length})
                    </span>
                  </div>

                  {committees.map(comm => (
                    <div
                      key={comm.id}
                      onClick={() => handleSelectCommittee(comm.id)}
                      className="p-4 rounded-xl glass-card cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl group-hover:border-indigo-500 transition-colors">
                            {comm.name.includes('Byte') || comm.name.includes('BBC') ? '💻' :
                             comm.name.includes('Cultural') ? '🎭' :
                             comm.name.includes('Sports') ? '⚽' : '🚀'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                              {comm.name}
                            </h3>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] text-slate-400">
                                🏛️ {comm.department_count || 0} Departments
                              </span>
                              <span className="text-[10px] text-cyan-400">
                                🎉 {comm.event_count || 0} Events
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                      </div>

                      <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                        {comm.description}
                      </p>

                      {comm.departments && comm.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {comm.departments.map(d => (
                            <span key={d.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                              {d.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: EVENT RECAPS ===================== */}
          {activeTab === 'events' && (
            <div>
              {selectedEvent ? (
                /* Event Detail View */
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2"
                  >
                    <ArrowLeft size={14} /> Back to Event Feed
                  </button>

                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                    <img
                      src={selectedEvent.media?.[0] || 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'}
                      alt={selectedEvent.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>📅 {selectedEvent.event_date || 'Past Event'}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold text-[10px]">
                          {selectedEvent.committee_name || 'Society Event'}
                        </span>
                      </div>

                      <h2 className="font-heading font-bold text-lg text-white">{selectedEvent.title}</h2>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedEvent.description}</p>

                      {/* Stats Grid */}
                      {selectedEvent.stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                          {Object.entries(selectedEvent.stats).map(([k, v], i) => (
                            <div key={i} className="text-center p-2 rounded bg-slate-900/60">
                              <span className="block text-sm font-bold text-white">
                                {k.includes('revenue') ? `₹${Number(v).toLocaleString()}` : v}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                {k.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Achievements */}
                      {selectedEvent.achievements && (
                        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs">
                          <span className="font-bold text-amber-400 block mb-1">🏆 Key Milestones:</span>
                          <span className="text-amber-200">{selectedEvent.achievements}</span>
                        </div>
                      )}

                      {/* Media Gallery Thumbnails */}
                      {selectedEvent.media && selectedEvent.media.length > 1 && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Media Gallery ({selectedEvent.media.length} Photos)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedEvent.media.map((url, i) => (
                              <img key={i} src={url} alt="Gallery" className="w-full h-20 rounded-lg object-cover border border-slate-700" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Provenance */}
                      <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                        <Shield size={14} className="text-indigo-400" />
                        <span>Verified recap authored by authorized committee credentials.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Events Feed */
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recent Committee Recaps ({events.length})
                    </span>
                  </div>

                  {events.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="rounded-xl overflow-hidden glass-card cursor-pointer group"
                    >
                      <div className="relative h-40 w-full bg-black">
                        <img
                          src={ev.media?.[0] || 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                          {ev.committee_name || 'Society Event'}
                        </div>
                        {ev.media && ev.media.length > 1 && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white">
                            📷 {ev.media.length} photos
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span>📅 {ev.event_date || 'Past Event'}</span>
                          <span className="text-indigo-400 font-semibold group-hover:underline">View Recap →</span>
                        </div>

                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {ev.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {ev.description}
                        </p>

                        {/* Stats Badges */}
                        {ev.stats && (
                          <div className="flex gap-2 pt-1">
                            {ev.stats.attendees && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700">
                                👥 {ev.stats.attendees} Attendees
                              </span>
                            )}
                            {ev.stats.revenue && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                                💰 ₹{Number(ev.stats.revenue).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 3: PROFILE ===================== */}
          {activeTab === 'profile' && currentUser && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-base text-white">{currentUser.full_name}</h2>
                    <span className="text-xs text-slate-400 block">{currentUser.college_email}</span>
                    <span className="text-[10px] text-emerald-400 font-bold tracking-wide">
                      {currentUser.id_verified ? '✓ VERIFIED STUDENT' : 'UNVERIFIED'}
                    </span>
                  </div>
                </div>

                {/* CV Storage Section */}
                <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText size={14} className="text-rose-400" /> Verified Student CV (PDF)
                    </span>
                    {currentUser.cv_url && (
                      <a
                        href={currentUser.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Preview <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {currentUser.cv_url ? (
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>📄 Student_Resume_2026.pdf</span>
                      <span className="text-[10px] text-slate-400">
                        {currentUser.cv_uploaded_at ? new Date(currentUser.cv_uploaded_at).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">No CV on file. Upload your resume for committee recruitment.</p>
                  )}

                  <button
                    onClick={handleUploadCv}
                    className="w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                  >
                    <Upload size={12} /> {currentUser.cv_url ? 'Replace / Upload New CV' : 'Upload Student CV (PDF)'}
                  </button>
                </div>

                {/* Skills & Interests Picker */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> Skills & Extracurricular Interests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map(tag => {
                      const isSelected = (currentUser.tags || []).some(t => t.name === tag.name || t.id === tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleToggleTag(tag.name)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {tag.type === 'skill' ? '⚡' : '🌟'} {tag.name} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Authorized Committee Memberships */}
                {currentUser.committee_memberships && currentUser.committee_memberships.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-xs space-y-1">
                    <span className="font-bold text-amber-400 block mb-1">🔐 Authorized Society Editing Roles:</span>
                    {currentUser.committee_memberships.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] text-slate-300">
                        <span>{m.department_name} ({m.committee_name})</span>
                        <code className="text-cyan-400">{m.committee_email}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== 45-DAY SESSION EXPIRY MODAL ===================== */}
      {showExpiryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border-2 border-amber-500/80 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl">
              🛡️
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg text-white">Security Session Expired</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your <strong className="text-amber-400">45-day security session</strong> has expired. Please sign in again with institutional credentials to re-verify RBAC access rights.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/90 text-left text-[11px] text-slate-400 space-y-1 border border-slate-700">
              <span className="text-amber-400 font-bold block text-[10px] uppercase">Campus Policy #SEC-45</span>
              <div>• Refresh Token TTL enforced: 45 days maximum.</div>
              <div>• Unauthorized session tokens automatically revoked in database.</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowExpiryModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setShowExpiryModal(false);
                  handleQuickLogin('rohan_student');
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
              >
                Sign In Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
