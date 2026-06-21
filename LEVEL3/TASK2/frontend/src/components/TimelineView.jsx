import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Calendar, Layers, Clock } from 'lucide-react';

export default function TimelineView({ setNotification }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setNotification('Failed to retrieve timeline data.');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="activity-dot" style={{ width: '16px', height: '16px', position: 'relative', left: 0, top: 0 }}></div>
        <span style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}>Compiling scheduler logs...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Calendar size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <h3>No Scheduling Data</h3>
        <p style={{ marginTop: '4px', fontSize: '14px' }}>Create projects with valid start and end dates to see the roadmap.</p>
      </div>
    );
  }

  // Parse start/end dates and find global minimum and maximum dates to set timeline boundaries
  const parsedProjects = projects.map(p => ({
    ...p,
    startDateVal: new Date(p.start_date).getTime(),
    endDateVal: new Date(p.end_date).getTime()
  })).filter(p => !isNaN(p.startDateVal) && !isNaN(p.endDateVal));

  if (parsedProjects.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Calendar size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <h3>Invalid Scheduling Data</h3>
        <p style={{ marginTop: '4px', fontSize: '14px' }}>Ensure projects have correctly formatted start and end dates.</p>
      </div>
    );
  }

  // Set min/max limits (buffer by 7 days on both ends)
  const minTime = Math.min(...parsedProjects.map(p => p.startDateVal)) - 7 * 24 * 60 * 60 * 1000;
  const maxTime = Math.max(...parsedProjects.map(p => p.endDateVal)) + 7 * 24 * 60 * 60 * 1000;
  const totalDuration = maxTime - minTime;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Info Banner */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <Layers size={20} style={{ color: 'var(--color-indigo)' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Multi-Project Roadmap Timeline</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Schedule range overview: <strong>{formatDate(minTime + 7 * 24 * 60 * 60 * 1000)}</strong> to <strong>{formatDate(maxTime - 7 * 24 * 60 * 60 * 1000)}</strong>
          </p>
        </div>
      </div>

      {/* Gantt List Container */}
      <div className="glass-card timeline-container" style={{ padding: '32px' }}>
        
        {/* Timeline Header (Months indicators) */}
        <div className="timeline-row" style={{ borderBottom: '2px solid var(--border-glass)', paddingBottom: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>
          <span>PROJECTS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px' }}>
            <span>{formatDate(minTime + 7*24*60*60*1000)}</span>
            <span>{formatDate(minTime + totalDuration / 2)}</span>
            <span>{formatDate(maxTime - 7*24*60*60*1000)}</span>
          </div>
        </div>

        {/* Dynamic Project Gantt Rows */}
        {parsedProjects.map(proj => {
          // Calculate relative left offset and width percentages
          const leftPercent = ((proj.startDateVal - minTime) / totalDuration) * 100;
          const widthPercent = ((proj.endDateVal - proj.startDateVal) / totalDuration) * 100;
          
          const progress = proj.taskStats ? proj.taskStats.progress : 0;
          const priorityColor = proj.priority === 'High' 
            ? 'var(--color-rose)' 
            : proj.priority === 'Medium' 
              ? 'var(--color-orange)' 
              : 'var(--color-emerald)';

          return (
            <div key={proj.id} className="timeline-row">
              {/* Project Label Column */}
              <div className="timeline-info">
                <span className="timeline-title" style={{ color: 'white', fontWeight: 600 }}>{proj.title}</span>
                <span className="timeline-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="activity-dot" style={{ position: 'static', width: '6px', height: '6px', backgroundColor: priorityColor, boxShadow: `0 0 4px ${priorityColor}` }}></span>
                  {proj.priority} Priority • {progress}% done
                </span>
              </div>

              {/* Gantt Plot Bar Column */}
              <div style={{ position: 'relative', width: '100%', height: '36px', display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    minWidth: '50px'
                  }}
                >
                  {/* Timeline Bar widget */}
                  <div className="timeline-bar-container" style={{ height: '24px', cursor: 'help' }} title={`${proj.title}: ${proj.start_date} to ${proj.end_date} (${progress}% Done)`}>
                    <div 
                      className="timeline-bar" 
                      style={{ 
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, var(--color-indigo) 0%, var(--color-teal) 100%)`
                      }}
                    ></div>
                  </div>
                  {/* Date labels below bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>{proj.start_date.split('-').slice(1).reverse().join('/')}</span>
                    <span>{proj.end_date.split('-').slice(1).reverse().join('/')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
