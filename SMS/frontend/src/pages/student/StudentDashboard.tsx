import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Avatar, Button, Card, Col, Empty, Input, Modal, Row, Space, Spin, Statistic, Table, Tabs, Tag, Timeline, Typography } from 'antd';
import { BellOutlined, BookOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined, FileTextOutlined, HomeOutlined, LogoutOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { announcementAPI, courseAPI, resourceAPI, taskAPI } from '../../api';
import type { Announcement, Course, CourseResource, Task } from '../../types';

const { Text } = Typography;
const { TextArea } = Input;

type TabKey = 'home' | 'courses' | 'tasks' | 'resources' | 'announcements';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [enrollLoading, setEnrollLoading] = useState<number | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [submitModal, setSubmitModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [submitContent, setSubmitContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    courseAPI.myCourses().then(r => setCourses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') {
      courseAPI.availableCourses().then(r => setAvailableCourses(r.data)).catch(console.error);
    }
  }, [activeTab]);

  const handleEnroll = async (courseId: number) => {
    setEnrollLoading(courseId);
    try {
      await courseAPI.enroll(courseId);
      const [myCourses, available] = await Promise.all([courseAPI.myCourses(), courseAPI.availableCourses()]);
      setCourses(myCourses.data);
      setAvailableCourses(available.data);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrollLoading(null);
    }
  };

  const handleDrop = async (courseId: number) => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    setEnrollLoading(courseId);
    try {
      await courseAPI.drop(courseId);
      const [myCourses, available] = await Promise.all([courseAPI.myCourses(), courseAPI.availableCourses()]);
      setCourses(myCourses.data);
      setAvailableCourses(available.data);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Drop failed');
    } finally {
      setEnrollLoading(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') return;
    setTabLoading(true);
    const load = async () => {
      try {
        if (activeTab === 'tasks') setTasks((await taskAPI.myTasks()).data);
        else if (activeTab === 'resources') setResources((await resourceAPI.getResources()).data);
        else if (activeTab === 'announcements') setAnnouncements((await announcementAPI.getAnnouncements()).data);
      } catch (e) { console.error(e); }
      finally { setTabLoading(false); }
    };
    load();
  }, [activeTab]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const taskStatusTag = (submissionStatus?: string) => {
    const config: Record<string, { color: string; text: string }> = {
      graded: { color: 'success', text: 'Graded' },
      submitted: { color: 'processing', text: 'Submitted' },
      pending: { color: 'warning', text: 'Pending' },
    };
    const c = config[submissionStatus ?? 'pending'] ?? config.pending;
    return <Tag color={c.color}>{c.text}</Tag>;
  };

  const courseStats = useMemo(() => ({
    pending: tasks.filter(t => (t.submission_status ?? 'pending') === 'pending').length,
    graded: tasks.filter(t => (t.submission_status ?? '') === 'graded').length,
  }), [tasks]);

  const renderHome = () => (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}><Card className="glass-effect"><Statistic title="My Courses" value={courses.length} prefix={<BookOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="glass-effect"><Statistic title="Pending Tasks" value={courseStats.pending} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="glass-effect"><Statistic title="Completed" value={courseStats.graded} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="glass-effect"><Statistic title="Current Time" value={currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} prefix={<CalendarOutlined />} /></Card></Col>
      </Row>
      <Card title={<><BellOutlined className="mr-2" />Latest Announcements</>} className="glass-effect">
        {announcements.length > 0 ? (
          <Timeline items={announcements.slice(0, 6).map(a => ({
            color: a.is_pinned ? 'red' : 'blue',
            children: (
              <div>
                <Space><Text strong>{a.title}</Text>{a.is_pinned && <Tag color="red">Pinned</Tag>}</Space>
                <div className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleString()} · By: {a.creator_name} · Course: {a.course}</div>
              </div>
            ),
          }))} />
        ) : <Empty description="No announcements" />}
      </Card>
    </div>
  );

  const renderCourses = () => {
    const myCourseIds = courses.map(c => c.id);
    const available = availableCourses.filter(c => !myCourseIds.includes(c.id));
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>My Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? courses.map(c => (
              <Card key={c.id} className="glass-effect hover:shadow-xl transition-all hover:scale-[1.02]" cover={<div className="h-28 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><BookOutlined className="text-5xl text-white/80" /></div>}
                actions={[<Button type="link" danger onClick={() => handleDrop(c.id)} loading={enrollLoading === c.id}>Drop</Button>]}
              >
                <Card.Meta title={<Text strong>{c.name}</Text>} description={<Space direction="vertical" size={0}><Text type="secondary">{c.code}</Text><Tag color="blue">{c.teacher_name}</Tag><Text type="secondary">Credits: {c.credits} · Semester: {c.semester}</Text></Space>} />
              </Card>
            )) : <Empty description="No courses enrolled" />}
          </div>
        </div>
        {available.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#fff' }}>Available Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map(c => (
                <Card key={c.id} className="glass-effect hover:shadow-xl transition-all hover:scale-[1.02]" cover={<div className="h-28 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center"><BookOutlined className="text-5xl text-white/80" /></div>}
                  actions={[<Button type="link" onClick={() => handleEnroll(c.id)} loading={enrollLoading === c.id}>Enroll</Button>]}
                >
                  <Card.Meta title={<Text strong>{c.name}</Text>} description={<Space direction="vertical" size={0}><Text type="secondary">{c.code}</Text><Tag color="blue">{c.teacher_name}</Tag><Text type="secondary">Credits: {c.credits} · Semester: {c.semester}</Text><Text type="secondary">Enrolled: {c.student_count || 0}/{c.max_students}</Text></Space>} />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const taskColumns = [
    { title: 'Task', dataIndex: 'title', key: 'title', render: (text: string, record: Task) => <Space direction="vertical" size={0}><Text strong>{text}</Text><Text type="secondary" style={{ fontSize: 12 }}>{record.course_name}</Text></Space> },
    { title: 'Due Date', dataIndex: 'due_date', key: 'due_date', render: (date: string) => <Tag>{new Date(date).toLocaleDateString()}</Tag> },
    { title: 'Status', dataIndex: 'submission_status', key: 'status', render: (_: any, record: Task) => taskStatusTag(record.submission_status) },
    { title: 'Action', key: 'action', render: (_: any, record: Task) => (record.submission_status ?? 'pending') === 'pending' ? <Button type="primary" size="small" icon={<SendOutlined />} onClick={() => setSubmitModal({ open: true, task: record })}>Submit</Button> : null },
  ];

  const renderTasks = () => <Card className="glass-effect"><Table dataSource={tasks} columns={taskColumns} rowKey="id" locale={{ emptyText: 'No tasks' }} pagination={{ pageSize: 10 }} /></Card>;

  const renderResources = () => (
    <Card className="glass-effect">
      <Table dataSource={resources} rowKey="id" locale={{ emptyText: 'No resources' }} columns={[
        { title: 'Resource', dataIndex: 'title', key: 'title', render: (text: string) => <Space><FileTextOutlined className="text-indigo-500" /><Text strong>{text}</Text></Space> },
        { title: 'Uploaded By', dataIndex: 'uploader_name', key: 'uploader_name' },
        { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: (d: string) => new Date(d).toLocaleDateString() },
        { title: 'Action', key: 'action', render: (_: any, record: CourseResource) => <Button type="link" icon={<DownloadOutlined />} href={record.file} target="_blank">Download</Button> },
      ]} />
    </Card>
  );

  const renderAnnouncements = () => (
    <Card className="glass-effect">
      {announcements.length > 0 ? (
        <Timeline items={announcements.map(a => ({
          color: a.is_pinned ? 'red' : 'blue',
          children: (
            <div>
              <Space><Text strong>{a.title}</Text>{a.is_pinned && <Tag color="red">Pinned</Tag>}</Space>
              <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.content}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(a.created_at).toLocaleString()} · By: {a.creator_name} · Course: {a.course}</div>
            </div>
          ),
        }))} />
      ) : <Empty description="No announcements" />}
    </Card>
  );

  const tabItems = [
    { key: 'home', label: <Space><HomeOutlined />Home</Space>, children: renderHome() },
    { key: 'courses', label: <Space><BookOutlined />My Courses</Space>, children: renderCourses() },
    { key: 'tasks', label: <Space><FileTextOutlined />Tasks</Space>, children: renderTasks() },
    { key: 'resources', label: <Space><DownloadOutlined />Resources</Space>, children: renderResources() },
    { key: 'announcements', label: <Space><BellOutlined />Announcements</Space>, children: renderAnnouncements() },
  ];

  const submitTask = async () => {
    if (!submitModal.task || !submitContent.trim()) return;
    setSubmitting(true); setSubmitError('');
    try {
      await taskAPI.createSubmission(submitModal.task.id, submitContent.trim());
      setTasks((await taskAPI.myTasks()).data);
      setSubmitModal({ open: false, task: null });
      setSubmitContent('');
    } catch (e: any) { setSubmitError(e?.response?.data?.error || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative z-20 bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            <Space><div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center"><BookOutlined /></div><span className="text-xl font-bold">Student Dashboard</span></Space>
            <Space><Avatar icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} /><span className="text-sm">{user?.last_name}{user?.first_name}</span><Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} className="text-white hover:bg-white/10">Logout</Button></Space>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {tabLoading ? <div className="py-20 flex justify-center"><Spin size="large" /></div> : <Tabs className="student-tabs" activeKey={activeTab} onChange={k => setActiveTab(k as TabKey)} items={tabItems} />}
      </main>
      <Modal title={submitModal.task?.title} open={submitModal.open} onCancel={() => { setSubmitModal({ open: false, task: null }); setSubmitContent(''); setSubmitError(''); }} onOk={submitTask} okText="Submit" cancelText="Cancel" confirmLoading={submitting} okButtonProps={{ disabled: !submitContent.trim() }} width={620}>
        {submitModal.task && (<><div className="mb-4 text-sm text-gray-600">Course: {submitModal.task.course_name} | Due: {new Date(submitModal.task.due_date).toLocaleDateString()} | Description: {submitModal.task.description}</div>{submitError && <Alert type="error" showIcon message={submitError} className="mb-4" />}<TextArea rows={6} placeholder="Enter your submission content..." value={submitContent} onChange={e => setSubmitContent(e.target.value)} /></>)}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
