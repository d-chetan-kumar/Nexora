import React, { useState, useEffect, useMemo } from 'react';

// Default mock files data to seed localStorage
const DEFAULT_FILES = [
  {
    id: 'f1',
    name: 'Security_Compliance_2026.pdf',
    type: 'pdf',
    parentId: 'folder_docs',
    size: 2450000,
    starred: true,
    trashed: false,
    createdAt: '2026-07-18T10:15:30Z',
    updatedAt: '2026-07-18T10:15:30Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: ['elizabeth.vance@aegis.com'],
    auditLog: [
      { action: 'Created', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-18T10:15:30Z' },
      { action: 'Shared with elizabeth.vance@aegis.com', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-18T11:00:00Z' }
    ]
  },
  {
    id: 'f2',
    name: 'Project_Spec_v2.docx',
    type: 'docx',
    parentId: 'folder_docs',
    size: 450000,
    starred: false,
    trashed: false,
    createdAt: '2026-07-19T08:20:00Z',
    updatedAt: '2026-07-19T09:12:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: [],
    auditLog: [
      { action: 'Created', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-19T08:20:00Z' },
      { action: 'Modified content', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-19T09:12:00Z' }
    ]
  },
  {
    id: 'f3',
    name: 'architecture_layout.png',
    type: 'png',
    parentId: 'folder_media',
    size: 15400000,
    starred: true,
    trashed: false,
    createdAt: '2026-07-17T14:30:00Z',
    updatedAt: '2026-07-17T14:30:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: ['marcus.thorne@vector.com'],
    auditLog: [
      { action: 'Created', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-17T14:30:00Z' }
    ]
  },
  {
    id: 'f4',
    name: 'system_demo.mp4',
    type: 'mp4',
    parentId: 'folder_media',
    size: 48900000,
    starred: false,
    trashed: false,
    createdAt: '2026-07-19T11:00:00Z',
    updatedAt: '2026-07-19T11:00:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: [],
    auditLog: [
      { action: 'Created', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-19T11:00:00Z' }
    ]
  },
  {
    id: 'f5',
    name: 'q2_budget_ledger.xlsx',
    type: 'xlsx',
    parentId: 'folder_finance',
    size: 890000,
    starred: false,
    trashed: false,
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-07-15T09:00:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: ['siddharth.mehta@ledger.com'],
    auditLog: [
      { action: 'Created', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-15T09:00:00Z' }
    ]
  },
  {
    id: 'f6',
    name: 'README_Nexora.md',
    type: 'txt',
    parentId: 'root',
    size: 1520,
    starred: true,
    trashed: false,
    createdAt: '2026-07-19T13:40:00Z',
    updatedAt: '2026-07-19T13:40:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: [],
    auditLog: [
      { action: 'Created', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-19T13:40:00Z' }
    ]
  },
  // Folders
  {
    id: 'folder_docs',
    name: 'Documents',
    type: 'folder',
    parentId: 'root',
    size: null,
    starred: false,
    trashed: false,
    createdAt: '2026-07-18T10:00:00Z',
    updatedAt: '2026-07-19T09:12:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: [],
    auditLog: [
      { action: 'Created Directory', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-18T10:00:00Z' }
    ]
  },
  {
    id: 'folder_media',
    name: 'Media Assets',
    type: 'folder',
    parentId: 'root',
    size: null,
    starred: false,
    trashed: false,
    createdAt: '2026-07-17T14:00:00Z',
    updatedAt: '2026-07-19T11:00:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: [],
    auditLog: [
      { action: 'Created Directory', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-17T14:00:00Z' }
    ]
  },
  {
    id: 'folder_finance',
    name: 'Finance & Ledger',
    type: 'folder',
    parentId: 'root',
    size: null,
    starred: false,
    trashed: false,
    createdAt: '2026-07-15T08:30:00Z',
    updatedAt: '2026-07-15T09:00:00Z',
    owner: 'chilkabhanuvilasith@gmail.com',
    sharedWith: [],
    auditLog: [
      { action: 'Created Directory', user: 'chilkabhanuvilasith@gmail.com', date: '2026-07-15T08:30:00Z' }
    ]
  }
];

export default function StorageDashboard({ setView }) {
  // States
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('nexora_drive_items');
    return saved ? JSON.parse(saved) : DEFAULT_FILES;
  });

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

  // Upload Notification State
  const [uploads, setUploads] = useState([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexora_drive_items', JSON.stringify(items));
  }, [items]);

  // Storage Stats (total capacity 15GB = 16,106,127,360 bytes)
  const totalCapacity = 16106127360;
  const usedStorage = useMemo(() => {
    return items.reduce((acc, item) => (item.size && !item.trashed ? acc + item.size : acc), 0);
  }, [items]);

  const usedPercentage = useMemo(() => {
    return ((usedStorage / totalCapacity) * 100).toFixed(1);
  }, [usedStorage]);

  // Selected item reference
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

  // Filtered Items for rendering
  const displayedItems = useMemo(() => {
    let result = items;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(query));
    } else {
      // Sidebar Tab logic
      if (sidebarTab === 'trash') {
        result = result.filter(item => item.trashed);
      } else {
        result = result.filter(item => !item.trashed);
        
        if (sidebarTab === 'starred') {
          result = result.filter(item => item.starred);
        } else if (sidebarTab === 'shared') {
          result = result.filter(item => item.sharedWith && item.sharedWith.length > 0);
        } else if (sidebarTab === 'recent') {
          // Sort and limit recent items
          result = [...result].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
          return result; // bypass folder structure for recents
        } else if (sidebarTab === 'all') {
          result = result.filter(item => item.parentId === currentFolderId);
        }
      }
    }

    // Sort: Folders first, then alphabetically
    return result.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [items, currentFolderId, sidebarTab, searchQuery]);

  // Format File Size
  const formatSize = (bytes) => {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper icons
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

  // Actions
  const handleItemClick = (id) => {
    setSelectedItemId(id === selectedItemId ? null : id);
    setActiveMenuId(null);
  };

  const handleDoubleClick = (item) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedItemId(null);
      setSidebarTab('all');
    } else {
      // Show Preview modal
      setPreviewContent(item);
      setShowPreviewModal(true);
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: 'folder_' + Date.now(),
      name: newFolderName,
      type: 'folder',
      parentId: currentFolderId,
      size: null,
      starred: false,
      trashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: 'chilkabhanuvilasith@gmail.com',
      sharedWith: [],
      auditLog: [{ action: 'Created Directory', user: 'chilkabhanuvilasith@gmail.com', date: new Date().toISOString() }]
    };
    setItems([...items, newFolder]);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const simulateUpload = (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach((file) => {
      const uploadId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const newUpload = {
        id: uploadId,
        name: file.name,
        progress: 0,
        completed: false
      };
      setUploads(prev => [...prev, newUpload]);

      // Progress Simulation
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);

          // Add to File tree once finished
          const extension = file.name.split('.').pop().toLowerCase();
          const newFile = {
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: file.name,
            type: ['pdf','xlsx','docx','png','jpg','mp4','zip','txt'].includes(extension) ? extension : 'txt',
            parentId: currentFolderId,
            size: file.size || Math.floor(Math.random() * 5000000) + 10000,
            starred: false,
            trashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            owner: 'chilkabhanuvilasith@gmail.com',
            sharedWith: [],
            auditLog: [{ action: 'Simulated Upload', user: 'chilkabhanuvilasith@gmail.com', date: new Date().toISOString() }]
          };

          setItems(prevItems => [...prevItems, newFile]);
          setUploads(prevUploads =>
            prevUploads.map(up => (up.id === uploadId ? { ...up, progress: 100, completed: true } : up))
          );
        } else {
          setUploads(prevUploads =>
            prevUploads.map(up => (up.id === uploadId ? { ...up, progress: currentProgress } : up))
          );
        }
      }, 300);
    });

    // Reset standard input
    e.target.value = null;
  };

  const toggleStar = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nextStarred = !item.starred;
        const newLog = {
          action: nextStarred ? 'Starred item' : 'Unstarred item',
          user: 'chilkabhanuvilasith@gmail.com',
          date: new Date().toISOString()
        };
        return {
          ...item,
          starred: nextStarred,
          auditLog: [...item.auditLog, newLog],
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newLog = {
          action: 'Moved to Trash',
          user: 'chilkabhanuvilasith@gmail.com',
          date: new Date().toISOString()
        };
        return {
          ...item,
          trashed: true,
          auditLog: [...item.auditLog, newLog],
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    setSelectedItemId(null);
  };

  const restoreItem = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newLog = {
          action: 'Restored from Trash',
          user: 'chilkabhanuvilasith@gmail.com',
          date: new Date().toISOString()
        };
        return {
          ...item,
          trashed: false,
          auditLog: [...item.auditLog, newLog],
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    setSelectedItemId(null);
  };

  const permanentlyDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setSelectedItemId(null);
  };

  const shareItem = () => {
    if (!shareEmailInput.trim()) return;
    setItems(items.map(item => {
      if (item.id === selectedItemId) {
        const currentShared = item.sharedWith || [];
        if (currentShared.includes(shareEmailInput)) return item;
        const newLog = {
          action: `Shared with ${shareEmailInput}`,
          user: 'chilkabhanuvilasith@gmail.com',
          date: new Date().toISOString()
        };
        return {
          ...item,
          sharedWith: [...currentShared, shareEmailInput],
          auditLog: [...item.auditLog, newLog],
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    setShareEmailInput('');
    setShowShareModal(false);
  };

  const renameItem = () => {
    if (!renameValue.trim()) return;
    setItems(items.map(item => {
      if (item.id === renameItemId) {
        const newLog = {
          action: `Renamed from "${item.name}" to "${renameValue}"`,
          user: 'chilkabhanuvilasith@gmail.com',
          date: new Date().toISOString()
        };
        return {
          ...item,
          name: renameValue,
          auditLog: [...item.auditLog, newLog],
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    setRenameItemId(null);
    setRenameValue('');
  };

  return (
    <div className="min-h-screen bg-paper text-forest pt-16 flex font-mono w-full">
      {/* Sidebar Section */}
      <aside className="w-64 border-r border-gridColor/10 flex flex-col justify-between p-6 bg-paper select-none">
        <div className="space-y-8">
          {/* New Actions Dropdown */}
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
                <input type="file" multiple onChange={simulateUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Navigation Links */}
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
              onClick={() => { setSidebarTab('recent'); setSelectedItemId(null); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 transition-colors duration-150 rounded-none cursor-pointer ${
                sidebarTab === 'recent' ? 'bg-mint/20 text-forest border-l-2 border-forest pl-2' : 'text-forest/70 hover:bg-forest/5 hover:text-forest'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent
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

        {/* Storage Bar Indicator */}
        <div className="space-y-3 font-mono border-t border-gridColor/10 pt-6">
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
            {formatSize(usedStorage)} of 15.0 GB
          </div>
        </div>
      </aside>

      {/* Main Panel Section */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header toolbar */}
        <header className="h-16 border-b border-gridColor/10 px-8 flex items-center justify-between select-none">
          {/* Breadcrumbs or Search indicators */}
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

          {/* Search bar & Grid/List toggles */}
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH STORAGE..."
                className="w-full bg-paper border border-gridColor/20 px-3.5 py-1.5 text-[9px] font-mono font-bold tracking-wider rounded-none focus:outline-none focus:border-forest text-forest placeholder-forest/40 uppercase"
              />
              <svg className="w-3.5 h-3.5 absolute right-3 top-2.5 text-forest/40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
              </svg>
            </div>

            {/* Layout Mode Toggles */}
            <div className="flex items-center border border-gridColor/20 p-[1px] rounded-none">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1 cursor-pointer transition-colors ${layoutMode === 'grid' ? 'bg-forest text-paper' : 'text-forest/65 hover:bg-forest/5'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1 cursor-pointer transition-colors ${layoutMode === 'list' ? 'bg-forest text-paper' : 'text-forest/65 hover:bg-forest/5'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 14h16v-2H4v2zm0 4h16v-2H4v2zM4 6v2h16V6H4zm0 4h16V8H4v2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Directory Files Grid / List layout */}
        <div className="flex-1 overflow-y-auto p-8 relative" onClick={() => setSelectedItemId(null)}>
          {displayedItems.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center font-mono text-[10px] text-forest/40 uppercase tracking-widest">
              <svg className="w-12 h-12 mb-3.5 text-forest/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0A2.25 2.25 0 012.25 10.5V6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v4.5m-18 0A2.25 2.25 0 002.25 13.5v6A2.25 2.25 0 004.5 21.75h15A2.25 2.25 0 0021.75 19.5v-6A2.25 2.25 0 0019.5 13.5m-10.5-6h3m-3 3h3" />
              </svg>
              <span>Empty Directory</span>
            </div>
          ) : layoutMode === 'grid' ? (
            /* Grid Explorer View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {displayedItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onClick={(e) => { e.stopPropagation(); handleItemClick(item.id); }}
                    onDoubleClick={() => handleDoubleClick(item)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                      setActiveMenuId(item.id);
                    }}
                    className={`relative border p-4.5 flex flex-col items-center justify-between cursor-pointer group transition-all rounded-none h-40 ${
                      isSelected
                        ? 'border-forest bg-mint/10'
                        : 'border-gridColor/10 hover:border-forest/40 bg-paper/50'
                    }`}
                  >
                    {/* Floating star indicator */}
                    {item.starred && (
                      <div className="absolute top-2.5 right-2.5 text-gold">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </div>
                    )}

                    {/* Icon block */}
                    <div className="mb-4 text-forest/80 group-hover:scale-105 transition-transform duration-200">
                      {getFileIcon(item.type)}
                    </div>

                    {/* Name block */}
                    <span className="w-full text-center text-[10px] font-bold text-forest truncate uppercase tracking-wider">
                      {item.name}
                    </span>

                    {/* Meta indicator (size/type) */}
                    <span className="text-[8px] text-forest/40 uppercase tracking-widest mt-1">
                      {item.type === 'folder' ? 'Folder' : formatSize(item.size)}
                    </span>

                    {/* Inline Action Dropdown Menu Trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      className="absolute bottom-2 right-2 p-1 text-forest/30 hover:text-forest hidden group-hover:block transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* Context Action Menu */}
                    {activeMenuId === item.id && (
                      <div
                        className="absolute top-full right-0 mt-1 bg-white border border-gridColor/20 shadow-xl z-30 py-1.5 w-44 font-mono text-[9px] font-bold uppercase tracking-wider select-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!item.trashed ? (
                          <>
                            <button
                              onClick={() => { toggleStar(item.id); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                            >
                              Star / Unstar
                            </button>
                            {item.type !== 'folder' && (
                              <button
                                onClick={() => { setShowShareModal(true); setActiveMenuId(null); }}
                                className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                              >
                                Get Share Link
                              </button>
                            )}
                            <button
                              onClick={() => { setRenameItemId(item.id); setRenameValue(item.name); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => { deleteItem(item.id); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 hover:bg-coral/20 text-coral flex items-center gap-2 cursor-pointer border-t border-gridColor/5 mt-1.5 pt-2"
                            >
                              Move to Trash
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { restoreItem(item.id); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => { permanentlyDeleteItem(item.id); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 hover:bg-coral/20 text-coral flex items-center gap-2 cursor-pointer border-t border-gridColor/5 mt-1.5 pt-2"
                            >
                              Delete Forever
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Explorer View */
            <div className="border border-gridColor/10 rounded-none overflow-hidden select-none">
              <table className="w-full text-left font-mono text-[9px] uppercase tracking-wider">
                <thead className="bg-paper border-b border-gridColor/10 font-bold text-forest/70">
                  <tr>
                    <th className="p-4 w-1/2">Name</th>
                    <th className="p-4 w-1/6">Last Modified</th>
                    <th className="p-4 w-1/8">Size</th>
                    <th className="p-4 w-1/8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.map((item) => {
                    const isSelected = item.id === selectedItemId;
                    return (
                      <tr
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); handleItemClick(item.id); }}
                        onDoubleClick={() => handleDoubleClick(item)}
                        className={`border-b border-gridColor/10 group cursor-pointer transition-colors ${
                          isSelected ? 'bg-mint/15' : 'hover:bg-paper/40'
                        }`}
                      >
                        <td className="p-4 flex items-center gap-3.5 font-bold">
                          <div className="text-forest/65 scale-75">
                            {getFileIcon(item.type)}
                          </div>
                          <span>{item.name}</span>
                          {item.starred && <span className="text-gold font-bold">★</span>}
                        </td>
                        <td className="p-4 text-forest/60">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-forest/60">
                          {item.type === 'folder' ? '-' : formatSize(item.size)}
                        </td>
                        <td className="p-4 text-right relative">
                          <div className="flex justify-end gap-3.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStar(item.id); }}
                              className="text-forest/30 hover:text-gold cursor-pointer"
                            >
                              ★
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === item.id ? null : item.id);
                              }}
                              className="text-forest/30 hover:text-forest cursor-pointer font-bold"
                            >
                              •••
                            </button>
                          </div>

                          {/* Context Action Menu for List View */}
                          {activeMenuId === item.id && (
                            <div
                              className="absolute top-full right-4 mt-1 bg-white border border-gridColor/20 shadow-xl z-30 py-1.5 w-44 font-mono text-[9px] font-bold uppercase tracking-wider text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!item.trashed ? (
                                <>
                                  {item.type !== 'folder' && (
                                    <button
                                      onClick={() => { setShowShareModal(true); setActiveMenuId(null); }}
                                      className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                                    >
                                      Get Share Link
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { setRenameItemId(item.id); setRenameValue(item.name); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    onClick={() => { deleteItem(item.id); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2 hover:bg-coral/20 text-coral flex items-center gap-2 cursor-pointer border-t border-gridColor/5 mt-1.5 pt-2"
                                  >
                                    Move to Trash
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => { restoreItem(item.id); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2 hover:bg-mint/20 flex items-center gap-2 cursor-pointer"
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => { permanentlyDeleteItem(item.id); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2 hover:bg-coral/20 text-coral flex items-center gap-2 cursor-pointer border-t border-gridColor/5 mt-1.5 pt-2"
                                  >
                                    Delete Forever
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Selected Item Details Drawer Sidebar */}
      {selectedItem && (
        <aside className="w-80 border-l border-gridColor/10 p-6 flex flex-col gap-6 bg-paper overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gridColor/10 pb-4">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-forest">File Details</h3>
            <button
              onClick={() => setSelectedItemId(null)}
              className="text-forest/50 hover:text-forest text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>

          {/* Thumbnail preview */}
          <div className="h-44 bg-gridColor/5 border border-gridColor/10 flex items-center justify-center p-4">
            {getFileIcon(selectedItem.type)}
          </div>

          {/* Name & Basic Info */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-forest truncate">{selectedItem.name}</h4>
            <p className="text-[8px] uppercase tracking-widest text-forest/40 mt-1">{selectedItem.type} Resource</p>
          </div>

          {/* Detail Metadata Grid */}
          <div className="space-y-3.5 font-mono text-[9px] border-t border-b border-gridColor/10 py-5">
            <div className="flex justify-between">
              <span className="text-forest/50 uppercase tracking-wider">Type</span>
              <span className="font-bold text-forest uppercase">{selectedItem.type}</span>
            </div>
            {selectedItem.type !== 'folder' && (
              <div className="flex justify-between">
                <span className="text-forest/50 uppercase tracking-wider">Size</span>
                <span className="font-bold text-forest">{formatSize(selectedItem.size)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-forest/50 uppercase tracking-wider">Owner</span>
              <span className="font-bold text-forest truncate max-w-[160px]" title={selectedItem.owner}>
                {selectedItem.owner.split('@')[0]}
              </span>
            </div>
            <div className="flex justify-between flex-wrap gap-1">
              <span className="text-forest/50 uppercase tracking-wider">Shared With</span>
              <span className="font-bold text-forest text-right">
                {selectedItem.sharedWith && selectedItem.sharedWith.length > 0
                  ? selectedItem.sharedWith.map(s => s.split('@')[0]).join(', ')
                  : 'Only You'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest/50 uppercase tracking-wider">Created</span>
              <span className="font-bold text-forest">{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest/50 uppercase tracking-wider">Modified</span>
              <span className="font-bold text-forest">{new Date(selectedItem.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* System Audit Log Activity */}
          <div className="space-y-4">
            <h4 className="font-bold text-[9px] uppercase tracking-widest text-forest/70">Audit Telemetry</h4>
            <div className="relative border-l border-gridColor/20 pl-4 space-y-4 font-mono text-[8px] uppercase tracking-wider">
              {selectedItem.auditLog.map((log, idx) => (
                <div key={idx} className="relative">
                  {/* Bullet */}
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-mint border border-forest rounded-none" />
                  <p className="font-bold text-forest">{log.action}</p>
                  <p className="text-forest/50 text-[7px] mt-0.5">
                    {log.user.split('@')[0]} // {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* CREATE FOLDER MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs flex items-center justify-center z-50 p-6 select-none font-mono">
          <div className="w-full max-w-[360px] bg-paper border border-forest p-6">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-forest mb-4 border-b border-gridColor/10 pb-2">
              Create Folder
            </h4>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="FOLDER NAME..."
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-[10px] uppercase tracking-wider focus:outline-none focus:border-forest text-forest rounded-none placeholder-forest/30"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }}
                className="px-4 py-2 border border-gridColor/30 text-[9px] uppercase tracking-widest hover:bg-forest/5 cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-forest text-paper hover:bg-mint hover:text-forest transition-colors text-[9px] uppercase tracking-widest cursor-pointer font-bold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameItemId && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs flex items-center justify-center z-50 p-6 select-none font-mono">
          <div className="w-full max-w-[360px] bg-paper border border-forest p-6">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-forest mb-4 border-b border-gridColor/10 pb-2">
              Rename Item
            </h4>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="NEW NAME..."
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-[10px] uppercase tracking-wider focus:outline-none focus:border-forest text-forest rounded-none"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setRenameItemId(null); setRenameValue(''); }}
                className="px-4 py-2 border border-gridColor/30 text-[9px] uppercase tracking-widest hover:bg-forest/5 cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                onClick={renameItem}
                className="px-4 py-2 bg-forest text-paper hover:bg-mint hover:text-forest transition-colors text-[9px] uppercase tracking-widest cursor-pointer font-bold"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE LINK MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs flex items-center justify-center z-50 p-6 select-none font-mono">
          <div className="w-full max-w-[400px] bg-paper border border-forest p-6">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-forest mb-2 border-b border-gridColor/10 pb-2">
              Share File
            </h4>
            <p className="text-[8px] uppercase tracking-widest text-forest/50 mb-4">
              Enter target collaborator's identity
            </p>
            <input
              type="email"
              value={shareEmailInput}
              onChange={(e) => setShareEmailInput(e.target.value)}
              placeholder="COLLABORATOR@ENTERPRISE.COM"
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-[10px] uppercase tracking-wider focus:outline-none focus:border-forest text-forest rounded-none placeholder-forest/30"
              autoFocus
            />
            <div className="mt-4 p-3 bg-forest/5 border border-forest/10 rounded-none text-[8px] text-forest/70 break-all select-all font-bold">
              https://nexora-95a7767b.fastapicloud.dev/shares/{selectedItemId}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowShareModal(false); setShareEmailInput(''); }}
                className="px-4 py-2 border border-gridColor/30 text-[9px] uppercase tracking-widest hover:bg-forest/5 cursor-pointer font-bold"
              >
                Close
              </button>
              <button
                onClick={shareItem}
                className="px-4 py-2 bg-forest text-paper hover:bg-mint hover:text-forest transition-colors text-[9px] uppercase tracking-widest cursor-pointer font-bold"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW LIGHTBOX MODAL */}
      {showPreviewModal && previewContent && (
        <div className="fixed inset-0 bg-forest/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-12 font-mono select-none">
          <div className="absolute top-6 right-8 flex items-center gap-4 z-50">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Simulating file download..."); }}
              className="px-4 py-2 border border-paper text-paper text-[10px] uppercase tracking-widest hover:bg-white hover:text-forest transition-colors font-bold"
            >
              Download File
            </a>
            <button
              onClick={() => { setShowPreviewModal(false); setPreviewContent(null); }}
              className="p-2 border border-paper text-paper text-xs uppercase hover:bg-white hover:text-forest cursor-pointer transition-colors font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="w-full max-w-[800px] h-[500px] bg-paper border border-forest flex flex-col p-6 items-center justify-between z-10">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-forest border-b border-gridColor/10 w-full pb-3">
              Preview // {previewContent.name}
            </h4>
            
            {/* Conditional Previews */}
            <div className="flex-1 w-full flex items-center justify-center p-8 overflow-hidden">
              {['png', 'jpg'].includes(previewContent.type) ? (
                <div className="w-full h-full bg-forest/5 border border-forest/10 flex items-center justify-center relative">
                  <span className="text-[10px] uppercase tracking-widest text-forest/40 absolute">Image Asset Preview Rendering</span>
                  <div className="w-16 h-16 bg-forest/10 border border-forest text-forest flex items-center justify-center select-none font-bold">PNG</div>
                </div>
              ) : previewContent.type === 'mp4' ? (
                <div className="w-full h-full bg-black/90 flex flex-col justify-center items-center text-paper p-8 relative">
                  <span className="text-[9px] uppercase tracking-widest text-paper/40 mb-3.5">Media Player Engine</span>
                  <div className="w-12 h-12 bg-coral text-forest rounded-full flex items-center justify-center font-bold text-lg select-none cursor-pointer">▶</div>
                </div>
              ) : (
                <div className="w-full h-full border border-forest/10 bg-forest/5 p-6 overflow-y-auto text-[9px] leading-relaxed uppercase tracking-wider text-forest/70 font-mono text-left">
                  <p className="font-bold text-forest mb-4">// TELEMETRY PROTOCOL LOGS START //</p>
                  <p className="mb-2">File Node: {previewContent.id}</p>
                  <p className="mb-2">File Hash verification: SHA-256 SECURED</p>
                  <p className="mb-2">Owner cryptosig: {previewContent.owner}</p>
                  <p className="mb-4">Sync Status: Immutable ledger check OK</p>
                  <p className="text-forest">// END OF ENCRYPTED METADATA FRAME //</p>
                </div>
              )}
            </div>

            <div className="w-full flex justify-between text-[8px] text-forest/50 uppercase tracking-widest pt-3 border-t border-gridColor/10">
              <span>Size: {formatSize(previewContent.size)}</span>
              <span>Updated: {new Date(previewContent.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SIMULATED UPLOADS STATUS DRAWER */}
      {uploads.length > 0 && (
        <div className="fixed bottom-6 right-6 w-80 bg-paper border border-forest shadow-2xl z-40 select-none font-mono">
          <div className="bg-forest text-paper px-4 py-3 flex items-center justify-between border-b border-forest">
            <span className="font-bold text-[9px] uppercase tracking-widest">Active Uploads ({uploads.filter(u => !u.completed).length})</span>
            <button
              onClick={() => setUploads([])}
              className="text-[9px] uppercase tracking-widest hover:text-coral transition-colors font-bold cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-4 space-y-3.5">
            {uploads.map((up) => (
              <div key={up.id} className="space-y-1.5">
                <div className="flex justify-between text-[8px] uppercase tracking-wider font-bold">
                  <span className="truncate max-w-[180px] text-forest" title={up.name}>{up.name}</span>
                  <span className={up.completed ? "text-mint font-bold" : "text-forest"}>
                    {up.completed ? "COMPLETED" : `${up.progress}%`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gridColor/10 border border-gridColor/20 p-[1px]">
                  <div
                    className={`h-full transition-all duration-200 ${up.completed ? "bg-mint" : "bg-forest"}`}
                    style={{ width: `${up.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
