from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course, Enrollment
from announcements.models import Announcement
from resources.models import Resource

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data for the system"

    def handle(self, *args, **kwargs):

        # -------- Admin --------
        if not User.objects.filter(username="admin").exists():
            admin = User.objects.create_superuser(
                username="admin",
                email="admin@example.com",
                password="admin123456",
                role="admin"
            )
            self.stdout.write("Admin created")
        else:
            admin = User.objects.get(username="admin")

        # -------- Teachers --------
        teachers = []
        for i in range(1, 5):
            username = f"teacher{i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@example.com",
                    "role": "teacher"
                }
            )
            if created:
                user.set_password("12345678")
                user.save()
            teachers.append(user)

        # -------- Students --------
        students = []
        for i in range(1, 11):
            username = f"student{i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@example.com",
                    "role": "student"
                }
            )
            if created:
                user.set_password("12345678")
                user.save()
            students.append(user)

        # -------- Courses --------
        courses = []
        course_names = [
            "Python Programming",
            "Web Development",
            "Database Systems",
            "Software Engineering",
            "Artificial Intelligence",
        ]

        for i, name in enumerate(course_names):
            course, _ = Course.objects.get_or_create(
                title=name,
                defaults={
                    "description": f"Introduction to {name}",
                    "teacher": teachers[i % len(teachers)]
                }
            )
            courses.append(course)

        # -------- Enrollments --------
        for i, student in enumerate(students):
            course = courses[i % len(courses)]
            Enrollment.objects.get_or_create(
                student=student,
                course=course
            )

        # -------- Announcements --------
        for course in courses:
            Announcement.objects.get_or_create(
                title=f"{course.title} Announcement",
                content="Welcome to the course!",
                course=course,
                created_by=course.teacher
            )

        # -------- Resources --------
        for course in courses:
            Resource.objects.get_or_create(
                title=f"{course.title} Resource",
                description="Course material",
                course=course,
                uploaded_by=course.teacher
            )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully"))
