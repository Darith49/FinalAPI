# Saveur — Django + DRF + MySQL Backend

REST API backend for the Saveur Online Food Ordering & Delivery System.

## Tech Stack
- **Django 5** + **Django REST Framework**
- **MySQL** database
- **JWT authentication** (SimpleJWT)
- **CORS** enabled for React frontend

## Setup

### 1. Install MySQL & create database
```sql
CREATE DATABASE saveur_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create virtual environment & install
```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> If `mysqlclient` fails on Windows, install `pip install PyMySQL` and add to `saveur/__init__.py`:
> ```python
> import pymysql; pymysql.install_as_MySQLdb()
> ```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD and SECRET_KEY
```

### 4. Run migrations & create admin
```bash
python manage.py makemigrations api
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run the server
```bash
python manage.py runserver 8000
```

API base URL: `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login → returns JWT access + refresh |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET  | `/api/auth/me/` | Current user info |

### Resources (full CRUD)
- `/api/users/` (admin only)
- `/api/addresses/` (current user's address book)
- `/api/restaurants/` (lookup by slug)
- `/api/categories/`
- `/api/menu-items/?restaurant=<id>`
- `/api/orders/` — auto-filtered by role (customer / restaurant / delivery / admin)
- `/api/reviews/`

### Order actions
- `POST /api/orders/<id>/update_status/` body: `{"status": "preparing"}`
- `POST /api/orders/<id>/assign_driver/` body: `{"driver_id": 5}`

### Reports
- `GET /api/reports/summary/`

## Connecting React Frontend

In your React app, set the API base URL:
```ts
// src/lib/api.ts
const API_BASE = "http://localhost:8000/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  return res.json(); // { access, refresh }
}
```

Add the JWT token to subsequent requests:
```ts
headers: { Authorization: `Bearer ${accessToken}` }
```

## Project Structure
```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── saveur/           # project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── api/              # main app
    ├── models.py     # User, Address, Restaurant, MenuItem, Order, Review
    ├── serializers.py
    ├── views.py
    ├── urls.py
    └── admin.py
```

## Database Schema (MySQL tables auto-created)
- `api_user` — extended Django user (with role: customer/restaurant/delivery/admin)
- `api_address` — user address book
- `api_restaurant`, `api_category`, `api_menuitem`
- `api_order`, `api_orderitem`
- `api_review`
