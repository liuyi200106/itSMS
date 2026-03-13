export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher' | 'admin';
  role_display: string;
  student_id?: string;
  employee_id?: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  teacher: number;
  teacher_name: string;
  credits: number;
  semester: string;
  max_students: number;
  cover_image?: string;
  is_active: boolean;
  student_count: number;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  progress?: number;
}

export interface Task {
  id: number;
  course: number;
  course_name: string;
  title: string;
  description: string;
  due_date: string;
  total_score: number;
  weight: number;
  submission_status?: string;
  submission_id?: number;
  score?: number;
  created_at: string;
}

export interface TaskSubmission {
  id: number;
  student: number;
  student_name: string;
  task: number;
  task_title: string;
  content: string;
  attachment?: string;
  score?: number;
  feedback?: string;
  status: string;
  status_display: string;
  submitted_at: string;
  graded_at?: string;
}

export interface CourseResource {
  id: number;
  course: number;
  title: string;
  description?: string;
  resource_type: string;
  resource_type_display: string;
  file: string;
  file_size: number;
  uploaded_by: number;
  uploader_name: string;
  download_count: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  course: number;
  title: string;
  content: string;
  priority: string;
  priority_display: string;
  is_pinned: boolean;
  is_active: boolean;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_name: string;
  status: string;
  enrolled_at: string;
  completed_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
