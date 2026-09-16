const env = (import.meta as any).env ?? {};

const apiBase = (env.VITE_API_BASE_URL || 'https://pragya-app.onrender.com').replace(/\/+$/, '');
const examBase = (env.VITE_EXAM_APP_URL || 'https://pragya-exam.netlify.app').replace(/\/+$/, '');

export const API_BASE_URL = apiBase;
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
export const EXAM_APP_URL = examBase;

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
export const wsUrl = (path: string) => `${WS_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
