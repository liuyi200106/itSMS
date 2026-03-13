from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import User
from courses.models import Course, Enrollment
from tasks.models import Task, TaskSubmission
from announcements.models import Announcement


class Command(BaseCommand):
    help = 'Populate test data'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate test data...')

        # ── 1. Create Users ──────────────────────────────────────────
        admin = self._create_user(
            username='admin', password='admin123',
            first_name='Admin', last_name='User',
            email='admin@school.edu', role='admin', is_staff=True, is_superuser=True,
        )

        teachers = [
            self._create_user(
                username='teacher_zhang', password='teacher123',
                first_name='Wei', last_name='Zhang',
                email='zhang@school.edu', role='teacher', employee_id='T001',
            ),
            self._create_user(
                username='teacher_li', password='teacher123',
                first_name='Fang', last_name='Li',
                email='li@school.edu', role='teacher', employee_id='T002',
            ),
            self._create_user(
                username='teacher_wang', password='teacher123',
                first_name='Qiang', last_name='Wang',
                email='wang@school.edu', role='teacher', employee_id='T003',
            ),
        ]

        students = [
            self._create_user(
                username='student_liu', password='student123',
                first_name='Yang', last_name='Liu',
                email='liu@student.edu', role='student', student_id='S2021001',
            ),
            self._create_user(
                username='student_chen', password='student123',
                first_name='Jing', last_name='Chen',
                email='chen@student.edu', role='student', student_id='S2021002',
            ),
            self._create_user(
                username='student_zhao', password='student123',
                first_name='Lei', last_name='Zhao',
                email='zhao@student.edu', role='student', student_id='S2021003',
            ),
            self._create_user(
                username='student_sun', password='student123',
                first_name='Li', last_name='Sun',
                email='sun@student.edu', role='student', student_id='S2021004',
            ),
            self._create_user(
                username='student_zhou', password='student123',
                first_name='Ming', last_name='Zhou',
                email='zhou@student.edu', role='student', student_id='S2021005',
            ),
        ]
        self.stdout.write(self.style.SUCCESS(f'  Users created: 1 admin, {len(teachers)} teachers, {len(students)} students'))

        # ── 2. Create Courses ──────────────────────────────────────────
        semester = '2025-2026 Semester 2'
        courses_data = [
            dict(name='Python Programming', code='CS101', credits=3, max_students=40,
                 teacher=teachers[0], semester=semester,
                 description='Python basic syntax, object-oriented programming, common libraries usage'),
            dict(name='Data Structures and Algorithms', code='CS102', credits=4, max_students=35,
                 teacher=teachers[0], semester=semester,
                 description='Linear lists, trees, graphs and common algorithm design and analysis'),
            dict(name='Database Principles', code='CS201', credits=3, max_students=45,
                 teacher=teachers[1], semester=semester,
                 description='Relational database design, SQL language, transactions and concurrency control'),
            dict(name='Computer Networks', code='CS202', credits=3, max_students=50,
                 teacher=teachers[1], semester=semester,
                 description='Network layered model, TCP/IP protocol suite, HTTP, routing algorithms'),
            dict(name='Machine Learning Basics', code='CS301', credits=4, max_students=30,
                 teacher=teachers[2], semester=semester,
                 description='Supervised learning, unsupervised learning, neural networks and deep learning introduction'),
            dict(name='Software Engineering', code='CS302', credits=3, max_students=40,
                 teacher=teachers[2], semester=semester,
                 description='Software development process, requirements analysis, design patterns, testing and maintenance'),
        ]
        courses = []
        for data in courses_data:
            course, created = Course.objects.get_or_create(code=data['code'], defaults=data)
            if not created:
                for k, v in data.items():
                    setattr(course, k, v)
                course.save()
            courses.append(course)
        self.stdout.write(self.style.SUCCESS(f'  Courses created: {len(courses)} courses'))

        # ── 3. Course Enrollment ──────────────────────────────────────
        enrollments_plan = [
            (students[0], [courses[0], courses[1], courses[2]]),
            (students[1], [courses[0], courses[2], courses[3]]),
            (students[2], [courses[1], courses[3], courses[4]]),
            (students[3], [courses[0], courses[4], courses[5]]),
            (students[4], [courses[2], courses[3], courses[5]]),
        ]
        for student, enrolled_courses in enrollments_plan:
            for course in enrolled_courses:
                Enrollment.objects.get_or_create(student=student, course=course)
        self.stdout.write(self.style.SUCCESS('  Course enrollment created'))

        # ── 4. Create Tasks ──────────────────────────────────────────
        now = timezone.now()
        tasks_data = [
            dict(course=courses[0], title='Python Basic Exercises', description='Complete exercises related to lists, dictionaries, and functions',
                 due_date=now + timedelta(days=7), total_score=100, weight=0.2),
            dict(course=courses[0], title='OOP Assignment', description='Design and implement a simple Student information management class',
                 due_date=now + timedelta(days=14), total_score=100, weight=0.3),
            dict(course=courses[1], title='Sorting Algorithm Implementation', description='Implement bubble, quick, and merge sort and analyze complexity',
                 due_date=now + timedelta(days=5), total_score=100, weight=0.25),
            dict(course=courses[1], title='Binary Tree Traversal', description='Implement pre-order, in-order, and post-order traversal algorithms',
                 due_date=now + timedelta(days=10), total_score=100, weight=0.25),
            dict(course=courses[2], title='Database Design Assignment', description='Design an ER diagram for a library management system and convert to relational schema',
                 due_date=now + timedelta(days=8), total_score=100, weight=0.3),
            dict(course=courses[3], title='Network Protocol Analysis Report', description='Use Wireshark to capture packets and analyze TCP three-way handshake',
                 due_date=now + timedelta(days=6), total_score=100, weight=0.2),
            dict(course=courses[4], title='Linear Regression Experiment', description='Implement linear regression using sklearn and visualize results',
                 due_date=now + timedelta(days=12), total_score=100, weight=0.3),
            dict(course=courses[5], title='Requirements Analysis Document', description='Write a complete software requirements specification for the given system',
                 due_date=now + timedelta(days=9), total_score=100, weight=0.25),
        ]
        tasks = []
        for data in tasks_data:
            task, _ = Task.objects.get_or_create(
                course=data['course'], title=data['title'], defaults=data,
            )
            tasks.append(task)
        self.stdout.write(self.style.SUCCESS(f'  Tasks created: {len(tasks)} tasks'))

        # ── 5. Create Task Submissions ──────────────────────────────────
        submissions = [
            (students[0], tasks[0], 'Completed all exercises, attachments in zip file', 88, 'Good quality, pay attention to code standards'),
            (students[0], tasks[2], 'Implemented three sorting algorithms, drew comparison chart with matplotlib', None, None),
            (students[1], tasks[0], 'Completed most exercises, need more practice on dictionaries', 75, 'Good foundation, keep going'),
            (students[1], tasks[4], 'Completed ER diagram design, relational schema conversion attached', 92, 'Clear design thinking, good normalization'),
            (students[2], tasks[2], 'Implemented three sorting algorithms, quick sort with random pivot optimization', 95, 'Excellent! Deep understanding of algorithms'),
            (students[3], tasks[0], 'All Python basic exercises completed', 80, 'Good, keep it up'),
            (students[4], tasks[4], 'ER diagram completed, please review teacher', None, None),
        ]
        for student, task, content, score, feedback in submissions:
            # Check if student enrolled in the course
            if Enrollment.objects.filter(student=student, course=task.course).exists():
                obj, created = TaskSubmission.objects.get_or_create(
                    student=student, task=task,
                    defaults=dict(
                        content=content,
                        score=score,
                        feedback=feedback,
                        status='graded' if score is not None else 'submitted',
                    )
                )
        self.stdout.write(self.style.SUCCESS(f'  Task submissions created'))

        # ── 6. Create Announcements ──────────────────────────────────────────
        announcements_data = [
            dict(course=courses[0], title='First Assignment Released', priority='normal', is_pinned=False,
                 content='Python basic exercises have been released, please complete and submit within the deadline.', created_by=teachers[0]),
            dict(course=courses[0], title='Midterm Exam Schedule', priority='high', is_pinned=True,
                 content='Midterm exam will be held next Friday 9:00-11:00 in Building 3 Room 302, please prepare in advance.', created_by=teachers[0]),
            dict(course=courses[1], title='Algorithm Assignment Deadline Reminder', priority='urgent', is_pinned=True,
                 content='Sorting algorithm implementation assignment deadline is this Sunday 23:59, please submit ASAP.', created_by=teachers[0]),
            dict(course=courses[2], title='Database Course Notice', priority='normal', is_pinned=False,
                 content='This week course is rescheduled to Thursday afternoon 3:00-5:00, please note the change.', created_by=teachers[1]),
            dict(course=courses[4], title='Machine Learning Lab Environment Setup', priority='high', is_pinned=True,
                 content='Please install Python 3.10+, scikit-learn, pandas, matplotlib before next class.',
                 created_by=teachers[2]),
            dict(course=courses[5], title='Software Engineering Project Instructions', priority='normal', is_pinned=False,
                 content='Final project requires groups of 3, form teams and register by this Friday.', created_by=teachers[2]),
        ]
        for data in announcements_data:
            Announcement.objects.get_or_create(
                course=data['course'], title=data['title'], defaults=data,
            )
        self.stdout.write(self.style.SUCCESS(f'  Announcements created: {len(announcements_data)} announcements'))

        # ── Done ──────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ Test data population complete!'))
        self.stdout.write('')
        self.stdout.write('Account information:')
        self.stdout.write('  administrator   admin        / admin123')
        self.stdout.write('  teacher     teacher_zhang / teacher123')
        self.stdout.write('  teacher     teacher_li    / teacher123')
        self.stdout.write('  teacher     teacher_wang  / teacher123')
        self.stdout.write('  student     student_liu   / student123')
        self.stdout.write('  student     student_chen  / student123')
        self.stdout.write('  student     student_zhao  / student123')
        self.stdout.write('  student     student_sun   / student123')
        self.stdout.write('  student     student_zhou  / student123')

    def _create_user(self, username, password, first_name, last_name,
                     email, role, is_staff=False, is_superuser=False,
                     student_id=None, employee_id=None):
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            self.stdout.write(f'  User already exists, skip: {username}')
            return user
        user = User.objects.create_user(
            username=username, password=password,
            first_name=first_name, last_name=last_name,
            email=email, role=role,
            is_staff=is_staff, is_superuser=is_superuser,
        )
        if student_id:
            user.student_id = student_id
        if employee_id:
            user.employee_id = employee_id
        user.save()
        return user
