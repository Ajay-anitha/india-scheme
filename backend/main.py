import os
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db, get_all_schemes, get_scheme_by_id, check_eligibility_in_db
from models import EligibilityRequest, ChatRequest, ChatResponse
from seed_data import seed_database

load_dotenv()

app = FastAPI(
    title="AI Government Scheme Assistant API",
    version="1.0.0",
    description="Backend API for Government Schemes search, eligibility verification, and AI chat assistant."
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    init_db()
    seed_database()

@app.get("/")
def read_root():
    return {"message": "AI Government Scheme Assistant API is running."}

@app.get("/schemes")
def list_schemes(q: str = Query(None, description="Search term for scheme name, ministry, or benefits")):
    schemes = get_all_schemes(search_query=q)
    return {"status": "success", "count": len(schemes), "schemes": schemes}

@app.get("/scheme/{scheme_id}")
def get_scheme(scheme_id: int):
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")
    return {"status": "success", "scheme": scheme}

@app.post("/eligibility")
def check_eligibility(payload: EligibilityRequest):
    matched_schemes = check_eligibility_in_db(
        age=payload.age,
        gender=payload.gender,
        state=payload.state,
        occupation=payload.occupation,
        annual_income=payload.annual_income,
        category=payload.category
    )
    return {
        "status": "success",
        "total_matched": len(matched_schemes),
        "schemes": matched_schemes
    }

@app.post("/chat", response_model=ChatResponse)
def ai_chat(payload: ChatRequest):
    user_msg = payload.message.strip() if payload.message else ""
    if not user_msg:
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # Fetch context schemes to enrich response if query relates to schemes
    context_schemes = get_all_schemes(search_query=user_msg if len(user_msg) > 3 else None)
    
    # 1. Gemini API Integration if key present
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            system_prompt = (
                "You are an expert AI Government Scheme Assistant for India. "
                "Provide accurate, clear, and helpful guidance on government schemes, eligibility, benefits, and required documents. "
                "Keep your answers structured, polite, and practical."
            )
            prompt = f"{system_prompt}\n\nUser Question: {user_msg}"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            reply = response.text
            return ChatResponse(reply=reply, schemes_mentioned=context_schemes[:3])
        except Exception as e:
            print(f"Gemini API Error: {e}")

    # 2. OpenAI API Integration if key present
    if openai_key:
        try:
            import requests
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are an AI Government Scheme Assistant. Help users find schemes, eligibility, and benefits."},
                    {"role": "user", "content": user_msg}
                ]
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body, timeout=10)
            if res.status_code == 200:
                data = res.json()
                reply = data["choices"][0]["message"]["content"]
                return ChatResponse(reply=reply, schemes_mentioned=context_schemes[:3])
        except Exception as e:
            print(f"OpenAI API Error: {e}")

    # 3. Rule-based / Knowledge fallback response if no API key set
    if context_schemes:
        top_scheme = context_schemes[0]
        reply = (
            f"Based on your query regarding '{user_msg}', here is relevant scheme information:\n\n"
            f"📌 **Scheme Name**: {top_scheme['scheme_name']}\n"
            f"🏛️ **Ministry**: {top_scheme['ministry']}\n"
            f"💡 **Benefits**: {top_scheme['benefits']}\n"
            f"📋 **Eligibility**: {top_scheme['eligibility']}\n"
            f"📄 **Required Documents**: {top_scheme['required_documents']}\n\n"
            f"🔗 You can apply directly at [Official Portal]({top_scheme['apply_link']})."
        )
    else:
        reply = (
            f"Thank you for asking about '{user_msg}'. Currently, you can explore schemes like "
            "PM-Kisan, Ayushman Bharat, PM MUDRA Yojana, and Sukanya Samriddhi Yojana on our homepage or check your eligibility in the Eligibility tab."
        )

    return ChatResponse(reply=reply, schemes_mentioned=context_schemes[:3])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
