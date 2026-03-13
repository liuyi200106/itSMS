from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

User = get_user_model()


class UserAuthAPITest(APITestCase):
    def setUp(self):
        self.student_password = "strongpass123"
        self.student = User.objects.create_user(
            username="student01",
            email="student@example.com",
            password=self.student_password,
            role="student",
            student_id="S1001",
        )
        self.admin = User.objects.create_user(
            username="admin01",
            email="admin@example.com",
            password="adminpass123",
            role="admin",
        )

    def test_login_returns_token_and_user(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": self.student.username, "password": self.student_password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["username"], self.student.username)

    def test_public_register_forces_student_role(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newteacher",
                "email": "newteacher@example.com",
                "password": "strongpass123",
                "password_confirm": "strongpass123",
                "first_name": "New",
                "last_name": "User",
                "role": "teacher",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["role"], "student")

    def test_me_requires_authentication(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_create_user(self):
        token = Token.objects.create(user=self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.post(
            "/api/auth/",
            {
                "username": "teacher01",
                "email": "teacher@example.com",
                "password": "strongpass123",
                "password_confirm": "strongpass123",
                "first_name": "Teach",
                "last_name": "Er",
                "role": "teacher",
                "employee_id": "T1001",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["role"], "teacher")

    def test_non_admin_cannot_list_users(self):
        token = Token.objects.create(user=self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.get("/api/auth/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
