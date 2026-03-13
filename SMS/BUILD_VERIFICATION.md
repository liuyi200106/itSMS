# Build verification

## Backend
Verified with:
```bash
cd backend
python manage.py test
```
Result: 26 tests passed.

## Frontend
Verified with:
```bash
cd frontend
npm run build
```
Result: production build completed successfully.

Note: the frontend build emits a chunk-size warning because Ant Design makes the bundle large, but the build succeeds.
