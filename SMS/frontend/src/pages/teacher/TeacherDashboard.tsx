import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, taskAPI, resourceAPI, announcementAPI } from '../../api';
import type { Course, Task, TaskSubmission, CourseResource, Announcement } from '../../types';
import { ModalForm, InputField, SelectField, CheckboxField } from '../../components/ModalForm';

type Tab = 'home' | 'courses' | 'tasks' | 'resources' | 'announcements' | 'submissions';

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', total_score: '100', weight: '1' });
  const [taskSaving, setTaskSaving] = useState(false);

  const [annModal, setAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', priority: 'normal', is_pinned: false });
  const [annSaving, setAnnSaving] = useState(false);

  const [gradeModal, setGradeModal] = useState<{ show: boolean; sub: TaskSubmission | null }>({ show: false, sub: null });
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeSaving, setGradeSaving] = useState(false);

  const [uploadForm, setUploadForm] = useState({ title: '', description: '', resource_type: 'document' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [actionError, setActionError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [courseModal, setCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState<Course | null>(null);
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseMode, setCourseMode] = useState<'create' | 'edit'>('create');

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { courseAPI.teachingCourses().then(r => setCourses(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const loadTabData = async (tab: Tab, courseId?: number | '') => {
    const cid = courseId !== undefined ? courseId : selectedCourse;
    setTabLoading(true); setActionError('');
    try {
      if (tab === 'tasks') setTasks((await taskAPI.getTasks()).data);
      else if (tab === 'resources' && cid) setResources((await resourceAPI.getResources(cid as number)).data);
      else if (tab === 'announcements' && cid) setAnnouncements((await announcementAPI.getAnnouncements(cid as number)).data);
      else if (tab === 'submissions' && cid) setSubmissions((await taskAPI.getCourseSubmissions(cid as number)).data);
    } catch (e) { console.error(e); }
    finally { setTabLoading(false); }
  };

  const handleTabChange = (tab: Tab) => { setActiveTab(tab); if (tab !== 'home' && tab !== 'courses' && tab !== 'tasks') loadTabData(tab); };
  const handleCourseSelect = async (courseId: number | '') => { setSelectedCourse(courseId); if (courseId && activeTab !== 'home' && activeTab !== 'courses') loadTabData(activeTab, courseId); };
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const openCreateCourseModal = () => { setCourseMode('create'); setCourseForm({ id: 0, name: '', code: '', description: '', teacher: 0, teacher_name: '', credits: 0, semester: '', max_students: 0, is_active: true, student_count: 0, created_at: '', updated_at: '' }); setActionError(''); setCourseModal(true); };
  const openEditCourseModal = (course: Course) => { setCourseMode('edit'); setCourseForm(course); setActionError(''); setCourseModal(true); };

  const handleSaveCourse = async () => {
    if (!courseForm) return;
    setCourseSaving(true); setActionError('');
    try {
      const payload = { name: courseForm.name, code: courseForm.code, description: courseForm.description, credits: courseForm.credits, semester: courseForm.semester, max_students: courseForm.max_students, is_active: courseForm.is_active, teacher: user?.id };
      courseMode === 'create' ? await courseAPI.createCourse(payload as any) : courseForm.id && await courseAPI.updateCourse(courseForm.id, payload as any);
      setCourses((await courseAPI.teachingCourses()).data); setCourseModal(false); setCourseForm(null);
    } catch (e: any) { setActionError(e?.response?.data?.error || 'Save failed'); }
    finally { setCourseSaving(false); }
  };

  const handleToggleCourseActive = async (course: Course) => { try { await courseAPI.updateCourse(course.id, { is_active: !course.is_active }); setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: !c.is_active } : c)); } catch (e) { console.error(e); } };

  const handleCreateTask = async () => {
    if (!selectedCourse || !taskForm.title.trim() || !taskForm.description.trim() || !taskForm.due_date) return;
    setTaskSaving(true); setActionError('');
    try {
      await taskAPI.createTask({ course: selectedCourse as number, title: taskForm.title.trim(), description: taskForm.description.trim(), due_date: taskForm.due_date, total_score: parseFloat(taskForm.total_score) || 100, weight: parseFloat(taskForm.weight) || 1 });
      setTasks((await taskAPI.getTasks()).data); setTaskModal(false); setTaskForm({ title: '', description: '', due_date: '', total_score: '100', weight: '1' });
    } catch (e: any) { setActionError(e?.response?.data?.error || 'Creation failed'); }
    finally { setTaskSaving(false); }
  };

  const handleDeleteTask = async (id: number) => { if (!confirm('Delete this task?')) return; try { await taskAPI.deleteTask(id); setTasks(prev => prev.filter(t => t.id !== id)); } catch (e: any) { setActionError(e?.response?.data?.error || 'Delete failed'); } };

  const handleUploadResource = async () => {
    if (!selectedCourse || !uploadFile || !uploadForm.title) return;
    setUploading(true); setActionError('');
    try {
      const fd = new FormData(); fd.append('course', String(selectedCourse)); fd.append('title', uploadForm.title); fd.append('description', uploadForm.description); fd.append('resource_type', uploadForm.resource_type); fd.append('file', uploadFile); fd.append('file_size', String(uploadFile.size));
      await resourceAPI.createResource(fd); await loadTabData('resources'); setUploadForm({ title: '', description: '', resource_type: 'document' }); setUploadFile(null); if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) { setActionError(e?.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDeleteResource = async (id: number) => { if (!confirm('Delete this resource?')) return; try { await resourceAPI.deleteResource(id); setResources(prev => prev.filter(r => r.id !== id)); } catch { setActionError('Delete failed'); } };

  const handleCreateAnnouncement = async () => {
    if (!selectedCourse) return;
    setAnnSaving(true); setActionError('');
    try {
      await announcementAPI.createAnnouncement({ course: selectedCourse as number, title: annForm.title, content: annForm.content, priority: annForm.priority, is_pinned: annForm.is_pinned });
      await loadTabData('announcements'); setAnnModal(false); setAnnForm({ title: '', content: '', priority: 'normal', is_pinned: false });
    } catch (e: any) { setActionError(e?.response?.data?.error || 'Publish failed'); }
    finally { setAnnSaving(false); }
  };

  const handleDeleteAnnouncement = async (id: number) => { if (!confirm('Delete this announcement?')) return; try { await announcementAPI.deleteAnnouncement(id); setAnnouncements(prev => prev.filter(a => a.id !== id)); } catch { setActionError('Delete failed'); } };

  const handleGrade = async () => {
    if (!gradeModal.sub) return;
    setGradeSaving(true); setActionError('');
    try {
      await taskAPI.gradeSubmission(gradeModal.sub.id, parseFloat(gradeScore), gradeFeedback);
      await loadTabData('submissions'); setGradeModal({ show: false, sub: null }); setGradeScore(''); setGradeFeedback('');
    } catch (e: any) { setActionError(e?.response?.data?.error || 'Grading failed'); }
    finally { setGradeSaving(false); }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { graded: 'bg-green-500 text-white', submitted: 'bg-blue-500 text-white', pending: 'bg-yellow-500 text-white' };
    const label: Record<string, string> = { graded: 'Graded', submitted: 'Submitted', pending: 'Pending' };
    return <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${map[status] ?? map.pending}`}>{label[status] ?? status}</span>;
  };

  const getGreeting = () => { const h = currentTime.getHours(); if (h < 6) return 'Good night'; if (h < 12) return 'Good morning'; if (h < 14) return 'Good noon'; if (h < 18) return 'Good afternoon'; return 'Good evening'; };
  const formatDate = (d: Date) => d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const StatCard = ({ title, value, subtitle, color, icon }: { title: string; value: number | string; subtitle: string; color: string; icon: React.ReactNode }) => (
    <div className="glass-effect p-6 card-hover relative overflow-hidden"><div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 ${color.replace('text-', 'bg-')}`} /><div className="flex items-start justify-between relative z-10"><div><p className="text-sm text-gray-500 mb-1">{title}</p><p className={`text-4xl font-bold ${color}`}>{value}</p><p className="text-xs text-gray-400 mt-1">{subtitle}</p></div><div className={`w-14 h-14 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '100')} flex items-center justify-center`}>{icon}</div></div></div>
  );

  const QuickAction = ({ icon, title, description, onClick, color }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; color: string }) => (
    <button onClick={onClick} className="glass-effect p-5 card-hover text-left w-full group"><div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>{icon}</div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-xs text-gray-400 mt-1">{description}</p></button>
  );

  const CourseSelector = ({ required = false }: { required?: boolean }) => {
    const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || '';
    return (
      <div className="mb-4 inline-block">
        <label className="text-sm font-medium text-gray-700 mr-2">Select Course{required && <span className="text-red-500">*</span>}</label>
        <div className="inline-flex items-center border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer hover:border-green-400" onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}>
          <span className={`${selectedCourseName ? 'text-gray-800' : 'text-gray-400'} mr-2`}>{selectedCourseName || '-- Select --'}</span>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        {courseDropdownOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-md min-w-[160px] max-h-40 overflow-y-auto">
            {courses.length === 0 ? <div className="px-3 py-2 text-xs text-gray-400">No courses</div> : courses.map(c => (
              <div key={c.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-green-50" onClick={() => { handleCourseSelect(c.id); setCourseDropdownOpen(false); }}>{c.name}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (tabLoading) return <div className="flex justify-center items-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
    switch (activeTab) {
      case 'courses': return (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3"><h2 className="text-2xl font-bold text-gray-800">My Courses</h2><button onClick={openCreateCourseModal} className="px-5 py-2.5 bg-white text-gray-800 text-sm rounded-xl hover:bg-gray-100 border border-gray-200">+ Create Course</button></div>
          {courses.length === 0 ? <div className="glass-effect p-16 text-center text-gray-400">No courses yet</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(course => (
                <div key={course.id} className={`glass-effect p-5 card-hover relative ${!course.is_active ? 'opacity-60' : ''}`}>
                  {!course.is_active && <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Disabled</span>}
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{course.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full inline-block mb-3">{course.code}</span>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between text-sm text-gray-400 mb-4"><span>Semester: {course.semester}</span><span>{course.credits} credits</span></div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100"><span className="text-sm font-semibold text-gray-800">{course.student_count} / {course.max_students} students</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-3"><div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, (course.student_count / course.max_students) * 100)}%` }} /></div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => openEditCourseModal(course)} className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">Edit</button>
                    <button onClick={() => handleToggleCourseActive(course)} className={`flex-1 px-3 py-2 text-sm rounded-xl ${course.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>{course.is_active ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'tasks': return (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-bold text-gray-800">Task Management</h2><button onClick={() => { setTaskModal(true); setActionError(''); }} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 border border-gray-200">+ Create Task</button></div>
          <CourseSelector />
          {actionError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-xl">{actionError}</p>}
          {selectedCourse ? tasks.filter(t => t.course === selectedCourse).length === 0 ? <div className="glass-effect p-16 text-center text-gray-400">No tasks</div> : (
            <div className="glass-effect divide-y divide-gray-50">
              {tasks.filter(t => t.course === selectedCourse).map(task => (
                <div key={task.id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50">
                  <div className="flex-1"><span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{task.course_name}</span><h3 className="font-semibold text-gray-900 mt-2">{task.title}</h3><p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p><div className="flex gap-4 mt-2 text-sm text-gray-400"><span>Due: {fmtDate(task.due_date)}</span><span>Max: {task.total_score}</span><span>Weight: {task.weight}</span></div></div>
                  <button onClick={() => handleDeleteTask(task.id)} className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg">Delete</button>
                </div>
              ))}
            </div>
          ) : <div className="glass-effect p-16 text-center text-gray-400">Select a course</div>}
        </div>
      );

      case 'resources': return (
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Resource Management</h2>
          <CourseSelector required />
          {selectedCourse && (
            <div className="glass-effect p-5 mb-5">
              <h3 className="font-semibold text-gray-800 mb-4">Upload New Resource</h3>
              {actionError && <p className="text-sm text-red-500 mb-4">{actionError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="Resource Title *" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" />
                <select value={uploadForm.resource_type} onChange={e => setUploadForm(f => ({ ...f, resource_type: e.target.value }))} className="border border-gray-200 rounded-xl px-4 py-3 text-sm"><option value="document">Document</option><option value="video">Video</option><option value="image">Image</option><option value="archive">Archive</option></select>
                <input type="text" value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="border border-gray-200 rounded-xl px-4 py-3 text-sm md:col-span-2" />
                <input ref={fileRef} type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="text-sm text-gray-600 md:col-span-2" />
              </div>
              <button onClick={handleUploadResource} disabled={uploading || !uploadForm.title || !uploadFile} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 disabled:opacity-50 border border-gray-200">{uploading ? 'Uploading...' : 'Upload Resource'}</button>
            </div>
          )}
          {!selectedCourse ? <div className="glass-effect p-16 text-center text-gray-400">Select a course</div> : resources.length === 0 ? <div className="glass-effect p-10 text-center text-gray-400">No resources</div> : (
            <div className="glass-effect divide-y divide-gray-50">
              {resources.map(res => (
                <div key={res.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">{res.resource_type === 'video' ? '🎬' : res.resource_type === 'image' ? '🖼️' : '📄'}</div><div><p className="font-medium">{res.title}</p><p className="text-xs text-gray-400">{res.resource_type_display} · {fmtSize(res.file_size)}</p></div></div>
                  <div className="flex gap-2"><a href={res.file} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-xl">Download</a><button onClick={() => handleDeleteResource(res.id)} className="px-3 py-2 text-sm text-red-500 rounded-xl">Delete</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'announcements': return (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-bold text-gray-800">Announcements</h2>{selectedCourse && <button onClick={() => { setAnnModal(true); setActionError(''); }} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 border border-gray-200">+ Post</button>}</div>
          <CourseSelector required />
          {!selectedCourse ? <div className="glass-effect p-16 text-center text-gray-400">Select a course</div> : announcements.length === 0 ? <div className="glass-effect p-10 text-center text-gray-400">No announcements</div> : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className={`glass-effect p-5 ${ann.is_pinned ? 'border-l-4 border-green-500' : ''}`}>
                  <div className="flex items-start justify-between"><div className="flex items-center gap-2 flex-wrap">{ann.is_pinned && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">📌 Pinned</span>}<span className={`px-2.5 py-1 text-xs rounded-full ${ann.priority === 'urgent' ? 'bg-red-100 text-red-700' : ann.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{ann.priority_display}</span><h3 className="font-semibold text-gray-900">{ann.title}</h3></div><button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg">Delete</button></div>
                  <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{ann.content}</p><p className="text-xs text-gray-400 mt-3">{new Date(ann.created_at).toLocaleDateString('zh-CN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 'submissions': return (
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Student Submissions</h2>
          <CourseSelector required />
          {!selectedCourse ? <div className="glass-effect p-16 text-center text-gray-400">Select a course</div> : submissions.length === 0 ? <div className="glass-effect p-10 text-center text-gray-400">No submissions</div> : (
            <div className="glass-effect divide-y divide-gray-50">
              {submissions.map(sub => (
                <div key={sub.id} className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1"><div className="flex items-center gap-2 mb-2">{statusBadge(sub.status)}<span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{sub.task_title}</span></div><p className="font-semibold text-gray-900">{sub.student_name}</p><p className="text-sm text-gray-600 mt-2 line-clamp-2">{sub.content}</p><div className="flex gap-4 mt-2 text-sm text-gray-400"><span>Submitted: {fmtDate(sub.submitted_at)}</span>{sub.score != null && <span className="text-green-600">Score: {sub.score}</span>}</div></div>
                  <button onClick={() => { setGradeModal({ show: true, sub }); setGradeScore(sub.score != null ? String(sub.score) : ''); setGradeFeedback(sub.feedback ?? ''); setActionError(''); }} className="px-5 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 border border-gray-200">{sub.status === 'graded' ? 'Re-grade' : 'Grade'}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      default: return (
        <div className="animate-fade-in-up">
          <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16" /><div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-12 -mb-12" />
            <p className="text-white/60 text-sm mb-1">{formatDate(currentTime)}</p><h2 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.last_name}{user?.first_name}</h2><p className="text-white/60">Welcome back to Teacher Console!</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Teaching Courses" value={courses.length} subtitle="courses" color="text-green-600" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>} />
            <StatCard title="Enrolled Students" value={courses.reduce((a, c) => a + c.student_count, 0)} subtitle="students" color="text-blue-600" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <StatCard title="Total Capacity" value={courses.reduce((a, c) => a + c.max_students, 0)} subtitle="slots" color="text-purple-600" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
            <StatCard title="Total Credits" value={courses.reduce((a, c) => a + c.credits, 0)} subtitle="credits" color="text-orange-500" icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>} />
          </div>
          <div className="mb-8"><h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} title="Create Task" description="Post a new task" color="bg-green-100" onClick={() => handleTabChange('tasks')} />
            <QuickAction icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} title="Upload Resource" description="Share materials" color="bg-blue-100" onClick={() => handleTabChange('resources')} />
            <QuickAction icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>} title="Post Announcement" description="Notify updates" color="bg-purple-100" onClick={() => handleTabChange('announcements')} />
            <QuickAction icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} title="Grade Assignments" description="View submissions" color="bg-orange-100" onClick={() => handleTabChange('submissions')} />
          </div></div>
          <div className="glass-effect p-6"><h3 className="text-lg font-bold text-gray-800 mb-4">Course Overview</h3>
            {courses.length === 0 ? <p className="text-center text-gray-400 py-8">No courses</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(c => (<div key={c.id} className="border border-gray-100 rounded-xl p-4 hover:border-green-200"><h4 className="font-medium">{c.name}</h4><p className="text-xs text-gray-400">{c.code} · {c.semester}</p><div className="flex justify-between text-xs mt-2"><span>Students</span><span className="font-medium text-green-600">{c.student_count}/{c.max_students}</span></div><div className="w-full bg-gray-100 rounded-full h-1.5 mt-2"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (c.student_count / c.max_students) * 100)}%` }} /></div></div>))}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>;

  const navItems: { key: Tab; label: string }[] = [{ key: 'home', label: 'Home' }, { key: 'courses', label: 'Courses' }, { key: 'tasks', label: 'Tasks' }, { key: 'resources', label: 'Resources' }, { key: 'announcements', label: 'Announcements' }, { key: 'submissions', label: 'Submissions' }];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative z-20 bg-gradient-to-r from-green-700 to-green-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4"><div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg></div><h1 className="text-xl font-bold">Teacher Dashboard</h1></div><div className="flex items-center gap-1">{navItems.map(i => (<button key={i.key} onClick={() => handleTabChange(i.key)} className={`px-4 py-2.5 rounded-xl text-sm font-medium ${activeTab === i.key ? 'bg-white/20' : 'hover:bg-white/10'}`}>{i.label}</button>))}</div></div>
          <div className="flex items-center gap-4"><span className="text-sm text-green-200 hidden sm:block">{user?.last_name}{user?.first_name}</span><button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm">Logout</button></div>
        </div></div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4">{renderContent()}</main>

      {taskModal && <ModalForm title="Create Task" subtitle="Post a new task" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} onClose={() => setTaskModal(false)} onSubmit={handleCreateTask} submitting={taskSaving} submitText={taskSaving ? 'Creating...' : 'Create Task'} error={actionError}>
        <div className="space-y-5"><SelectField label="Select Course" value={selectedCourse} onChange={v => setSelectedCourse(v as number | '')} options={courses.map(c => ({ value: c.id, label: c.name }))} placeholder="-- Select --" required /><InputField label="Task Title" value={taskForm.title} onChange={v => setTaskForm(f => ({ ...f, title: v }))} placeholder="Enter title" required /><InputField label="Description" value={taskForm.description} onChange={v => setTaskForm(f => ({ ...f, description: v }))} placeholder="Describe requirements" required multiline rows={3} /><div className="grid grid-cols-3 gap-4"><InputField label="Due Date" type="datetime-local" value={taskForm.due_date} onChange={v => setTaskForm(f => ({ ...f, due_date: v }))} required /><InputField label="Max Score" type="number" value={taskForm.total_score} onChange={v => setTaskForm(f => ({ ...f, total_score: v }))} /><InputField label="Weight" type="number" value={taskForm.weight} onChange={v => setTaskForm(f => ({ ...f, weight: v }))} /></div></div>
      </ModalForm>}

      {annModal && <ModalForm title="Post Announcement" subtitle="Send notification" theme="purple" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>} onClose={() => setAnnModal(false)} onSubmit={handleCreateAnnouncement} submitting={annSaving} submitText={annSaving ? 'Posting...' : 'Post'} error={actionError}>
        <div className="space-y-5"><InputField label="Title" value={annForm.title} onChange={v => setAnnForm(f => ({ ...f, title: v }))} placeholder="Enter title" required /><InputField label="Content" value={annForm.content} onChange={v => setAnnForm(f => ({ ...f, content: v }))} placeholder="Enter content" required multiline rows={5} /><div className="flex items-center justify-between"><SelectField label="Priority" value={annForm.priority} onChange={v => setAnnForm(f => ({ ...f, priority: v as string }))} options={[{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} /><CheckboxField label="Pin" checked={annForm.is_pinned} onChange={v => setAnnForm(f => ({ ...f, is_pinned: v }))} /></div></div>
      </ModalForm>}

      {gradeModal.show && gradeModal.sub && <ModalForm title={`Grade - ${gradeModal.sub.student_name}`} subtitle={gradeModal.sub.task_title} theme="blue" size="md" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} onClose={() => setGradeModal({ show: false, sub: null })} onSubmit={handleGrade} submitting={gradeSaving} submitText={gradeSaving ? 'Saving...' : 'Submit Grade'} error={actionError}>
        <div className="space-y-5"><div className="bg-blue-50 rounded-2xl p-5 border border-blue-100"><p className="text-xs font-semibold text-blue-600 uppercase mb-2">Submission Content</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{gradeModal.sub.content}</p></div><InputField label="Score" type="number" value={gradeScore} onChange={v => setGradeScore(v)} placeholder="Enter score" required /><InputField label="Feedback" value={gradeFeedback} onChange={v => setGradeFeedback(v)} placeholder="Enter feedback" multiline rows={3} /></div>
      </ModalForm>}

      {courseModal && courseForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6"><h3 className="text-xl font-bold mb-5">{courseMode === 'create' ? 'Create Course' : 'Edit Course'}</h3>
              {actionError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-xl">{actionError}</p>}
              <div className="space-y-4">
                <div><label className="text-sm text-gray-600 block mb-2">Course Name *</label><input type="text" value={courseForm.name} onChange={e => setCourseForm(f => f ? ({ ...f, name: e.target.value }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Enter name" /></div>
                <div><label className="text-sm text-gray-600 block mb-2">Course Code *</label><input type="text" value={courseForm.code} onChange={e => setCourseForm(f => f ? ({ ...f, code: e.target.value }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="e.g., CS101" /></div>
                <div><label className="text-sm text-gray-600 block mb-2">Description</label><textarea value={courseForm.description} onChange={e => setCourseForm(f => f ? ({ ...f, description: e.target.value }) : null)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none" /></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-sm text-gray-600 block mb-2">Credits</label><input type="number" value={courseForm.credits} onChange={e => setCourseForm(f => f ? ({ ...f, credits: parseInt(e.target.value) || 0 }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" /></div><div><label className="text-sm text-gray-600 block mb-2">Max Students</label><input type="number" value={courseForm.max_students} onChange={e => setCourseForm(f => f ? ({ ...f, max_students: parseInt(e.target.value) || 0 }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" /></div></div>
                <div><label className="text-sm text-gray-600 block mb-2">Semester *</label><input type="text" value={courseForm.semester} onChange={e => setCourseForm(f => f ? ({ ...f, semester: e.target.value }) : null)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="e.g., 2025-2026 Spring" /></div>
                <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={courseForm.is_active} onChange={e => setCourseForm(f => f ? ({ ...f, is_active: e.target.checked }) : null)} className="rounded" />Enable Course</label></div>
              </div>
              <div className="flex justify-end gap-3 mt-6"><button onClick={() => { setCourseModal(false); setCourseForm(null); }} className="px-5 py-2.5 text-sm">Cancel</button><button onClick={handleSaveCourse} disabled={courseSaving || !courseForm.name || !courseForm.code || !courseForm.semester} className="px-6 py-2.5 bg-white text-sm rounded-xl hover:bg-gray-100 disabled:opacity-50 border border-gray-200">{courseSaving ? 'Saving...' : (courseMode === 'create' ? 'Create' : 'Save')}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
