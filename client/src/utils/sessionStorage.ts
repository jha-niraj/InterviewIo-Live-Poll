const SESSION_ID_KEY = 'polling_session_id';
const STUDENT_NAME_KEY = 'polling_student_name';
const STUDENT_ID_KEY = 'polling_student_id';
const ROLE_KEY = 'polling_role';

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const getStudentName = (): string | null => {
  return sessionStorage.getItem(STUDENT_NAME_KEY);
};

export const setStudentName = (name: string): void => {
  sessionStorage.setItem(STUDENT_NAME_KEY, name);
};

export const getStudentId = (): string | null => {
  return sessionStorage.getItem(STUDENT_ID_KEY);
};

export const setStudentId = (id: string): void => {
  sessionStorage.setItem(STUDENT_ID_KEY, id);
};

export const getRole = (): 'teacher' | 'student' | null => {
  return sessionStorage.getItem(ROLE_KEY) as 'teacher' | 'student' | null;
};

export const setRole = (role: 'teacher' | 'student'): void => {
  sessionStorage.setItem(ROLE_KEY, role);
};

export const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_ID_KEY);
  sessionStorage.removeItem(STUDENT_NAME_KEY);
  sessionStorage.removeItem(STUDENT_ID_KEY);
  sessionStorage.removeItem(ROLE_KEY);
};
