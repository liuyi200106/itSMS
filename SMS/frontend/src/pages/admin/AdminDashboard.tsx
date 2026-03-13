import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, courseAPI, enrollmentAPI } from '../../api';
import type { User, Course, Enrollment } from '../../types';

type Tab = 'home' | 'users' | 'courses' | 'enrollments';
type UserFilter = 'all' | 'student' | 'teacher' | 'admin';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [courseModal, setCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState<Course | null>(null);
  const [courseSaving, setCourseSaving] = useState(false);
  const [userModal, setUserModal] = useState<{ open: boolean; mode: 'create' | 'edit' }>({ open: false, mode: 'create' });
  const [userForm, setUserForm] = useState<{ id?: number; username: string; email: string; first_name: string; last_name: string; role: UserFilter; student_id?: string; employee_id?: string; phone?: string; password?: string; password_confirm?: string }>({ username: '', email: '', first_name: '', last_name: '', role: 'student', student_id: '', employee_id: '', phone: '', password: '', password_confirm: '' });
  const [userSaving, setUserSaving] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState<{ student: number | ''; course: number | ''; status: string }>({ student: '', course: '', status: 'active' });
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { Promise.all([authAPI.getStudents().then(r => setStudents(r.data)), authAPI.getTeachers().then(r => setTeachers(r.data)), courseAPI.getCourses().then(r => setCourses(r.data))]).catch(console.error).finally(() => setLoading(false)); }, []);

  const loadTabData = async (tab: Tab) => { setTabLoading(true); setActionError(''); try { if (tab === 'users') setAllUsers((await authAPI.getAllUsers()).data); else if (tab === 'courses') { setCourses((await courseAPI.getCourses()).data); setTeachers((await authAPI.getTeachers()).data); } else if (tab === 'enrollments') { setEnrollments((await enrollmentAPI.getEnrollments()).data); setStudents((await authAPI.getStudents()).data); setCourses((await courseAPI.getCourses()).data); } } catch (e) { console.error(e); } finally { setTabLoading(false); } };
  const handleTabChange = (tab: Tab) => { setActiveTab(tab); if (tab !== 'home') loadTabData(tab); };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const openCreateModal = () => { setCourseForm({ id: 0, name: '', code: '', description: '', teacher: 0, teacher_name: '', credits: 0, semester: '', max_students: 0, is_active: true, student_count: 0, created_at: '', updated_at: '' }); setActionError(''); setCourseModal(true); };
  const openEditModal = (course: Course) => { setCourseForm(course); setActionError(''); setCourseModal(true); };
  const handleSaveCourse = async () => { if (!courseForm || !courseForm.name || !courseForm.code || !courseForm.teacher || !courseForm.semester) return; setCourseSaving(true); setActionError(''); try { const data = { name: courseForm.name, code: courseForm.code, description: courseForm.description, teacher: courseForm.teacher as number, credits: courseForm.credits, semester: courseForm.semester, max_students: courseForm.max_students, is_active: courseForm.is_active }; courseForm.id ? await courseAPI.updateCourse(courseForm.id, data) : await courseAPI.createCourse(data); setCourses((await courseAPI.getCourses()).data); setCourseModal(false); setCourseForm(null); } catch (e: any) { setActionError(e?.response?.data?.error || 'Operation failed'); } finally { setCourseSaving(false); } };
  const handleDeleteCourse = async (id: number) => { if (!confirm('Delete this course?')) return; try { await courseAPI.deleteCourse(id); setCourses(prev => prev.filter(c => c.id !== id)); } catch { setActionError('Delete failed'); } };
  const handleToggleActive = async (course: Course) => { try { await courseAPI.updateCourse(course.id, { is_active: !course.is_active }); setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: !c.is_active } : c)); } catch (e) { console.error(e); } };
  const roleBadge = (role: string) => { const map: Record<string, string> = { admin: 'bg-purple-500 text-white', teacher: 'bg-green-500 text-white', student: 'bg-blue-500 text-white' }; const label: Record<string, string> = { admin: 'Admin', teacher: 'Teacher', student: 'Student' }; return <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>{label[role] ?? role}</span>; };
  const filteredUsers = userFilter === 'all' ? allUsers : allUsers.filter(u => u.role === userFilter);
  const openCreateUser = () => { setActionError(''); setUserForm({ username: '', email: '', first_name: '', last_name: '', role: 'student', student_id: '', employee_id: '', phone: '', password: '', password_confirm: '' }); setUserModal({ open: true, mode: 'create' }); };
  const openEditUser = (u: User) => { setActionError(''); setUserForm({ id: u.id, username: u.username, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, student_id: u.student_id ?? '', employee_id: u.employee_id ?? '', phone: u.phone ?? '' }); setUserModal({ open: true, mode: 'edit' }); };
  const saveUser = async () => { setUserSaving(true); setActionError(''); try { if (userModal.mode === 'create') { if (!userForm.password || !userForm.password_confirm) { setActionError('Please fill in password'); return; } await authAPI.createUser({ username: userForm.username, email: userForm.email, first_name: userForm.first_name, last_name: userForm.last_name, role: userForm.role, student_id: userForm.student_id || undefined, employee_id: userForm.employee_id || undefined, phone: userForm.phone || undefined, password: userForm.password, password_confirm: userForm.password_confirm }); } else if (userForm.id) { await authAPI.updateUser(userForm.id, { username: userForm.username, email: userForm.email, first_name: userForm.first_name, last_name: userForm.last_name, role: userForm.role as any, student_id: userForm.student_id || undefined, employee_id: userForm.employee_id || undefined, phone: userForm.phone || undefined }); } setAllUsers((await authAPI.getAllUsers()).data); setUserModal({ open: false, mode: 'create' }); } catch (e: any) { setActionError(e?.response?.data?.detail || e?.response?.data?.error || 'Operation failed'); } finally { setUserSaving(false); } };
  const deleteUser = async (u: User) => { if (!confirm(`Delete user "${u.username}"?`)) return; try { await authAPI.deleteUser(u.id); setAllUsers(prev => prev.filter(x => x.id !== u.id)); } catch (e: any) { setActionError(e?.response?.data?.error || 'Failed to delete'); } };
  const createEnrollment = async () => { if (!enrollForm.student || !enrollForm.course) return; setEnrollSaving(true); setActionError(''); try { await enrollmentAPI.createEnrollment({ student: enrollForm.student as number, course: enrollForm.course as number, status: enrollForm.status }); setEnrollments((await enrollmentAPI.getEnrollments()).data); setEnrollModal(false); setEnrollForm({ student: '', course: '', status: 'active' }); } catch (e: any) { setActionError(e?.response?.data?.error || 'Failed to create'); } finally { setEnrollSaving(false); } };
  const deleteEnrollment = async (en: Enrollment) => { if (!confirm('Delete enrollment?')) return; try { await enrollmentAPI.deleteEnrollment(en.id); setEnrollments(prev => prev.filter(x => x.id !== en.id)); } catch (e: any) { setActionError(e?.response?.data?.error || 'Failed to delete'); } };
  const getGreeting = () => { const h = currentTime.getHours(); if (h < 6) return 'Good night'; if (h < 12) return 'Good morning'; if (h < 14) return 'Good noon'; if (h < 18) return 'Good afternoon'; return 'Good evening'; };
  const formatDate = (d: Date) => d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const totalCapacity = courses.reduce((a, c) => a + c.max_students, 0);
  const usedCapacity = courses.reduce((a, c) => a + c.student_count, 0);
  const capacityPercent = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

  const StatCard = ({ title, value, subtitle, color, icon }: { title: string; value: number | string; subtitle: string; color: string; icon: React.ReactNode }) => (
    <div className="glass-effect p-6 card-hover relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 ${color.replace('text-', 'bg-')}`} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-4xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '100')} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, description, onClick, color }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; color: string }) => (
    <button onClick={onClick} className="glass-effect p-5 card-hover text-left w-full group">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </button>
  );

  const renderCourseModal = () => {
    if (!courseModal || !courseForm) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-5">{courseForm.id ? 'Edit Course' : 'Create Course'}</h3>
            {actionError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-xl">{actionError}</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Course Name *</label>
                  <input type="text" value={courseForm.name} onChange={e => setCourseForm(f => f ? ({ ...f, name: e.target.value }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Course Code *</label>
                  <input type="text" value={courseForm.code} onChange={e => setCourseForm(f => f ? ({ ...f, code: e.target.value }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Description</label>
                <textarea value={courseForm.description} onChange={e => setCourseForm(f => f ? ({ ...f, description: e.target.value }) : null)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Instructor *</label>
                <select value={courseForm.teacher} onChange={e => setCourseForm(f => f ? ({ ...f, teacher: Number(e.target.value) }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  <option value="">-- Select --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name}{t.first_name} ({t.username})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Semester *</label>
                <input type="text" value={courseForm.semester} onChange={e => setCourseForm(f => f ? ({ ...f, semester: e.target.value }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="e.g., 2025-2026 Spring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Credits</label>
                  <input type="number" value={courseForm.credits} onChange={e => setCourseForm(f => f ? ({ ...f, credits: parseInt(e.target.value) || 0 }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Max Students</label>
                  <input type="number" value={courseForm.max_students} onChange={e => setCourseForm(f => f ? ({ ...f, max_students: parseInt(e.target.value) || 0 }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
              {courseForm.id && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={courseForm.is_active} onChange={e => setCourseForm(f => f ? ({ ...f, is_active: e.target.checked }) : null)} className="rounded" />
                    Enable Course
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setCourseModal(false)} className="px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={handleSaveCourse} disabled={courseSaving || !courseForm.name || !courseForm.code || !courseForm.teacher || !courseForm.semester} className="px-6 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 disabled:opacity-50 border border-gray-200">
                {courseSaving ? 'Saving...' : (courseForm.id ? 'Save' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserModal = () => {
    if (!userModal.open) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-5">{userModal.mode === 'create' ? 'Create User' : 'Edit User'}</h3>
            {actionError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-xl">{actionError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">Username *</label>
                <input type="text" value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Email *</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Last Name</label>
                <input type="text" value={userForm.last_name} onChange={e => setUserForm(f => ({ ...f, last_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">First Name</label>
                <input type="text" value={userForm.first_name} onChange={e => setUserForm(f => ({ ...f, first_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Role *</label>
                <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value as UserFilter }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Phone</label>
                <input type="text" value={userForm.phone ?? ''} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Student ID</label>
                <input type="text" value={userForm.student_id ?? ''} onChange={e => setUserForm(f => ({ ...f, student_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Employee ID</label>
                <input type="text" value={userForm.employee_id ?? ''} onChange={e => setUserForm(f => ({ ...f, employee_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              </div>
              {userModal.mode === 'create' && (
                <>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Password *</label>
                    <input type="password" value={userForm.password ?? ''} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Confirm *</label>
                    <input type="password" value={userForm.password_confirm ?? ''} onChange={e => setUserForm(f => ({ ...f, password_confirm: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setUserModal({ open: false, mode: 'create' })} className="px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={saveUser} disabled={userSaving || !userForm.username || !userForm.email || !userForm.role || (userModal.mode === 'create' && (!userForm.password || !userForm.password_confirm))} className="px-6 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 disabled:opacity-50 border border-gray-200">
                {userSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEnrollModal = () => {
    if (!enrollModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-5">Create Enrollment</h3>
            {actionError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-xl">{actionError}</p>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">Student *</label>
                <select value={enrollForm.student} onChange={e => setEnrollForm(f => ({ ...f, student: e.target.value ? Number(e.target.value) : '' }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.last_name}{s.first_name}（{s.username}）</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Course *</label>
                <select value={enrollForm.course} onChange={e => setEnrollForm(f => ({ ...f, course: e.target.value ? Number(e.target.value) : '' }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}（{c.code}）</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Status</label>
                <select value={enrollForm.status} onChange={e => setEnrollForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEnrollModal(false)} className="px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={createEnrollment} disabled={enrollSaving || !enrollForm.student || !enrollForm.course} className="px-6 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 disabled:opacity-50 border border-gray-200">
                {enrollSaving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (tabLoading) return <div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" /></div>;
    switch (activeTab) {
      case 'users':
        return (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              <button onClick={openCreateUser} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 border border-gray-200">+ Create User</button>
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'student', 'teacher', 'admin'] as UserFilter[]).map(f => (
                <button key={f} onClick={() => setUserFilter(f)} className={`px-5 py-2.5 rounded-xl text-sm font-medium ${userFilter === f ? 'bg-white text-gray-900 border-2 border-gray-300 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                  {f === 'all' ? `All (${allUsers.length})` : f === 'student' ? `Students (${allUsers.filter(u => u.role === 'student').length})` : f === 'teacher' ? `Teachers (${allUsers.filter(u => u.role === 'teacher').length})` : `Admins (${allUsers.filter(u => u.role === 'admin').length})`}
                </button>
              ))}
            </div>
            {filteredUsers.length === 0 ? (
              <div className="glass-effect p-16 text-center text-gray-400">No users</div>
            ) : (
              <div className="glass-effect divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <div key={u.id} className="p-5 flex items-center gap-4 hover:bg-gray-50">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 font-bold text-lg">
                      {u.last_name?.[0] ?? u.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{u.last_name}{u.first_name}</span>
                        {roleBadge(u.role)}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>@{u.username}</span>
                        <span>{u.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditUser(u)} className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">Edit</button>
                      <button onClick={() => deleteUser(u)} className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'courses':
        return (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Course Management</h2>
              <button onClick={openCreateModal} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 border border-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Create Course
              </button>
            </div>
            {courses.length === 0 ? (
              <div className="glass-effect p-16 text-center text-gray-400">No courses</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                  <div key={course.id} className={`glass-effect p-5 card-hover relative ${!course.is_active ? 'opacity-60' : ''}`}>
                    {!course.is_active && <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Disabled</span>}
                    <h3 className="font-semibold text-lg mb-2 pr-16">{course.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full inline-block mb-3">{course.code}</span>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-semibold">{course.student_count} / {course.max_students} students</span>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => openEditModal(course)} className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">Edit</button>
                      <button onClick={() => handleToggleActive(course)} className={`flex-1 px-3 py-2 text-sm rounded-xl ${course.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {course.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'enrollments':
        return (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Enrollment Management</h2>
              <button onClick={() => { setActionError(''); setEnrollModal(true); }} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 border border-gray-200">+ Create Enrollment</button>
            </div>
            {actionError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-xl">{actionError}</p>}
            {enrollments.length === 0 ? (
              <div className="glass-effect p-16 text-center text-gray-400">No enrollments</div>
            ) : (
              <div className="glass-effect divide-y divide-gray-50">
                {enrollments.map(en => (
                  <div key={en.id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="font-semibold">{en.student_name} <span className="text-gray-400">→</span> {en.course_name}</p>
                      <p className="text-xs text-gray-400 mt-1">Status: {en.status} · {new Date(en.enrolled_at).toLocaleString()}</p>
                    </div>
                    <button onClick={() => deleteEnrollment(en)} className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex-shrink-0">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="animate-fade-in-up">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
              <p className="text-white/60 text-sm mb-1">{formatDate(currentTime)}</p>
              <h2 className="text-3xl font-bold mb-2">{getGreeting()}，{user?.last_name}{user?.first_name}</h2>
              <p className="text-white/60">Welcome to the admin console!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Students" value={students.length} subtitle="enrolled students" color="text-blue-600" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
              <StatCard title="Total Teachers" value={teachers.length} subtitle="teaching staff" color="text-green-600" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>} />
              <StatCard title="Total Courses" value={courses.length} subtitle="active courses" color="text-purple-600" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
              <StatCard title="Capacity Usage" value={`${capacityPercent}%`} subtitle={`${usedCapacity}/${totalCapacity}`} color="text-orange-500" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} title="Create Course" description="Create a new course" color="bg-purple-100" onClick={() => handleTabChange('courses')} />
                <QuickAction icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} title="User Management" description="View all users" color="bg-blue-100" onClick={() => handleTabChange('users')} />
                <QuickAction icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} title="Data Analytics" description="View data reports" color="bg-green-100" onClick={() => {}} />
                <QuickAction icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} title="System Settings" description="Configure parameters" color="bg-orange-100" onClick={() => {}} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Courses</h2>
                <div className="glass-effect divide-y divide-gray-50">
                  {courses.slice(0, 5).map(c => (
                    <div key={c.id} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.teacher_name} · {c.semester}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{c.student_count}<span className="text-gray-400">/{c.max_students}</span></p>
                        <p className="text-xs text-gray-400">Students</p>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">No courses</p>}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Teacher List</h2>
                <div className="glass-effect divide-y divide-gray-50">
                  {teachers.slice(0, 5).map(t => (
                    <div key={t.id} className="px-5 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-semibold">
                        {t.last_name?.[0] ?? t.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{t.last_name}{t.first_name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                    </div>
                  ))}
                  {teachers.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">No teachers</p>}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" /></div>;
  const navItems: { key: Tab; label: string }[] = [{ key: 'home', label: 'Home' }, { key: 'users', label: 'Users' }, { key: 'courses', label: 'Courses' }, { key: 'enrollments', label: 'Enrollments' }];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative z-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-1">
                {navItems.map(i => (
                  <button key={i.key} onClick={() => handleTabChange(i.key)} className={`px-5 py-2.5 rounded-xl text-sm font-medium ${activeTab === i.key ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden sm:block">{user?.last_name}{user?.first_name}</span>
              <button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4">{renderContent()}</main>
      {renderCourseModal()}
      {renderUserModal()}
      {renderEnrollModal()}
    </div>
  );
};

export default AdminDashboard;
