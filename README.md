# City Connect — Full project
- `backend/`  : Django REST (Eutropia ComplaintManagement) — code unchanged
- `frontend/` : React + Vite (Project_EU design), connected to the backend
[🌐 Visit the Live Website](https://eutropia-internship-project.vercel.app/)

## Run (Windows PowerShell)
Terminal 1 — backend:
```
cd backend\ComplaintManagement
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
pip install django==5.2.4 djangorestframework djangorestframework-simplejwt
python manage.py makemigrations logs notifications
python manage.py migrate
python manage.py runserver
```
`makemigrations logs notifications` MUST: backend-e ei duto app-er migration file nai, tai table banano jay na (ticket submit 500 dibe). Eta shudhu notun migration file toiri kore, kono code bodlay na.

Terminal 2 — frontend:
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Accounts
- Citizen: Register page theke.
- Admin / agent: Django shell theke (venv activate kore, backend\ComplaintManagement e):
  `python manage.py shell -c "from accounts.models import User; u=User.objects.create_user('admin1',password='Admin12345'); u.role='admin'; u.save(); print(u.id)"`
  agent-er jonno `u.role='agent'`. Admin ticket assign korte agent-er user ID type kore (ID upor-er print theke pabe).

## Backend limitations (unchanged)
- `/api/notifications/` ar `/api/logs/` views/serializers e bug ache (get_queryset class-er baire, NotificationSerializer-e Meta nai) — Notifications/Activity page error dekhabe jotokkhon na backend thik hoy.
- Public/anonymous endpoint, category/ward, "me" endpoint, CORS nai (frontend Vite proxy use kore).
