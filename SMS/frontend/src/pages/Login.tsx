import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Login successful');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.non_field_errors?.[0] || 'Login failed, please check username and password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating shapes */}
      <div className="absolute top-20 left-[10%] w-20 h-20 border border-white/10 rounded-2xl rotate-12 animate-float" />
      <div className="absolute bottom-32 right-[15%] w-16 h-16 border border-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-[20%] w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: '2s' }} />

      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-2xl shadow-purple-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Course Management System</h1>
            <p className="text-white/60 text-sm">Student Course Management System</p>
          </div>

          {/* Login Card */}
          <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in-up stagger-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Welcome Back</h2>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Username"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:from-purple-700 hover:to-blue-700"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <p className="mt-2 text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 font-medium hover:text-purple-700">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in-up stagger-2">
            <p className="text-white/40 text-xs">© 2026 Course Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
