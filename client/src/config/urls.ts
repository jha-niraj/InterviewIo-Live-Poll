const isDevelopment = import.meta.env.DEV;

const DEV_SERVER_URL = 'http://localhost:3000';
const PROD_SERVER_URL = 'https://interviewio-live-poll.onrender.com';

export const SERVER_URL = isDevelopment ? DEV_SERVER_URL : PROD_SERVER_URL;

export const serverUrl = `${SERVER_URL}/api/v1`;

export const SOCKET_URL = SERVER_URL;