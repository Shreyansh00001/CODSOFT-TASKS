const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[API Error] Request to ${endpoint} failed:`, error);
    throw error;
  }
}

export const api = {
  getSummary: () => request('/summary'),
  
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: data }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: data }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  
  getTasks: (projectId) => request(`/projects/${projectId}/tasks`),
  createTask: (projectId, data) => request(`/projects/${projectId}/tasks`, { method: 'POST', body: data }),
  updateTask: (taskId, data) => request(`/tasks/${taskId}`, { method: 'PUT', body: data }),
  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE' }),
  updateTaskStatus: (taskId, status) => request(`/tasks/${taskId}/status`, { method: 'PUT', body: { status } }),
  
  getMembers: () => request('/members'),
  createMember: (data) => request('/members', { method: 'POST', body: data }),
  
  getActivities: () => request('/activities'),
};
