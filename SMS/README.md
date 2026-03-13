# Student Management System

A full-stack student management system built with Django REST Framework and React.

## Deployment-ready status
This version is prepared for direct deployment on Render with:
- Django backend
- React frontend
- PostgreSQL database
- Health check endpoint
- Production-safe static file handling
- Environment-based configuration

## Main features
- Token-based authentication
- Role-based access control for student, teacher, and admin users
- Course creation and enrollment
- Task publishing, submission, and grading
- Resource upload and download
- Course announcements
- Frontend and backend separated through API calls

## Tech stack
### Backend
- Django
- Django REST Framework
- django-cors-headers
- WhiteNoise
- Gunicorn
- SQLite for local development
- PostgreSQL for Render deployment
- Optional MySQL for self-managed deployment

### Frontend
- React
- TypeScript
- Vite
- Axios
- React Router
- Ant Design

## Project structure
```text
sms_fixed/
├── backend/
├── frontend/
├── render.yaml
├── DEPLOYMENT.md
├── SUBMISSION_CHECKLIST.md
└── CHANGES.md
```

## Local development
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Tests
```bash
cd backend
python manage.py test
```

## Render deployment
This repository includes `render.yaml` for one-click deployment of:
- `sms-backend`
- `sms-frontend`
- `sms-db`

Backend API base URL used by frontend:
- `https://sms-backend.onrender.com/api`

Health check endpoint:
- `/api/health/`

## Database behavior
- Local default: SQLite (`backend/db.sqlite3`)
- Render default: PostgreSQL via `DATABASE_URL`
- Optional self-managed MySQL: set `DB_ENGINE=mysql` and related variables

## Assignment-facing documents
See:
- `DEPLOYMENT.md`
- `SUBMISSION_CHECKLIST.md`
- `CHANGES.md`

## Important note
I prepared the code to be deployable, but actual publishing to your own Render or GitHub account still requires your account access.
