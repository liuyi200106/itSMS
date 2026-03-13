# Deployment guide

## Recommended deployment target
Use the included `render.yaml` blueprint. It deploys:
- Django backend
- React static frontend
- PostgreSQL database

## One-time deployment steps
1. Upload this project to a new GitHub repository.
2. In Render, choose **New > Blueprint**.
3. Connect the GitHub repository.
4. Render will create `sms-backend`, `sms-frontend`, and `sms-db`.
5. Wait for the first deploy to finish.
6. Open the backend shell and run:
   ```bash
   python manage.py createsuperuser
   ```

## URLs after deployment
- Frontend: `https://sms-frontend.onrender.com`
- Backend API: `https://sms-backend.onrender.com/api`
- Health check: `https://sms-backend.onrender.com/api/health/`

## Local run
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
