import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Logger Helper to add entries to the activities table
function logActivity(projectId, taskId, message) {
  try {
    const stmt = db.prepare(
      'INSERT INTO activities (project_id, task_id, message) VALUES (?, ?, ?)'
    );
    stmt.run(projectId, taskId, message);
  } catch (error) {
    console.error('[Activity Logging Error]', error);
  }
}

// -----------------------------------------------------------------------------
// SUMMARY & STATISTICS ENDPOINT
// -----------------------------------------------------------------------------
app.get('/api/summary', (req, res) => {
  try {
    // Project counts
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    
    // Task status counts
    const tasksCount = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();
    const taskStatusMap = { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0 };
    tasksCount.forEach(item => {
      if (item.status in taskStatusMap) {
        taskStatusMap[item.status] = item.count;
      }
    });
    
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    // Overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = db.prepare(
      `SELECT t.*, p.title as project_title, m.name as assignee_name, m.avatar_color
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN members m ON t.assignee_id = m.id
       WHERE t.status != 'Done' AND t.due_date < ? AND t.due_date IS NOT NULL
       ORDER BY t.due_date ASC`
    ).all(today);

    // Project progress calculations
    const projectsList = db.prepare('SELECT id, title FROM projects').all();
    const projectsProgress = projectsList.map(proj => {
      const taskStats = db.prepare(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done
         FROM tasks WHERE project_id = ?`
      ).get(proj.id);
      
      const percent = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
      return {
        id: proj.id,
        title: proj.title,
        progress: percent
      };
    });

    res.json({
      projectsCount: totalProjects,
      tasksSummary: {
        total: totalTasks,
        ...taskStatusMap
      },
      overdueTasks,
      projectsProgress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve stats summary' });
  }
});

// -----------------------------------------------------------------------------
// MEMBERS ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/members', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM members ORDER BY name ASC');
    const members = stmt.all();
    
    // Add task load summary for each member
    const enrichedMembers = members.map(m => {
      const taskStats = db.prepare(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status != 'Done' THEN 1 ELSE 0 END) as active
         FROM tasks WHERE assignee_id = ?`
      ).get(m.id);
      return {
        ...m,
        totalTasks: taskStats.total || 0,
        activeTasks: taskStats.active || 0
      };
    });
    
    res.json(enrichedMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

app.post('/api/members', (req, res) => {
  const { name, email, avatarColor } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    const color = avatarColor || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const stmt = db.prepare('INSERT INTO members (name, email, avatar_color) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, color);
    
    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    logActivity(null, null, `New team member '${name}' was added.`);
    
    res.status(201).json(newMember);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'A member with this email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// -----------------------------------------------------------------------------
// PROJECTS ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    
    // Enrich with task metrics
    const enrichedProjects = projects.map(proj => {
      const stats = db.prepare(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'In Review' THEN 1 ELSE 0 END) as in_review,
          SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as todo
         FROM tasks WHERE project_id = ?`
      ).get(proj.id);
      
      const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
      
      return {
        ...proj,
        taskStats: {
          total: stats.total || 0,
          done: stats.done || 0,
          inProgress: stats.in_progress || 0,
          inReview: stats.in_review || 0,
          todo: stats.todo || 0,
          progress
        }
      };
    });
    
    res.json(enrichedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Fetch stats
    const stats = db.prepare(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'In Review' THEN 1 ELSE 0 END) as in_review,
        SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as todo
       FROM tasks WHERE project_id = ?`
    ).get(project.id);
    
    project.taskStats = {
      total: stats.total || 0,
      done: stats.done || 0,
      inProgress: stats.in_progress || 0,
      inReview: stats.in_review || 0,
      todo: stats.todo || 0,
      progress: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
    };
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve project' });
  }
});

app.post('/api/projects', (req, res) => {
  const { title, description, status, priority, start_date, end_date } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }
  
  try {
    const stmt = db.prepare(
      `INSERT INTO projects (title, description, status, priority, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      title,
      description || '',
      status || 'Planning',
      priority || 'Medium',
      start_date,
      end_date
    );
    
    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    logActivity(result.lastInsertRowid, null, `Project '${title}' was created.`);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, start_date, end_date } = req.body;
  
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start date, and end date are required' });
  }
  
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const stmt = db.prepare(
      `UPDATE projects 
       SET title = ?, description = ?, status = ?, priority = ?, start_date = ?, end_date = ?
       WHERE id = ?`
    );
    stmt.run(title, description || '', status, priority, start_date, end_date, id);
    
    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    logActivity(id, null, `Project '${title}' settings were updated.`);
    
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // First log activity (cascade will remove links)
    logActivity(null, null, `Project '${project.title}' was deleted.`);
    
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// -----------------------------------------------------------------------------
// TASKS ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/projects/:projectId/tasks', (req, res) => {
  const { projectId } = req.params;
  try {
    const stmt = db.prepare(
      `SELECT t.*, m.name as assignee_name, m.email as assignee_email, m.avatar_color
       FROM tasks t
       LEFT JOIN members m ON t.assignee_id = m.id
       WHERE t.project_id = ?
       ORDER BY t.created_at ASC`
    );
    const tasks = stmt.all(projectId);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

app.post('/api/projects/:projectId/tasks', (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignee_id, priority, status, due_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const stmt = db.prepare(
      `INSERT INTO tasks (project_id, assignee_id, title, description, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      projectId,
      assignee_id || null,
      title,
      description || '',
      status || 'To Do',
      priority || 'Medium',
      due_date || null
    );
    
    const newTask = db.prepare(
      `SELECT t.*, m.name as assignee_name, m.avatar_color 
       FROM tasks t LEFT JOIN members m ON t.assignee_id = m.id 
       WHERE t.id = ?`
    ).get(result.lastInsertRowid);
    
    logActivity(projectId, result.lastInsertRowid, `Task '${title}' was added to project '${project.title}'.`);
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignee_id, priority, status, due_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const stmt = db.prepare(
      `UPDATE tasks
       SET title = ?, description = ?, assignee_id = ?, priority = ?, status = ?, due_date = ?
       WHERE id = ?`
    );
    stmt.run(
      title,
      description || '',
      assignee_id || null,
      priority,
      status,
      due_date || null,
      taskId
    );
    
    const updatedTask = db.prepare(
      `SELECT t.*, m.name as assignee_name, m.avatar_color 
       FROM tasks t LEFT JOIN members m ON t.assignee_id = m.id 
       WHERE t.id = ?`
    ).get(taskId);
    
    logActivity(task.project_id, taskId, `Task '${title}' was updated.`);
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    logActivity(task.project_id, null, `Task '${task.title}' was deleted.`);
    
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(taskId);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.put('/api/tasks/:taskId/status', (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
    stmt.run(status, taskId);
    
    logActivity(
      task.project_id,
      taskId,
      `Task '${task.title}' status changed from '${task.status}' to '${status}'.`
    );
    
    const updatedTask = db.prepare(
      `SELECT t.*, m.name as assignee_name, m.avatar_color 
       FROM tasks t LEFT JOIN members m ON t.assignee_id = m.id 
       WHERE t.id = ?`
    ).get(taskId);
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// -----------------------------------------------------------------------------
// ACTIVITIES ENDPOINT
// -----------------------------------------------------------------------------
app.get('/api/activities', (req, res) => {
  try {
    const stmt = db.prepare(
      `SELECT a.*, p.title as project_title
       FROM activities a
       LEFT JOIN projects p ON a.project_id = p.id
       ORDER BY a.created_at DESC
       LIMIT 20`
    );
    const activities = stmt.all();
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve activities' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
});
