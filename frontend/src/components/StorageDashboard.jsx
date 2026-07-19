import React, { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StorageDashboard({ setView }) {
  // Authentication states
  const [token, setToken] = useState(() => localStorage.getItem('nexora_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // File explorer states
  const [items, setItems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarTab, setSidebarTab] = useState('all'); // 'all', 'shared', 'starred', 'recent', 'trash'
  
  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmailInput, setShareEmailInput] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [renameItemId, setRenameItemId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Active Uploads List
  const [uploads, setUploads] = useState([]);

  // Fetch Nodes & User Profile when authenticated
  const fetchNodes = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/nodes?parent_id=${currentFolderId}&tab=${sidebarTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch storage nodes.');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error('Failed to retrieve user profile.');
      const data = await res.json();
      setUserProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNodes();
    }
  }, [currentFolderId, sidebarTab, isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, token]);

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Identity validation rejected by server.');
      }

      if (authMode === 'signup') {
        setAuthMode('login');
        setAuthError('[SYSTEM] Signup successful! You may now sign in.');
      } else {
        localStorage.setItem('nexora_token', data.access_token);
        setToken(data.access_token);
        setIsAuthenticated(true);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err) {
      setAuthError(`[AUTH_ERROR] ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexora_token');
    setToken(null);
    setIsAuthenticated(false);
    setUserProfile(null);
    setItems([]);
  };

  // Quota & Stats (500MB default, dynamic based on user profile)
  const totalCapacity = userProfile?.quota?.quota_bytes || 524288000;
  const usedStorage = userProfile?.quota?.used_bytes || 0;
  const usedPercentage = useMemo(() => {
    return ((usedStorage / totalCapacity) * 100).toFixed(1);
  }, [usedStorage, totalCapacity]);

  // Selected node reference
  const selectedItem = useMemo(() => {
    return items.find(item => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  // Breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    const crumbs = [];
    let currentId = currentFolderId;
    while (currentId !== 'root') {
      const folder = items.find(item => item.id === currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    crumbs.unshift({ id: 'root', name: 'My Drive' });
    return crumbs;
  }, [items, currentFolderId]);

  // File Size Formatter
  const formatSize = (bytes) => {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Node double click trigger (browse folder or download file stream)
  const handleDoubleClick = (item) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedItemId(null);
      setSidebarTab('all');
    } else {
      downloadFile(item);
    }
  };

  const handleItemClick = (id) => {
    setSelectedItemId(id === selectedItemId ? null : id);
    setActiveMenuId(null);
  };

  // Live CRUD API Calls
  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/nodes/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newFolderName, parent_id: currentFolderId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Could not instantiate directory.');
      }
      setNewFolderName('');
      setShowNewFolderModal(false);
      fetchNodes();
    } catch (err) {
      alert(`[ERROR]: ${err.message}`);
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const uploadId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      
      const newUpload = {
        id: uploadId,
        name: file.name,
        progress: 0,
        completed: false,
        failed: false,
        error: null
      };
      setUploads(prev => [...prev, newUpload]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/nodes/upload?parent_id=${currentFolderId}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.floor((event.loaded / event.total) * 100);
            setUploads(prev => prev.map(up => up.id === uploadId ? { ...up, progress: pct } : up));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploads(prev => prev.map(up => up.id === uploadId ? { ...up, progress: 100, completed: true } : up));
            fetchNodes();
            fetchUserProfile();
          } else {
            let errorMsg = 'Upload failed';
            try {
              const resJson = JSON.parse(xhr.responseText);
              errorMsg = resJson.detail || errorMsg;
            } catch (err) {}
            setUploads(prev => prev.map(up => up.id === uploadId ? { ...up, failed: true, error: errorMsg } : up));
          }
        };

        xhr.onerror = () => {
          setUploads(prev => prev.map(up => up.id === uploadId ? { ...up, failed: true, error: 'Network socket fault.' } : up));
        };

        xhr.send(formData);
      } catch (err) {
        setUploads(prev => prev.map(up => up.id === uploadId ? { ...up, failed: true, error: err.message } : up));
      }
    }
    e.target.value = null;
  };

  const downloadFile = async (item) => {
    try {
      const response = await fetch(`${API_URL}/nodes/download/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Retrieve file request denied.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`[DOWNLOAD_ERROR] ${err.message}`);
    }
  };

  const toggleStar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/nodes/star/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Database star toggled error.');
      fetchNodes();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/nodes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Target node removal rejected.');
      setSelectedItemId(null);
      fetchNodes();
      fetchUserProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const restoreItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/nodes/restore/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Database restore failed.');
      setSelectedItemId(null);
      fetchNodes();
    } catch (err) {
      console.error(err);
    }
  };

  const shareItem = async () => {
    if (!shareEmailInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/nodes/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: shareEmailInput, role_name: 'viewer', node_id: selectedItemId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to bind share role.');
      }
      setShareEmailInput('');
      setShowShareModal(false);
      fetchNodes();
    } catch (err) {
      alert(`[SHARE_ERROR]: ${err.message}`);
    }
  };

  const renameItem = async () => {
    if (!renameValue.trim()) return;
    try {
      const res = await fetch(`${API_URL}/nodes/rename/${renameItemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: renameValue })
      });
      if (!res.ok) throw new Error('Database rename failed.');
      setRenameItemId(null);
      setRenameValue('');
      fetchNodes();
    } catch (err) {
      console.error(err);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'folder':
        return (
          <svg className="w-10 h-10 text-mint" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-10 h-10 text-coral" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9h2.5c.8 0 1.5.7 1.5 1.5v3zm4-3H17v1h1.5V13H17v2h-1.5V9h3v1.5z" />
          </svg>
        );
      case 'xlsx':
        return (
          <svg className="w-10 h-10 text-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 10h-2v2H9.5v-2h-2v-1.5h2v-2H11v2h2V13z" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        );
      case 'png':
      case 'jpg':
        return (
          <svg className="w-10 h-10 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        );
      case 'mp4':
        return (
          <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
          </svg>
        );
    }
  };

  // --- RENDER 1: AUTHENTICATION FORM (TERMINAL ACCESS) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper text-forest pt-24 pb-12 flex items-center justify-center font-mono w-full px-6">
        <div className="w-full max-w-[420px] bg-paper border border-gridColor/20 p-8 relative rounded-none shadow-xl">
          {/* Corner Markers */}
          <div className="absolute -top-[1px] -left-[1px] w-[10px] h-[10px] border-t border-l border-forest" />
          <div className="absolute -top-[1px] -right-[1px] w-[10px] h-[10px] border-t border-r border-forest" />
          <div className="absolute -bottom-[1px] -left-[1px] w-[10px] h-[10px] border-b border-l border-forest" />
          <div className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] border-b border-r border-forest" />

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-forest mb-2">
              {authMode === 'login' ? 'INITIALIZE SECURE GATEWAY' : 'PROVISION GATEWAY IDENTITY'}
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-forest/50 font-bold">
              {authMode === 'login' ? 'PROTOCOL ACCESS TERMINAL' : 'CREATE USER CREDENTIALS'}
            </p>
          </div>

          {authError && (
            <div className={`p-4 mb-6 text-left border text-[10px] uppercase font-bold break-all rounded-none ${
              authError.startsWith('[SYSTEM]') 
                ? 'border-mint bg-mint/5 text-forest' 
                : 'border-coral bg-coral/5 text-coral'
            }`}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-forest/70 mb-1.5 font-bold">
                01 // IDENTIFIER EMAIL
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-white border border-gridColor/30 px-3 py-2 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150"
                placeholder="E.G. USER@NEXORA.SH"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-forest/70 mb-1.5 font-bold">
                02 // ENCRYPTED PASSWORD
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-white border border-gridColor/30 px-3 py-2 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-forest text-paper border border-forest font-bold text-[10px] uppercase tracking-widest hover:bg-coral hover:text-forest hover:border-coral transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'EXECUTING HANDSHAKE...' : authMode === 'login' ? 'ESTABLISH CONNECT' : 'SIGN UP ACCOUNT'}
            </button>
          </form>

          <div className="mt-8 border-t border-gridColor/10 pt-4 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
              }}
              className="text-[9px] uppercase tracking-widest text-forest/60 hover:text-coral transition-colors duration-150 font-bold"
            >
              {authMode === 'login' ? 'Switch to identity creation' : 'Return to access credentials'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: STORAGE CONSOLE DASHBOARD ---
  return (
    <div className="min-h-screen bg-paper text-forest pt-16 flex font-mono w-full">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gridColor/10 flex flex-col justify-between p-6 bg-paper select-none">
        <div className="space-y-8">
          {/* New Actions Button Dropdown */}
          <div className="relative group">
            <button className="w-full py-3 bg-forest text-paper hover:bg-coral hover:text-forest transition-colors duration-200 border border-forest font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Item
            </button>
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gridColor/20 shadow-lg hidden group-hover:block z-20">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="w-full text-left px-4 py-2.5 text-[9px] font-bold text-forest hover:bg-mint/20 transition-colors uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-forest/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6V10h12v2z" />
                </svg>
                Create Folder
              </button>
              <label className="w-full text-left px-4 py-2.5 text-[9px] font-bold text-forest hover:bg-mint/20 transition-colors uppercase tracking-wider flex items-center gap-2 cursor-pointer border-t border-gridColor/10">
                <svg className="w-4 h-4 text-forest/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                </svg>
                Upload File
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setSidebarTab('all'); setSelectedItemId(null); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 transition-colors duration-150 rounded-none cursor-pointer ${
                sidebarTab === 'all' ? 'bg-mint/20 text-forest border-l-2 border-forest pl-2' : 'text-forest/70 hover:bg-forest/5 hover:text-forest'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              My Drive
            </button>
            <button
              onClick={() => { setSidebarTab('shared'); setSelectedItemId(null); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 transition-colors duration-150 rounded-none cursor-pointer ${
                sidebarTab === 'shared' ? 'bg-mint/20 text-forest border-l-2 border-forest pl-2' : 'text-forest/70 hover:bg-forest/5 hover:text-forest'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 18M15 12.071a9.324 9.324 0 002.625-.372 9.325 9.325 0 004.122-.952 4.125 4.125 0 00-7.533-2.493M15 12.071v-.003c0-1.11-.285-2.16-.786-3.07M15 12.071v.109A11.386 11.386 0 0110.089 11M11 18c0-3.417-2.167-6.333-5.25-7.426m5.25 7.426A11.386 11.386 0 016.089 19.109M6 18c0-3.417 2.167-6.333 5.25-7.426m-5.25 7.426v.109A11.386 11.386 0 011.089 18M1 18c0-3.417 2.167-6.333 5.25-7.426M14 6c0-1.657-1.343-3-3-3S8 4.343 8 6s1.343 3 3 3 3-1.343 3-3z" />
              </svg>
              Shared
            </button>
            <button
              onClick={() => { setSidebarTab('starred'); setSelectedItemId(null); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 transition-colors duration-150 rounded-none cursor-pointer ${
                sidebarTab === 'starred' ? 'bg-mint/20 text-forest border-l-2 border-forest pl-2' : 'text-forest/70 hover:bg-forest/5 hover:text-forest'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.173-.427.768-.427.94 0l3.001 7.407 8.04 1.168c.47.068.66.649.32.977l-5.82 5.674 1.374 8.012c.08.471-.415.83-.822.607L12 18.286l-7.18 3.771c-.408.213-.9-.146-.822-.607l1.374-8.012-5.82-5.674c-.34-.327-.15-.909.32-.977l8.04-1.168 3.001-7.407z" />
              </svg>
              Starred
            </button>
            <button
              onClick={() => { setSidebarTab('trash'); setSelectedItemId(null); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 transition-colors duration-150 rounded-none cursor-pointer ${
                sidebarTab === 'trash' ? 'bg-mint/20 text-forest border-l-2 border-forest pl-2' : 'text-forest/70 hover:bg-forest/5 hover:text-forest'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Trash
            </button>
          </nav>
        </div>

        {/* User Info & Quota Info */}
        <div className="space-y-6 border-t border-gridColor/10 pt-6">
          <div className="space-y-3 font-mono">
            <div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-forest/70">
              <span>Storage Used</span>
              <span>{usedPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-gridColor/10 rounded-none overflow-hidden p-[1px] border border-gridColor/20">
              <div
                className="h-full bg-forest transition-all duration-300"
                style={{ width: `${Math.min(100, usedPercentage)}%` }}
              />
            </div>
            <div className="text-[9px] font-bold text-forest/50 uppercase tracking-widest">
              {formatSize(usedStorage)} of {formatSize(totalCapacity)}
            </div>
          </div>

          <div className="space-y-2 border-t border-gridColor/10 pt-4">
            <div className="text-[9px] font-bold text-forest/60 break-all select-all font-mono uppercase">
              {userProfile?.email}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-coral/10 hover:bg-coral hover:text-forest text-coral transition-colors duration-150 border border-coral/30 font-bold uppercase tracking-widest text-[8px] cursor-pointer"
            >
              Disconnect Node
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header bar */}
        <header className="h-16 border-b border-gridColor/10 px-8 flex items-center justify-between select-none">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-forest/70">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                {idx > 0 && <span className="text-forest/30">/</span>}
                <button
                  onClick={() => {
                    setCurrentFolderId(crumb.id);
                    setSelectedItemId(null);
                    setSidebarTab('all');
                  }}
                  className="hover:text-forest transition-colors cursor-pointer"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search bar & Grid buttons */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ARCHIVE..."
                className="bg-paper border border-gridColor/20 px-3 py-1.5 pl-8 text-[10px] font-mono tracking-wide rounded-none text-forest focus:outline-none focus:border-forest w-56 transition-colors duration-150"
              />
              <svg className="w-3.5 h-3.5 text-forest/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            {/* Layout switch buttons */}
            <div className="flex border border-gridColor/20 p-[2px] bg-paper">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-none transition-colors cursor-pointer ${layoutMode === 'grid' ? 'bg-forest text-paper' : 'text-forest/60 hover:text-forest'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 11h5V5H4v6zm0 8h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-8h5V5h-5v6zm6-6v6h5V5h-5z" />
                </svg>
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-none transition-colors cursor-pointer ${layoutMode === 'list' ? 'bg-forest text-paper' : 'text-forest/60 hover:text-forest'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 14h16v-2H4v2zm0 4h16v-2H4v2zM4 6v2h16V6H4zm0 4h16V8H4v2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Items Browser Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <div className="w-[40px] h-[40px] border border-dashed border-forest/30 flex items-center justify-center text-forest/40 text-xs mb-3 font-bold">
                Ø
              </div>
              <p className="text-[10px] uppercase tracking-widest text-forest/40 font-bold">
                No storage nodes provisioned here.
              </p>
            </div>
          ) : (
            layoutMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    onDoubleClick={() => handleDoubleClick(item)}
                    className={`border p-4 relative flex flex-col items-center justify-between h-36 cursor-pointer select-none transition-all group duration-150 ${
                      selectedItemId === item.id 
                        ? 'border-forest bg-mint/5 shadow-md scale-[1.02]' 
                        : 'border-gridColor/10 hover:border-forest/40 hover:bg-paper/50'
                    }`}
                  >
                    {/* Star icon badge if starred */}
                    {item.starred && (
                      <span className="absolute top-2 left-2 text-gold">★</span>
                    )}

                    {/* Context Actions Dropdown Indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1 hover:bg-forest/10 text-forest/70 hover:text-forest cursor-pointer"
                      >
                        ⋮
                      </button>
                      {activeMenuId === item.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gridColor/20 shadow-xl w-36 py-1 z-30 font-mono text-[9px] uppercase tracking-wider font-bold">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStar(item.id); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-mint/20 text-forest cursor-pointer"
                          >
                            {item.starred ? 'Unstar Node' : 'Star Node'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRenameItemId(item.id); setRenameValue(item.name); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-mint/20 text-forest cursor-pointer border-t border-gridColor/10"
                          >
                            Rename Item
                          </button>
                          {item.type !== 'folder' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadFile(item); setActiveMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 hover:bg-mint/20 text-forest cursor-pointer border-t border-gridColor/10"
                            >
                              Download
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowShareModal(true); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 hover:bg-mint/20 text-forest cursor-pointer border-t border-gridColor/10"
                          >
                            Share Link
                          </button>
                          {item.trashed ? (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); restoreItem(item.id); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-mint/20 text-forest cursor-pointer border-t border-gridColor/10"
                              >
                                Restore
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-coral/20 text-coral cursor-pointer border-t border-gridColor/10"
                              >
                                Delete Forever
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.id); setActiveMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 hover:bg-coral/20 text-coral cursor-pointer border-t border-gridColor/10"
                            >
                              Move to Trash
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                      {getFileIcon(item.type)}
                    </div>
                    <div className="w-full text-center mt-2">
                      <p className="text-[10px] font-bold text-forest truncate px-1">
                        {item.name}
                      </p>
                      <p className="text-[8px] text-forest/40 font-mono mt-0.5">
                        {item.type === 'folder' ? 'DIR' : formatSize(item.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gridColor/10 select-none">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gridColor/10 bg-paper text-[8px] uppercase tracking-widest text-forest/50 font-bold">
                      <th className="p-3">Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Last Updated</th>
                      <th className="p-3 text-right">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        onDoubleClick={() => handleDoubleClick(item)}
                        className={`border-b border-gridColor/5 text-[9px] font-bold hover:bg-paper/50 cursor-pointer ${
                          selectedItemId === item.id ? 'bg-mint/5 text-forest' : ''
                        }`}
                      >
                        <td className="p-3 flex items-center gap-2 max-w-[240px] truncate">
                          {item.starred && <span className="text-gold">★</span>}
                          {item.name}
                        </td>
                        <td className="p-3 uppercase text-forest/50 font-mono">{item.type}</td>
                        <td className="p-3 font-mono">{item.type === 'folder' ? 'DIRECTORY' : formatSize(item.size)}</td>
                        <td className="p-3 font-mono text-forest/60">{new Date(item.updatedAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right text-forest/50 font-mono">{item.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>

      {/* Details Side Panel (Expandable info about selected item) */}
      <aside className="w-72 border-l border-gridColor/10 p-6 bg-paper select-none flex flex-col justify-between font-mono">
        {selectedItem ? (
          <div className="space-y-6">
            <div className="border-b border-gridColor/10 pb-4 text-left">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-forest truncate">
                {selectedItem.name}
              </h3>
              <p className="text-[8px] text-forest/40 uppercase mt-0.5">
                Node Profile Specs
              </p>
            </div>

            <div className="space-y-4 text-[9px] uppercase tracking-wider text-forest/80 font-bold">
              <div className="flex justify-between">
                <span className="text-forest/40">UUID</span>
                <span className="truncate max-w-[140px] text-right font-mono">{selectedItem.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/40">Type</span>
                <span>{selectedItem.type}</span>
              </div>
              {selectedItem.type !== 'folder' && (
                <div className="flex justify-between">
                  <span className="text-forest/40">Size</span>
                  <span>{formatSize(selectedItem.size)}</span>
                </div>
              )}
              {selectedItem.backend && (
                <div className="flex justify-between">
                  <span className="text-forest/40">Pool Target</span>
                  <span className="text-mint font-bold uppercase">{selectedItem.backend}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-forest/40">Created</span>
                <span>{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest/40">Owner</span>
                <span className="truncate max-w-[140px] text-right">{selectedItem.owner}</span>
              </div>
              <div className="border-t border-gridColor/10 pt-4 space-y-1.5">
                <div className="text-forest/40">Collaborators</div>
                <div className="text-[8px] font-bold text-forest/70 font-mono leading-relaxed lowercase break-all">
                  {selectedItem.sharedWith && selectedItem.sharedWith.length > 0 
                    ? selectedItem.sharedWith.join(', ') 
                    : 'System isolate only'}
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="border-t border-gridColor/10 pt-4 space-y-3">
              <span className="text-[9px] font-bold text-forest/40 uppercase tracking-widest">
                System Audit Log
              </span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedItem.auditLog?.map((log, idx) => (
                  <div key={idx} className="border-l border-forest/30 pl-2 text-[8px] font-mono leading-relaxed text-forest/60">
                    <span className="text-forest font-bold">[{log.action}]</span>
                    <br />
                    <span>User: {log.user}</span>
                    <br />
                    <span>{new Date(log.date).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-forest/40 font-mono">
            <svg className="w-8 h-8 text-forest/20 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083 1.083l-.041.02-.016.009aA9.033 9.033 0 01-1.802.79l-.014.004a.75.75 0 01-.444-.08l-.017-.01-.013-.007a7.518 7.518 0 01.515-1.127l.006-.012z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728z" />
            </svg>
            <p className="text-[9px] uppercase tracking-widest font-bold">
              Select an item to view cryptographic specs & audit logs
            </p>
          </div>
        )}
      </aside>

      {/* --- ACTION MODALS AND NOTIFICATIONS --- */}

      {/* 1. New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 font-mono">
          <div className="w-[320px] bg-paper border border-gridColor/30 p-6 relative rounded-none shadow-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-forest mb-4">
              Create New Folder
            </h4>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="FOLDER NAME"
              className="w-full bg-white border border-gridColor/30 px-3 py-2 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150 mb-4"
            />
            <div className="flex gap-3 justify-end text-[8px] uppercase tracking-widest font-bold">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-2 bg-paper text-forest/70 hover:text-forest cursor-pointer border border-gridColor/20"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-3 py-2 bg-forest text-paper hover:bg-coral hover:text-forest transition-colors cursor-pointer border border-forest"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 font-mono">
          <div className="w-[360px] bg-paper border border-gridColor/30 p-6 relative rounded-none shadow-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-forest mb-4">
              Share Cryptographic Link
            </h4>
            <input
              type="email"
              required
              value={shareEmailInput}
              onChange={(e) => setShareEmailInput(e.target.value)}
              placeholder="ENTER COLLABORATOR EMAIL..."
              className="w-full bg-white border border-gridColor/30 px-3 py-2 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150 mb-4"
            />
            <div className="flex gap-3 justify-end text-[8px] uppercase tracking-widest font-bold">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-3 py-2 bg-paper text-forest/70 hover:text-forest cursor-pointer border border-gridColor/20"
              >
                Cancel
              </button>
              <button
                onClick={shareItem}
                className="px-3 py-2 bg-forest text-paper hover:bg-coral hover:text-forest transition-colors cursor-pointer border border-forest"
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Rename Modal */}
      {renameItemId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 font-mono">
          <div className="w-[320px] bg-paper border border-gridColor/30 p-6 relative rounded-none shadow-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-forest mb-4">
              Rename Storage Node
            </h4>
            <input
              type="text"
              required
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="NEW NAME"
              className="w-full bg-white border border-gridColor/30 px-3 py-2 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150 mb-4"
            />
            <div className="flex gap-3 justify-end text-[8px] uppercase tracking-widest font-bold">
              <button
                onClick={() => { setRenameItemId(null); setRenameValue(''); }}
                className="px-3 py-2 bg-paper text-forest/70 hover:text-forest cursor-pointer border border-gridColor/20"
              >
                Cancel
              </button>
              <button
                onClick={renameItem}
                className="px-3 py-2 bg-forest text-paper hover:bg-coral hover:text-forest transition-colors cursor-pointer border border-forest"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Telemetry Status Drawer (Bottom Right) */}
      {uploads.length > 0 && (
        <div className="fixed bottom-6 right-6 w-80 bg-paper border border-gridColor/30 shadow-2xl z-50 font-mono p-4">
          <div className="flex justify-between border-b border-gridColor/10 pb-2 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-forest">Upload Telemetry</span>
            <button onClick={() => setUploads([])} className="text-[9px] font-bold text-forest/40 hover:text-coral cursor-pointer">Clear</button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {uploads.map(up => (
              <div key={up.id} className="text-[9px] font-bold flex flex-col gap-1.5 uppercase">
                <div className="flex justify-between items-center">
                  <span className="truncate max-w-[180px]">{up.name}</span>
                  <span className={up.failed ? 'text-coral' : up.completed ? 'text-mint' : 'text-forest/75'}>
                    {up.failed ? 'Failed' : up.completed ? 'Complete' : `${up.progress}%`}
                  </span>
                </div>
                {!up.completed && !up.failed && (
                  <div className="w-full h-1 bg-gridColor/10 overflow-hidden">
                    <div className="h-full bg-forest transition-all" style={{ width: `${up.progress}%` }} />
                  </div>
                )}
                {up.failed && (
                  <span className="text-[7px] text-coral lowercase break-all pr-2">
                    {up.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
