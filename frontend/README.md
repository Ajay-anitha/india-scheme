# ⚛️ AI Government Scheme Assistant - Frontend

React + Vite frontend web application for browsing Indian government schemes, calculating eligibility, using voice search, and chatting with an AI assistant.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Voice Integration**: Native Browser Web Speech API (`webkitSpeechRecognition`)

---

## 🚀 How to Run

From the root project folder:
```cmd
start-frontend.bat
```
Or directly within the `frontend/` folder:
```cmd
npm.cmd run dev
```

The web application runs at **`http://localhost:5173`**.

---

## 🔗 Data Flow & API Connection

The frontend connects to the FastAPI backend (`http://127.0.0.1:8000`) via `src/api.js`:
- `GET /schemes?q=...` → Live search and category scheme grid
- `GET /scheme/{id}` → Detailed scheme modal
- `POST /eligibility` → Profile eligibility matching
- `POST /chat` → Voice and text AI assistant chat
