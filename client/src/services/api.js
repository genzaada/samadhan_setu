import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getWorkers = () => API.get('/auth/workers');

export const createIssue = (issueData) => API.post('/issues', issueData);
export const getIssues = () => API.get('/issues');
export const assignIssue = (id, workerId) => API.put(`/issues/${id}/assign`, { workerId });
export const resolveIssue = (id, data) => API.put(`/issues/${id}/resolve`, data);
// Verify Issue (Admin Only)
export const verifyIssue = (id) => API.put(`/issues/${id}/verify`);

// Dismiss Issue (Admin Only)
export const dismissIssue = (id) => API.put(`/issues/${id}/dismiss`);

export const getSummary = () => API.get('/issues/summary');
export const getPublicIssues = () => API.get('/issues/public');
export const submitFeedback = (data) => API.post('/feedback', data);

export const improveIssue = async (text) => {
    const res = await API.post("/admin/ai/improve-issue", { rawText: text });
    return res.data;
};

export default API;
