import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
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
export const getSummary = () => API.get('/issues/summary');

export default API;
