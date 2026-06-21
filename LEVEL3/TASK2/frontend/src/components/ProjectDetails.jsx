import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import KanbanBoard from './KanbanBoard';
import { 
  ArrowLeft, 
  Calendar, 
  ListTodo, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function ProjectDetails({ projectId, onBack, setNotification }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'list', 'analytics'
  const [loading, setLoading] = useState(true);
  
  // Task Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [taskDueDate, setTaskDueDate] = useState('');

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  async function loadProjectData() {
    try {
      setLoading(true);
      const [projData, tasksData, membersData] = await Promise.all([
        api.getProject(projectId),
        api.getTasks(projectId),
        api.getMembers()
      ]);
      setProject(projData);
      setTasks(tasksData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
      setNotification('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }

  const openAddTaskModal = (defaultStatus = 'To Do') => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssigneeId('');
    setTaskPriority('Medium');
    setTaskStatus(defaultStatus);
    
    // Default due date: 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setTaskDueDate(nextWeek.toISOString().split('T')[0]);
    
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskAssigneeId(task.assignee_id ? String(task.assignee_id) : '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.due_date || '');
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle) {
      setNotification('Task title is required.');
      return;
    }

    const taskData = {
      title: taskTitle,
      description: taskDescription,
      assignee_id: taskAssigneeId ? Number(taskAssigneeId) : null,
      priority: taskPriority,
      status: taskStatus,
      due_date: taskDueDate || null
    };

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, taskData);
        setNotification(`Task "${taskTitle}" updated.`);
      } else {
        await api.createTask(projectId, taskData);
        setNotification(`Task "${taskTitle}" created.`);
      }
      setIsTaskModalOpen(false);
      
      // Reload project and tasks lists
      const [projData, tasksData] = await Promise.all([
        api.getProject(projectId),
        api.getTasks(projectId)
      ]);
      setProject(projData);
      setTasks(tasksData);
    } catch (err) {
      console.error(err);
      setNotification('Failed to save task.');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      
      // Update locally immediately for snappy responsive feel
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      // Update project statistics asynchronously
      const projData = await api.getProject(projectId);
      setProject(projData);
    } catch (err) {
      console.error(err);
      setNotification('Failed to move task.');
    }
  };

  const handleTaskDelete = async (taskId, title) => {
    if (confirm(`Delete task "${title}"?`)) {
      try {
        await api.deleteTask(taskId);
        setNotification(`Task deleted.`);
        
        // Reload list
        const [projData, tasksData] = await Promise.all([
          api.getProject(projectId),
          api.getTasks(projectId)
        ]);
        setProject(projData);
        setTasks(tasksData);
      } catch (err) {
        console.error(err);
        setNotification('Failed to delete task.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="activity-dot" style={{ width: '18px', height: '18px', position: 'relative', left: 0, top: 0 }}></div>
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Loading workspace environments...</span>
      </div>
    );
  }

  if (!project) return null;

  // Calculate detailed analytics for this project
  const statusStats = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0 };
  const priorityStats = { 'High': 0, 'Medium': 0, 'Low': 0 };
  let overdueCount = 0;
  const today = new Date().toISOString().split('T')[0];

  tasks.forEach(t => {
    if (t.status in statusStats) statusStats[t.status]++;
    if (t.priority in priorityStats) priorityStats[t.priority]++;
    if (t.status !== 'Done' && t.due_date && t.due_date < today) overdueCount++;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header bar back button */}
      <div>
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} />
          Back to Projects
        </button>
      </div>

      {/* Project Meta Card */}
      <div className="glass-card project-detail-header" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '10px' }}>
          <span className={`badge badge-${project.priority.toLowerCase()}`}>{project.priority}</span>
          <span className={`badge badge-status-${project.status.toLowerCase().replace(' ', '')}`}>{project.status}</span>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{project.title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px', maxWidth: '80%' }}>
          {project.description || 'No description provided.'}
        </p>

        <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Calendar size={14} style={{ color: 'var(--color-indigo)' }} />
            <span>Timeline: <strong>{project.start_date}</strong> to <strong>{project.end_date}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <ListTodo size={14} style={{ color: 'var(--color-teal)' }} />
            <span>Progress: <strong>{project.taskStats.done} of {project.taskStats.total} Tasks Completed ({project.taskStats.progress}%)</strong></span>
          </div>
        </div>
      </div>

      {/* Switcher Tab Menu */}
      <div className="project-tabs">
        <button 
          className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListTodo size={16} />
            Kanban Board
          </div>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Task Grid List
          </div>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} />
            Metrics & Analytics
          </div>
        </button>
      </div>

      {/* Workspace Panes */}
      {activeTab === 'kanban' && (
        <KanbanBoard 
          tasks={tasks}
          members={members}
          onMoveTask={handleTaskStatusChange}
          onAddTask={openAddTaskModal}
          onEditTask={openEditTaskModal}
          onDeleteTask={handleTaskDelete}
        />
      )}

      {activeTab === 'list' && (
        <div className="glass-card task-table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>All Project Tasks</h3>
            <button className="btn btn-primary" onClick={() => openAddTaskModal('To Do')}>
              <Plus size={14} /> Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <ListTodo size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
              <p>No tasks created for this project yet.</p>
            </div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const isOverdue = task.status !== 'Done' && task.due_date && task.due_date < today;
                  return (
                    <tr key={task.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'white' }}>{task.title}</span>
                          {task.description && (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{task.description}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {task.assignee_name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="task-assignee" style={{ backgroundColor: task.avatar_color || 'var(--color-indigo)', margin: 0 }}>
                              {task.assignee_name.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span>{task.assignee_name}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      </td>
                      <td>
                        <select 
                          className="form-control"
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '12px', width: '130px' }}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="In Review">In Review</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>
                      <td>
                        <span className={isOverdue ? 'overdue' : ''} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {task.due_date || 'No Date'}
                          {isOverdue && <AlertCircle size={10} style={{ color: 'var(--color-rose)' }} />}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="icon-btn" onClick={() => openEditTaskModal(task)}>
                            <Edit size={13} />
                          </button>
                          <button className="icon-btn icon-btn-danger" onClick={() => handleTaskDelete(task.id, task.title)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Status distribution card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Task Status Distribution</h3>
            <div className="priority-distribution">
              {Object.entries(statusStats).map(([label, value]) => {
                const percent = tasks.length > 0 ? Math.round((value / tasks.length) * 100) : 0;
                let color = 'var(--color-indigo)';
                if (label === 'To Do') color = 'var(--text-muted)';
                if (label === 'In Review') color = 'var(--color-teal)';
                if (label === 'Done') color = 'var(--color-emerald)';
                
                return (
                  <div className="priority-row" key={label}>
                    <div className="priority-header">
                      <span>{label}</span>
                      <span>{value} ({percent}%)</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority breakdown card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Task Priorities Breakdown</h3>
            <div className="priority-distribution">
              {Object.entries(priorityStats).map(([label, value]) => {
                const percent = tasks.length > 0 ? Math.round((value / tasks.length) * 100) : 0;
                let color = 'var(--color-indigo)';
                if (label === 'Low') color = 'var(--color-emerald)';
                if (label === 'High') color = 'var(--color-rose)';
                
                return (
                  <div className="priority-row" key={label}>
                    <div className="priority-header">
                      <span>{label} Priority</span>
                      <span>{value} ({percent}%)</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Small stats card */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', gap: '24px', width: '100%', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-rose)' }}>{overdueCount}</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Overdue Tasks</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '40px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-indigo)' }}>
                  {tasks.filter(t => t.status !== 'Done').length}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Remaining Tasks</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-glass)', paddingLeft: '40px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-emerald)' }}>
                  {tasks.filter(t => t.status === 'Done').length}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Completed Tasks</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Task Creation / Edit Modal Dialog */}
      {isTaskModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Modify Task Details' : 'Create Project Task'}</h2>
              <button className="icon-btn" onClick={() => setIsTaskModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Write integration test suites"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Description</label>
                <textarea
                  className="form-control"
                  placeholder="Elaborate task items or acceptance criteria..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign To Member</label>
                <select
                  className="form-control"
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-control"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-control"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
