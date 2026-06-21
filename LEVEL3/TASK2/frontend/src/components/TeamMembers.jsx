import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  UserPlus, 
  Mail, 
  CheckSquare, 
  FolderGit2, 
  AlertCircle
} from 'lucide-react';

const AVATAR_COLORS = [
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#ea580c', // Orange
  '#db2777', // Pink
  '#2563eb', // Blue
  '#059669', // Emerald
  '#7c3aed', // Purple
  '#b91c1c'  // Red
];

export default function TeamMembers({ setNotification }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Member Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      const data = await api.getMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setNotification('Failed to retrieve team roster.');
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setName('');
    setEmail('');
    // Pick a random avatar color as default
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    setAvatarColor(randomColor);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setNotification('Name and email are required.');
      return;
    }

    try {
      await api.createMember({ name, email, avatarColor });
      setNotification(`Team member "${name}" registered successfully.`);
      setIsModalOpen(false);
      loadMembers();
    } catch (err) {
      console.error(err);
      setNotification(err.message || 'Failed to register team member.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Action Header bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Active Collaborators</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Assign tasks and track active workloads of team contributors.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <UserPlus size={16} />
          Register Member
        </button>
      </div>

      {/* Grid of Team Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
          <div className="activity-dot" style={{ width: '16px', height: '16px', position: 'relative', left: 0, top: 0 }}></div>
          <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Synchronizing directory profiles...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <UserPlus size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3>No Registered Members</h3>
          <p style={{ marginTop: '4px', fontSize: '14px' }}>Add members to assign tasks and manage collaborate workspaces.</p>
        </div>
      ) : (
        <div className="members-grid">
          {members.map(member => {
            const initials = member.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={member.id} className="glass-card member-card">
                <div className="member-avatar-large" style={{ backgroundColor: member.avatar_color }}>
                  {initials}
                </div>
                <div className="member-card-details">
                  <span className="member-card-name">{member.name}</span>
                  <span className="member-card-email" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={11} />
                    {member.email}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                    <span className="member-card-tasks" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckSquare size={11} style={{ color: 'var(--color-indigo)' }} />
                      {member.totalTasks} Total
                    </span>
                    <span className="member-card-tasks" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FolderGit2 size={11} style={{ color: 'var(--color-orange)' }} />
                      <strong>{member.activeTasks} Active</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Register Team Member</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Shreyansh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="e.g. shreyansh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Accent Color</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      style={{
                        backgroundColor: color,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: avatarColor === color ? '2px solid white' : '2px solid transparent',
                        boxShadow: avatarColor === color ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                      className="avatar-color-choice"
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Collaborator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
