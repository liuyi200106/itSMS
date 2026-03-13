import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Select, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Option } = Select;

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: RegisterForm) => {
    if (values.password !== values.password_confirm) {
      message.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(values);
      message.success('Registration successful');
      navigate('/');
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        message.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        message.error('Registration failed, please try again later');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Floating shapes */}
      <div className="absolute top-32 right-[10%] w-20 h-20 border border-white/10 rounded-2xl -rotate-12 animate-float" />
      <div className="absolute bottom-40 left-[15%] w-16 h-16 border border-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/4 left-[20%] w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: '2s' }} />

      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-2xl shadow-purple-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/60 text-sm">Create Your Account</p>
          </div>

          {/* Register Card */}
          <div className="glass-effect rounded-3xl shadow-2xl p-6 animate-fade-in-up stagger-1">
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="first_name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="First Name" prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                  name="last_name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Last Name" prefix={<UserOutlined />} />
                </Form.Item>
              </div>

              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Username" prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Email" prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="role"
                initialValue="student"
              >
                <Select placeholder="Select role">
                  <Option value="student">Student</Option>
                  <Option value="teacher">Teacher</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password placeholder="Password (min 8 characters)" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="password_confirm"
                rules={[{ required: true, message: 'Please confirm password' }]}
              >
                <Input.Password placeholder="Confirm Password" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:from-purple-700 hover:to-blue-700"
                >
                  Sign Up
                </Button>
              </Form.Item>
            </Form>

            <p className="mt-5 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-medium hover:text-purple-700">
                Sign In
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 animate-fade-in-up stagger-2">
            <p className="text-white/40 text-xs">© 2026 Course Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
