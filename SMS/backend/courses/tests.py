from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import User
from courses.models import Course, Enrollment
from tasks.models import Task, TaskSubmission


class UserModelTest(TestCase):
    """User model tests"""
    
    def setUp(self):
        """Prepare test data"""
        self.teacher = User.objects.create_user(
            username='test_teacher',
            email='teacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='T001'
        )
        self.student = User.objects.create_user(
            username='test_student',
            email='student@test.com',
            password='testpass123',
            role='student',
            student_id='S001'
        )
    
    def test_user_creation(self):
        """Test user creation"""
        self.assertEqual(self.teacher.role, 'teacher')
        self.assertEqual(self.student.role, 'student')
        self.assertEqual(self.teacher.employee_id, 'T001')
        self.assertEqual(self.student.student_id, 'S001')
    
    def test_user_str(self):
        """Test user string representation"""
        self.assertIn('test_teacher', str(self.teacher))
        self.assertIn('Student', str(self.student))


class CourseModelTest(TestCase):
    """Course model tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='course_teacher',
            email='cteacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='T002'
        )
        self.course = Course.objects.create(
            name='Python Basic',
            code='PY101',
            description='Python programming basic course',
            teacher=self.teacher,
            credits=3,
            semester='2025-Spring'
        )
    
    def test_course_creation(self):
        """Test course creation"""
        self.assertEqual(self.course.name, 'Python Basic')
        self.assertEqual(self.course.code, 'PY101')
        self.assertEqual(self.course.credits, 3)
    
    def test_course_str(self):
        """Test course string representation"""
        self.assertIn('Python Basic', str(self.course))
        self.assertIn('PY101', str(self.course))
    
    def test_course_student_count(self):
        """Test course student count"""
        self.assertEqual(self.course.student_count, 0)


class EnrollmentModelTest(TestCase):
    """Enrollment model tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='enroll_teacher',
            email='eteacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='T003'
        )
        self.course = Course.objects.create(
            name='Database',
            code='DB101',
            description='Database course',
            teacher=self.teacher,
            credits=4,
            semester='2025-Spring'
        )
        self.student = User.objects.create_user(
            username='enroll_student',
            email='estudent@test.com',
            password='testpass123',
            role='student',
            student_id='S002'
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course
        )
    
    def test_enrollment_creation(self):
        """Test enrollment creation"""
        self.assertEqual(self.enrollment.student, self.student)
        self.assertEqual(self.enrollment.course, self.course)
        self.assertEqual(self.enrollment.status, 'active')
    
    def test_enrollment_unique(self):
        """Test enrollment uniqueness"""
        with self.assertRaises(Exception):
            Enrollment.objects.create(
                student=self.student,
                course=self.course
            )


class TaskModelTest(TestCase):
    """Task model tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='task_teacher',
            email='tteacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='T004'
        )
        self.course = Course.objects.create(
            name='Algorithm',
            code='AL101',
            description='Algorithm course',
            teacher=self.teacher,
            credits=4,
            semester='2025-Spring'
        )
        self.task = Task.objects.create(
            course=self.course,
            title='Sorting Algorithm',
            description='Implement quick sort',
            due_date=timezone.now() + timedelta(days=7),
            total_score=100,
            weight=0.3
        )
    
    def test_task_creation(self):
        """Test task creation"""
        self.assertEqual(self.task.title, 'Sorting Algorithm')
        self.assertEqual(self.task.total_score, 100)
        self.assertEqual(self.task.weight, 0.3)
    
    def test_task_str(self):
        """Test task string representation"""
        self.assertIn('Sorting Algorithm', str(self.task))


class TaskSubmissionModelTest(TestCase):
    """Task submission model tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='sub_teacher',
            email='steacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='T005'
        )
        self.student = User.objects.create_user(
            username='sub_student',
            email='sstudent@test.com',
            password='testpass123',
            role='student',
            student_id='S003'
        )
        self.course = Course.objects.create(
            name='Data Structure',
            code='DS101',
            description='Data structure course',
            teacher=self.teacher,
            credits=4,
            semester='2025-Spring'
        )
        self.task = Task.objects.create(
            course=self.course,
            title='Binary Tree',
            description='Implement binary tree traversal',
            due_date=timezone.now() + timedelta(days=7),
            total_score=100,
            weight=0.2
        )
        self.submission = TaskSubmission.objects.create(
            student=self.student,
            task=self.task,
            content='Completed binary tree traversal',
            status='submitted'
        )
    
    def test_submission_creation(self):
        """Test submission creation"""
        self.assertEqual(self.submission.content, 'Completed binary tree traversal')
        self.assertEqual(self.submission.status, 'submitted')
        self.assertIsNone(self.submission.score)
    
    def test_submission_grading(self):
        """Test submission grading"""
        self.submission.score = 90
        self.submission.feedback = 'Good job'
        self.submission.status = 'graded'
        self.submission.save()
        
        self.assertEqual(self.submission.score, 90)
        self.assertEqual(self.submission.feedback, 'Good job')
        self.assertEqual(self.submission.status, 'graded')


class CourseAPITest(APITestCase):
    """Course API tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='api_teacher',
            email='api_teacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='T100'
        )
        self.student = User.objects.create_user(
            username='api_student',
            email='api_student@test.com',
            password='testpass123',
            role='student',
            student_id='S100'
        )
        self.course = Course.objects.create(
            name='Test Course',
            code='TEST101',
            description='Test course',
            teacher=self.teacher,
            credits=3,
            semester='2025-Spring'
        )
        self.client = APIClient()
    
    def test_course_list(self):
        """Test get course list"""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_student_enroll(self):
        """Test student enrollment"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course).exists())
    
    def test_teacher_cannot_enroll(self):
        """Test teacher cannot enroll"""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_duplicate_enrollment(self):
        """Test duplicate enrollment"""
        self.client.force_authenticate(user=self.student)
        self.client.post(f'/api/courses/{self.course.id}/enroll/')
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_drop_course(self):
        """Test drop course"""
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/courses/{self.course.id}/drop/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        enrollment = Enrollment.objects.get(student=self.student, course=self.course)
        self.assertEqual(enrollment.status, 'dropped')
