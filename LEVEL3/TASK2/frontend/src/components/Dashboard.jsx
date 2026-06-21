import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Layers, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Activity, 
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function Dashboard({ setActiveTab, setSelectedProjectId }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          api.getSummary(),
          api.getActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="activity-dot" style={{ width: '20px', height: '20px', position: 'relative', left: 0, top: 0 }}></div>
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Loading analytics dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid var(--color-rose)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fda4af', marginBottom: '8px' }}>
          <AlertCircle size={24} />
          <h3 style={{ fontWeight: 600 }}>Error Loading Dashboard</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => window.location.reload()}>
          Retry Connecting
        </button>
      </div>
    );
  }

  const { projectsCount, tasksSummary, overdueTasks, projectsProgress } = stats;
  const completedRate = tasksSummary.total > 0 
    ? Math.round((tasksSummary['Done'] / tasksSummary.total) * 100) 
    : 0;

  // Render SVG Circular Gauge for completion rate
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedRate / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Stats Counter Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-indigo)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
            <Layers size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{projectsCount}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-teal)', boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}>
            <CheckSquare size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{tasksSummary.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-emerald)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
            <UserCheck size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{tasksSummary['In Progress'] + tasksSummary['In Review']}</span>
            <span className="stat-label">Active Tasks</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-rose)', boxShadow: '0 0 15px rgba(244, 63, 94, 0.4)' }}>
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{overdueTasks.length}</span>
            <span className="stat-label">Overdue Tasks</span>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Main Dashboard Panel */}
        <div className="dashboard-main">
          {/* Charts Area */}
          <div className="chart-section">
            {/* SVG Circular Progress Card */}
            <div className="glass-card progress-chart-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, width: '100%', textAlign: 'left', marginBottom: '12px' }}>
                Overall Completion Rate
              </h3>
              <div className="svg-chart-container">
                <svg width="100%" height="100%" viewBox="0 0 140 140">
                  {/* Track circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="10"
                  />
                  {/* Filled circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="url(#indigoTealGradient)"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                  <defs>
                    <linearGradient id="indigoTealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-indigo)" />
                      <stop offset="100%" stopColor="var(--color-teal)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="svg-chart-text">
                  <span className="chart-percentage">{completedRate}%</span>
                  <span className="chart-label">of all tasks done</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Excellent! Keep coordinating with your team.
              </p>
            </div>

            {/* Task Priority / Status bar chart visual */}
            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                Tasks Status Breakdown
              </h3>
              <div className="priority-distribution">
                {[
                  { label: 'To Do', value: tasksSummary['To Do'], color: 'var(--text-muted)' },
                  { label: 'In Progress', value: tasksSummary['In Progress'], color: 'var(--color-indigo)' },
                  { label: 'In Review', value: tasksSummary['In Review'], color: 'var(--color-teal)' },
                  { label: 'Done', value: tasksSummary['Done'], color: 'var(--color-emerald)' }
                ].map((item, idx) => {
                  const percent = tasksSummary.total > 0 ? Math.round((item.value / tasksSummary.total) * 100) : 0;
                  return (
                    <div className="priority-row" key={idx}>
                      <div className="priority-header">
                        <span>{item.label}</span>
                        <span>{item.value} ({percent}%)</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${percent}%`, 
                            backgroundColor: item.color,
                            boxShadow: `0 0 8px ${item.color}`
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Overdue/Urgent Tasks Panel */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ color: 'var(--color-rose)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Urgent & Overdue Tasks</h3>
              </div>
              <span className="badge badge-high" style={{ textTransform: 'none' }}>
                {overdueTasks.length} pending
              </span>
            </div>
            {overdueTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <CheckSquare size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                <p style={{ fontSize: '13px' }}>Awesome! No tasks are currently overdue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {overdueTasks.slice(0, 4).map(task => (
                  <div 
                    key={task.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '16px', 
                      backgroundColor: 'rgba(244, 63, 94, 0.02)', 
                      borderColor: 'rgba(244, 63, 94, 0.15)',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="task-title" style={{ fontSize: '14px' }}>{task.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Project: {task.project_title} • Due: <strong style={{ color: '#fda4af' }}>{task.due_date}</strong>
                      </span>
                    </div>
                    {task.assignee_name && (
                      <div className="task-assignee" style={{ backgroundColor: task.avatar_color || 'var(--color-indigo)' }}>
                        {task.assignee_name.split(' ').map(n=>n[0]).join('')}
                        <span className="task-assignee-name">{task.assignee_name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel: Recent Activities & Project Progress List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Projects Progress List */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-teal)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Project Deliverables</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projectsProgress.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No projects initialized.</p>
              ) : (
                projectsProgress.map(proj => (
                  <div 
                    key={proj.id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setActiveTab('projects');
                    }}
                  >
                    <div className="progress-header" style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'white' }}>{proj.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{proj.progress}%</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${proj.progress}%`, 
                          background: 'linear-gradient(to right, var(--color-indigo), var(--color-teal))' 
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Activity size={18} style={{ color: 'var(--color-indigo)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Activities</h3>
            </div>
            {activities.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No activities logged yet.</p>
            ) : (
              <ul className="activity-feed">
                {activities.slice(0, 6).map(act => (
                  <li className="activity-item" key={act.id}>
                    <span className="activity-dot"></span>
                    <div className="activity-content">
                      <span style={{ color: 'var(--text-primary)' }}>{act.message}</span>
                      {act.project_title && (
                        <span style={{ fontSize: '11px', color: 'var(--color-teal)' }}>
                          {act.project_title}
                        </span>
                      )}
                      <span className="activity-time">
                        {new Date(act.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
