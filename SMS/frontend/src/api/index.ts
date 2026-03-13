import axios from 'axios';
import type { Announcement, Course, CourseResource, Enrollment, LoginResponse, Task, TaskSubmission, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }),
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => api.post<LoginResponse>('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get<User>('/auth/me/'),
  changePassword: (old_password: string, new_password: string, new_password_confirm: string) =>
    api.post('/auth/change_password/', { old_password, new_password, new_password_confirm }),
  getAllUsers: () => api.get<User[]>('/auth/'),
  getStudents: () => api.get<User[]>('/auth/students/'),
  getTeachers: () => api.get<User[]>('/auth/teachers/'),
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
    student_id?: string;
    employee_id?: string;
    phone?: string;
  }) => api.post<User>('/auth/', data),
  updateUser: (id: number, data: Partial<User>) => api.put<User>(`/auth/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/auth/${id}/`),
};

export const courseAPI = {
  getCourses: () => api.get<Course[]>('/courses/'),
  getCourse: (id: number) => api.get<Course>(`/courses/${id}/`),
  createCourse: (data: Partial<Course>) => api.post<Course>('/courses/', data),
  updateCourse: (id: number, data: Partial<Course>) => api.put<Course>(`/courses/${id}/`, data),
  deleteCourse: (id: number) => api.delete(`/courses/${id}/`),
  enroll: (id: number) => api.post(`/courses/${id}/enroll/`),
  drop: (id: number) => api.post(`/courses/${id}/drop/`),
  myCourses: () => api.get<Course[]>('/courses/my_courses/'),
  availableCourses: () => api.get<Course[]>('/courses/available/'),
  teachingCourses: () => api.get<Course[]>('/courses/teaching/'),
  getCourseStudents: (id: number) => api.get<User[]>(`/courses/${id}/students/`),
};

export const taskAPI = {
  getTasks: () => api.get<Task[]>('/tasks/'),
  getTask: (id: number) => api.get<Task>(`/tasks/${id}/`),
  createTask: (data: Partial<Task>) => api.post<Task>('/tasks/', data),
  updateTask: (id: number, data: Partial<Task>) => api.put<Task>(`/tasks/${id}/`, data),
  deleteTask: (id: number) => api.delete(`/tasks/${id}/`),
  myTasks: () => api.get<Task[]>('/tasks/my_tasks/'),
  pendingTasks: () => api.get<Task[]>('/tasks/pending/'),
  getSubmissions: (taskId: number) => api.get<TaskSubmission[]>(`/submissions/?task=${taskId}`),
  createSubmission: (taskId: number, content: string) =>
    api.post<TaskSubmission>('/submissions/', { task: taskId, content }),
  gradeSubmission: (id: number, score: number, feedback: string) =>
    api.post<TaskSubmission>(`/submissions/${id}/grade/`, { score, feedback }),
  getCourseSubmissions: (courseId: number) =>
    api.get<TaskSubmission[]>(`/submissions/course_submissions/?course_id=${courseId}`),
};

export const resourceAPI = {
  getResources: (courseId?: number) =>
    courseId
      ? api.get<CourseResource[]>(`/resources/course_resources/?course_id=${courseId}`)
      : api.get<CourseResource[]>('/resources/'),
  getResource: (id: number) => api.get<CourseResource>(`/resources/${id}/`),
  createResource: (data: FormData) =>
    api.post<CourseResource>('/resources/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateResource: (id: number, data: FormData) =>
    api.put<CourseResource>(`/resources/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteResource: (id: number) => api.delete(`/resources/${id}/`),
  downloadResource: (id: number) => api.get(`/resources/${id}/download/`, { responseType: 'blob' as const }),
};

export const announcementAPI = {
  getAnnouncements: (courseId?: number) =>
    courseId
      ? api.get<Announcement[]>(`/announcements/course_announcements/?course_id=${courseId}`)
      : api.get<Announcement[]>('/announcements/'),
  getAnnouncement: (id: number) => api.get<Announcement>(`/announcements/${id}/`),
  createAnnouncement: (data: Partial<Announcement>) => api.post<Announcement>('/announcements/', data),
  updateAnnouncement: (id: number, data: Partial<Announcement>) =>
    api.put<Announcement>(`/announcements/${id}/`, data),
  deleteAnnouncement: (id: number) => api.delete(`/announcements/${id}/`),
};

export const enrollmentAPI = {
  getEnrollments: () => api.get<Enrollment[]>('/enrollments/'),
  createEnrollment: (data: { student: number; course: number; status?: string }) =>
    api.post<Enrollment>('/enrollments/', data),
  updateEnrollment: (id: number, data: Partial<Enrollment>) =>
    api.put<Enrollment>(`/enrollments/${id}/`, data),
  deleteEnrollment: (id: number) => api.delete(`/enrollments/${id}/`),
};

export default api;
