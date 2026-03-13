from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from users.models import User
from courses.models import Course
from tasks.models import Task, TaskSubmission


class TaskModelTest(TestCase):
    """Task model tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='task_teacher',
            email='taskteacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='TT01'
        )
        self.course = Course.objects.create(
            name='Web Development',
            code='WEB101',
            description='Web development course',
            teacher=self.teacher,
            credits=3,
            semester='2025-Spring'
        )
        self.task = Task.objects.create(
            course=self.course,
            title='HTML Homework',
            description='Complete HTML basic exercises',
            due_date=timezone.now() + timedelta(days=10),
            total_score=100,
            weight=0.2
        )
    
    def test_task_fields(self):
        """Test task fields"""
        self.assertEqual(self.task.title, 'HTML Homework')
        self.assertEqual(self.task.total_score, 100)
        self.assertEqual(self.task.weight, 0.2)
    
    def test_task_ordering(self):
        """Test task ordering"""
        task2 = Task.objects.create(
            course=self.course,
            title='CSS Homework',
            description='Complete CSS exercises',
            due_date=timezone.now() + timedelta(days=5),
            total_score=100,
            weight=0.2
        )
        tasks = Task.objects.all()
        self.assertEqual(tasks.first(), task2)


class TaskSubmissionAPITest(TestCase):
    """Task submission API tests"""
    
    def setUp(self):
        self.teacher = User.objects.create_user(
            username='api_teacher',
            email='apiteacher@test.com',
            password='testpass123',
            role='teacher',
            employee_id='TT02'
        )
        self.student = User.objects.create_user(
            username='api_student',
            email='apistudent@test.com',
            password='testpass123',
            role='student',
            student_id='AS001'
        )
        self.course = Course.objects.create(
            name='Java Programming',
            code='JAVA101',
            description='Java programming course',
            teacher=self.teacher,
            credits=4,
            semester='2025-Spring'
        )
        self.task = Task.objects.create(
            course=self.course,
            title='Java Homework 1',
            description='Java basic exercises',
            due_date=timezone.now() + timedelta(days=7),
            total_score=100,
            weight=0.3
        )
    
    def test_create_submission(self):
        """Test create submission"""
        submission = TaskSubmission.objects.create(
            student=self.student,
            task=self.task,
            content='This is my answer',
            status='submitted'
        )
        self.assertEqual(submission.content, 'This is my answer')
        self.assertEqual(submission.status, 'submitted')
    
    def test_unique_submission(self):
        """Test unique constraint"""
        TaskSubmission.objects.create(
            student=self.student,
            task=self.task,
            content='First submission',
            status='submitted'
        )
        with self.assertRaises(Exception):
            TaskSubmission.objects.create(
                student=self.student,
                task=self.task,
                content='Second submission',
                status='submitted'
            )
    
    def test_grade_submission(self):
        """Test grading functionality"""
        submission = TaskSubmission.objects.create(
            student=self.student,
            task=self.task,
            content='Homework content',
            status='submitted'
        )
        submission.score = 85
        submission.feedback = 'Good'
        submission.status = 'graded'
        submission.save()
        
        self.assertEqual(submission.score, 85)
        self.assertEqual(submission.status, 'graded')
