import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import TeamMembers from './components/TeamMembers';
import TimelineView from './components/TimelineView';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarRange, 
  Users, 
  Activity, 
  Sparkles,
  Bell
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'projects', 'timeline', 'team'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // Notification system
  const [notification, setNotification] = useState('');
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleNotificationChange = (msg) => {
    setNotification(msg);
  };

  // Nav titles map
  const pageDetails = {
    dashboard: { title: 'Dashboard Hub', desc: 'Central workspace insights, performance analytics, and recent actions.' },
    projects: { title: 'Workspace Projects', desc: 'Manage workflows, deliverables, project scopes, and check timelines.' },
    timeline: { title: 'Roadmap & Schedule', desc: 'Visual timeline calendar of active project tasks and schedules.' },
    team: { title: 'Team Hub', desc: 'Registered project members directory and active workload trackers.' }
  };

  const currentDetails = pageDetails[activeSection] || { title: 'Workspace', desc: '' };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="logo-text">FlowSuite</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-menu">
            <li>
              <button 
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('dashboard');
                  setSelectedProjectId(null);
                }}
                style={{ width: '100%', background: 'transparent', textAlign: 'left' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            
            <li>
              <button 
                className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('projects');
                  setSelectedProjectId(null);
                }}
                style={{ width: '100%', background: 'transparent', textAlign: 'left' }}
              >
                <FolderKanban size={18} />
                <span>Projects</span>
              </button>
            </li>

            <li>
              <button 
                className={`nav-item ${activeSection === 'timeline' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('timeline');
                  setSelectedProjectId(null);
                }}
                style={{ width: '100%', background: 'transparent', textAlign: 'left' }}
              >
                <CalendarRange size={18} />
                <span>Roadmap</span>
              </button>
            </li>

            <li>
              <button 
                className={`nav-item ${activeSection === 'team' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('team');
                  setSelectedProjectId(null);
                }}
                style={{ width: '100%', background: 'transparent', textAlign: 'left' }}
              >
                <Users size={18} />
                <span>Team Hub</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer User Details */}
        <div className="sidebar-footer">
          <div className="user-badge">AD</div>
          <div className="user-info">
            <span className="user-name">Admin Workspace</span>
            <span className="user-role">Lead Orchestrator</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        
        {/* Dynamic Page Header */}
        <header className="header-bar">
          <div className="page-title">
            <h1>
              {selectedProjectId && activeSection === 'projects' 
                ? 'Project Workspace' 
                : currentDetails.title}
            </h1>
            <p>
              {selectedProjectId && activeSection === 'projects' 
                ? 'Inspect deliverables, assign tasks, and progress status in Kanban columns.' 
                : currentDetails.desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="icon-btn" title="View alerts" style={{ padding: '8px', border: '1px solid var(--border-glass)', borderRadius: '50%', backgroundColor: 'var(--bg-glass)' }}>
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Routed views */}
        <div style={{ marginTop: '12px' }}>
          {activeSection === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveSection} 
              setSelectedProjectId={setSelectedProjectId} 
            />
          )}

          {activeSection === 'projects' && (
            selectedProjectId ? (
              <ProjectDetails 
                projectId={selectedProjectId} 
                onBack={() => setSelectedProjectId(null)} 
                setNotification={handleNotificationChange}
              />
            ) : (
              <ProjectList 
                onSelectProject={setSelectedProjectId} 
                setNotification={handleNotificationChange}
              />
            )
          )}

          {activeSection === 'timeline' && (
            <TimelineView setNotification={handleNotificationChange} />
          )}

          {activeSection === 'team' && (
            <TeamMembers setNotification={handleNotificationChange} />
          )}
        </div>
      </main>

      {/* Global Notification system popup */}
      {notification && (
        <div className="notification-banner">
          <div className="activity-dot" style={{ backgroundColor: 'var(--color-indigo)', boxShadow: '0 0 6px var(--color-indigo)' }}></div>
          <span className="notification-message">{notification}</span>
          <button className="notification-close" onClick={() => setNotification('')}>✕</button>
        </div>
      )}
    </div>
  );
}
