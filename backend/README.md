# 🐍 AI Government Scheme Assistant - Backend

FastAPI + SQLite backend service powering scheme search, eligibility calculations, and AI chat.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: FastAPI + Uvicorn
- **Database**: SQLite3 (`backend/schemes.db`)
- **AI Integration**: Google Gemini API (`google.genai` / `google.generativeai`) with rule-based fallback
- **Data Validation**: Pydantic v2

---

## 🚀 How to Run

From the root project folder:
```cmd
start-backend.bat
```
Or directly:
```cmd
python backend/main.py
```

- API Base URL: **`http://127.0.0.1:8000`**
- Interactive Swagger UI: **`http://127.0.0.1:8000/docs`**

---

## 💾 Database Seeding

The SQLite database (`backend/schemes.db`) is automatically initialized and seeded from `backend/schemes.json` (134+ government schemes) on server startup via FastAPI lifespan events.

To manually re-seed the database:
```cmd
python backend/seed_data.py
```
