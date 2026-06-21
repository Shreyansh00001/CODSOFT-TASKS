import React from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2 
} from 'lucide-react';

const COLUMNS = [
  { id: 'To Do', title: 'To Do', color: 'var(--text-muted)' },
  { id: 'In Progress', title: 'In Progress', color: 'var(--color-indigo)' },
  { id: 'In Review', title: 'In Review', color: 'var(--color-teal)' },
  { id: 'Done', title: 'Done', color: 'var(--color-emerald)' }
];

export default function KanbanBoard({ 
  tasks, 
  members, 
  onMoveTask, 
  onAddTask, 
  onEditTask, 
  onDeleteTask 
}) {
  
  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (e, targetStatus) => {
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    if (taskId) {
      onMoveTask(taskId, targetStatus);
    }
  };

  // Quick move button actions
  const shiftStatus = (taskId, currentStatus, direction) => {
    const currentIndex = COLUMNS.findIndex(c => c.id === currentStatus);
    let nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < COLUMNS.length) {
      onMoveTask(taskId, COLUMNS[nextIndex].id);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);

        return (
          <div 
            key={col.id} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="column-header">
              <div className="column-title" style={{ color: col.color }}>
                <span className="activity-dot" style={{ backgroundColor: col.color, boxShadow: `0 0 6px ${col.color}` }}></span>
                {col.title}
              </div>
              <span className="column-count">{columnTasks.length}</span>
            </div>

            {/* Tasks Container */}
            <div className="tasks-list">
              {columnTasks.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '30px 10px', 
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  border: '1px dashed var(--border-glass)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)'
                }}>
                  Drop tasks here
                </div>
              ) : (
                columnTasks.map(task => {
                  const isOverdue = task.status !== 'Done' && task.due_date && task.due_date < today;
                  const columnIndex = COLUMNS.findIndex(c => c.id === task.status);

                  return (
                    <div 
                      key={task.id}
                      className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="task-header">
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="icon-btn" onClick={() => onEditTask(task)} title="Edit Task" style={{ padding: '2px' }}>
                            <Edit2 size={11} />
                          </button>
                          <button className="icon-btn icon-btn-danger" onClick={() => onDeleteTask(task.id, task.title)} title="Delete Task" style={{ padding: '2px' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="task-title">{task.title}</span>
                        {task.description && (
                          <p className="task-desc">{task.description}</p>
                        )}
                      </div>

                      <div className="task-footer">
                        {/* Due Date Indicator */}
                        {task.due_date ? (
                          <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                            {isOverdue ? <AlertCircle size={11} /> : <Clock size={11} />}
                            <span>{task.due_date}</span>
                          </div>
                        ) : (
                          <span></span>
                        )}

                        {/* Assignee Avatar */}
                        {task.assignee_name ? (
                          <div 
                            className="task-assignee" 
                            style={{ 
                              backgroundColor: task.avatar_color || 'var(--color-indigo)',
                              margin: 0
                            }}
                          >
                            {task.assignee_name.split(' ').map(n => n[0]).join('')}
                            <span className="task-assignee-name">{task.assignee_name}</span>
                          </div>
                        ) : (
                          <div className="task-assignee" style={{ backgroundColor: 'var(--text-muted)', fontSize: '10px' }} title="Unassigned">
                            ?
                            <span className="task-assignee-name">Unassigned</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Shift Status Controls */}
                      <div className="task-quick-move" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '8px' }}>
                        <button 
                          className="quick-move-btn"
                          disabled={columnIndex === 0}
                          onClick={() => shiftStatus(task.id, task.status, -1)}
                          style={{ opacity: columnIndex === 0 ? 0.2 : 0.8 }}
                          title="Move left"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexGrow: 1, textAlign: 'center', alignSelf: 'center' }}>
                          Move Task
                        </span>
                        <button 
                          className="quick-move-btn"
                          disabled={columnIndex === COLUMNS.length - 1}
                          onClick={() => shiftStatus(task.id, task.status, 1)}
                          style={{ opacity: columnIndex === COLUMNS.length - 1 ? 0.2 : 0.8 }}
                          title="Move right"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Task Button per Column */}
            <button 
              className="btn btn-secondary" 
              onClick={() => onAddTask(col.id)}
              style={{ width: '100%', padding: '8px', borderStyle: 'dashed', borderRadius: '12px', fontSize: '12px' }}
            >
              <Plus size={12} />
              Add task card
            </button>
          </div>
        );
      })}
    </div>
  );
}
