import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Edit2, 
  Trash2, 
  Clock, 
  AlertCircle
} from 'lucide-react';

export default function ProjectList({ onSelectProject, setNotification }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setNotification('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setStatus('Planning');
    setPriority('Medium');
    
    // Set default dates: today and one month from today
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    setStartDate(today);
    setEndDate(nextMonthStr);
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description || '');
    setStatus(proj.status);
    setPriority(proj.priority);
    setStartDate(proj.start_date);
    setEndDate(proj.end_date);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      setNotification('Please fill in all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setNotification('Start date cannot be after end date.');
      return;
    }

    const projectData = {
      title,
      description,
      status,
      priority,
      start_date: startDate,
      end_date: endDate
    };

    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, projectData);
        setNotification(`Project "${title}" updated successfully.`);
      } else {
        await api.createProject(projectData);
        setNotification(`Project "${title}" created successfully.`);
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      console.error(err);
      setNotification('Failed to save project.');
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"? This will permanently delete all associated tasks.`)) {
      try {
        await api.deleteProject(id);
        setNotification(`Project "${name}" deleted.`);
        loadProjects();
      } catch (err) {
        console.error(err);
        setNotification('Failed to delete project.');
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter ? p.priority === priorityFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Search and Filters bar */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '16px 24px' }}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, position: 'relative' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', position: 'absolute', left: '12px' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select 
            className="form-control"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Create Project Button */}
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Projects Grid Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
          <div className="activity-dot" style={{ width: '16px', height: '16px', position: 'relative', left: 0, top: 0 }}></div>
          <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Loading project repository...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3>No Projects Found</h3>
          <p style={{ marginTop: '4px', fontSize: '14px' }}>Try clearing filters or create a new project to get started.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(proj => {
            const { total, done, progress } = proj.taskStats;
            const isCompleted = proj.status === 'Completed';
            
            // Priority badge styling class
            const priorityClass = `badge badge-${proj.priority.toLowerCase()}`;
            const statusClass = `badge badge-status-${proj.status.toLowerCase().replace(' ', '')}`;

            return (
              <div key={proj.id} className="glass-card project-card">
                <div>
                  <div className="project-card-header">
                    <span className={statusClass}>{proj.status}</span>
                    <span className={priorityClass}>{proj.priority}</span>
                  </div>
                  
                  <h3 onClick={() => onSelectProject(proj.id)} style={{ marginTop: '14px' }}>
                    {proj.title}
                  </h3>
                  
                  <p className="project-desc">{proj.description || 'No description provided.'}</p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="project-progress-container">
                    <div className="progress-header">
                      <span>Tasks Done</span>
                      <span>{done}/{total} ({progress}%)</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${progress}%`,
                          background: isCompleted 
                            ? 'var(--color-emerald)' 
                            : 'linear-gradient(to right, var(--color-indigo), var(--color-teal))'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="project-card-footer">
                    <span className="project-dates">
                      <Calendar size={12} />
                      {proj.start_date} to {proj.end_date}
                    </span>

                    <div className="project-actions">
                      <button 
                        className="icon-btn" 
                        onClick={() => openEditModal(proj)} 
                        title="Edit Project"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="icon-btn icon-btn-danger" 
                        onClick={() => handleDelete(proj.id, proj.title)} 
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingProject ? 'Edit Project Settings' : 'Create New Project'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Website Redesign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Explain project deliverables and scopes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
