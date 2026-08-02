import os
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

try:
    from backend.database import init_db, get_all_schemes, get_scheme_by_id, check_eligibility_in_db, get_scheme_suggestions, get_related_schemes
    from backend.models import EligibilityRequest, ChatRequest, ChatResponse
    from backend.seed_data import seed_database
except ImportError:
    from database import init_db, get_all_schemes, get_scheme_by_id, check_eligibility_in_db, get_scheme_suggestions, get_related_schemes
    from models import EligibilityRequest, ChatRequest, ChatResponse
    from seed_data import seed_database

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)
load_dotenv()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_database()
    yield

app = FastAPI(
    title="AI Government Scheme Assistant API",
    version="1.0.0",
    description="Backend API for Government Schemes search, eligibility verification, and AI chat assistant.",
    lifespan=lifespan
)

# Enable CORS for frontend integration
cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in cors_origins_raw.split(",")] if cors_origins_raw != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Government Scheme Assistant API is running."}

@app.get("/schemes")
def list_schemes(q: str = Query(None, description="Search term for scheme name, ministry, or benefits")):
    schemes = get_all_schemes(search_query=q)
    return {"status": "success", "count": len(schemes), "schemes": schemes}

@app.get("/schemes/suggest")
def suggest_schemes(q: str = Query("", description="Query prefix for autocomplete suggestions")):
    suggestions = get_scheme_suggestions(query=q, limit=6)
    return {"status": "success", "suggestions": suggestions}

@app.get("/scheme/{scheme_id}")
def get_scheme(scheme_id: int):
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")
    
    related = get_related_schemes(scheme_id, limit=4)
    faqs = [
        {
            "question": f"Who is eligible for {scheme['scheme_name']}?",
            "answer": scheme['eligibility']
        },
        {
            "question": f"What benefits are provided under {scheme['scheme_name']}?",
            "answer": scheme['benefits']
        },
        {
            "question": "What documents do I need to prepare?",
            "answer": scheme['required_documents']
        },
        {
            "question": "How can I submit my application?",
            "answer": f"You can apply online at the official portal: {scheme['apply_link']} or visit your nearest CSC Center."
        }
    ]
    return {
        "status": "success", 
        "scheme": scheme,
        "related_schemes": related,
        "faqs": faqs
    }

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

from starlette.requests import Request

def resolve_gemini_key(request: Request = None):
    # 1. Header resolution from request
    if request and hasattr(request, "headers"):
        header_key = request.headers.get("x-api-key") or request.headers.get("authorization")
        if header_key:
            if header_key.lower().startswith("bearer "):
                header_key = header_key[7:].strip()
            if header_key and not header_key.lower().startswith("your_"):
                return header_key.strip()

    # 2. Environment variables resolution
    for env_var in ["GEMINI_API_KEY", "VITE_GEMINI_API_KEY"]:
        val = os.getenv(env_var)
        if val and not val.lower().startswith("your_"):
            return val.strip()

    return None

@app.post("/chat", response_model=ChatResponse)
def ai_chat(payload: ChatRequest, request: Request = None):
    user_msg = payload.message.strip() if payload.message else ""
    if not user_msg:
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")
    
    gemini_key = resolve_gemini_key(request)
    openai_key = os.getenv("OPENAI_API_KEY")

    # Clean query and extract context scheme if present
    raw_query = user_msg
    focused_scheme_name = None
    focused_cat_name = None

    if "[Context Scheme:" in user_msg:
        try:
            focused_scheme_name = user_msg.split("[Context Scheme:")[1].split("]")[0].strip()
            raw_query = user_msg.split("]", 1)[-1].strip()
        except Exception:
            pass
    elif "[Context Category:" in user_msg:
        try:
            focused_cat_name = user_msg.split("[Context Category:")[1].split("]")[0].strip()
            raw_query = user_msg.split("]", 1)[-1].strip()
        except Exception:
            pass

    # Fetch context schemes from database
    if focused_scheme_name:
        context_schemes = get_all_schemes(focused_scheme_name)
    elif focused_cat_name:
        context_schemes = get_all_schemes(focused_cat_name)
    else:
        context_schemes = get_all_schemes(raw_query)

    # Build database grounding context string
    context_text = ""
    if context_schemes:
        scheme_bullets = []
        for s in context_schemes[:4]:
            scheme_bullets.append(
                f"- Scheme Name: {s['scheme_name']}\n"
                f"  Ministry: {s['ministry']}\n"
                f"  Category: {s.get('category', 'General')}\n"
                f"  State: {s.get('state', 'All India')}\n"
                f"  Benefits: {s['benefits']}\n"
                f"  Eligibility: {s['eligibility']}\n"
                f"  Required Documents: {s['required_documents']}\n"
                f"  Official Apply Link: {s['apply_link']}"
            )
        context_text = "\n\n".join(scheme_bullets)

    # 1. Gemini API Integration if valid key present
    if gemini_key:
        try:
            import importlib
            system_prompt = (
                "You are an expert AI Government Scheme Assistant for Indian Citizens.\n"
                "Answer the user's question clearly, concisely, and accurately based on official government scheme data.\n"
                "Format your answer using clean markdown with headings, bullet points, and official apply links.\n"
            )
            
            prompt = (
                f"{system_prompt}\n\n"
                f"Official Government Database Context:\n{context_text}\n\n"
                f"User Question: {raw_query}"
            ) if context_text else f"{system_prompt}\n\nUser Question: {raw_query}"

            try:
                genai = importlib.import_module("google.genai")
                client = genai.Client(api_key=gemini_key)
                
                for model_name in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]:
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt
                        )
                        if response and response.text:
                            return ChatResponse(reply=response.text, schemes_mentioned=context_schemes[:3])
                    except Exception:
                        continue
            except Exception:
                genai = importlib.import_module("google.generativeai")
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                if response and response.text:
                    return ChatResponse(reply=response.text, schemes_mentioned=context_schemes[:3])
        except Exception as e:
            print(f"Gemini API Exception: {e}")

    # 2. OpenAI API Integration if key present
    if openai_key and not openai_key.lower().startswith("your_"):
        try:
            import requests
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are an AI Government Scheme Assistant for India. Answer user queries accurately using official scheme data."},
                    {"role": "user", "content": f"Database Context:\n{context_text}\n\nUser Query: {raw_query}" if context_text else raw_query}
                ]
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body, timeout=10)
            if res.status_code == 200:
                data = res.json()
                reply = data["choices"][0]["message"]["content"]
                return ChatResponse(reply=reply, schemes_mentioned=context_schemes[:3])
        except Exception as e:
            print(f"OpenAI API Error: {e}")

    # 3. Intent-Aware Database Knowledge Fallback
    top_scheme = context_schemes[0] if context_schemes else None
    q_lower = raw_query.lower()

    if top_scheme:
        if any(w in q_lower for w in ["benefit", "benefits", "advantage", "get"]):
            reply = (
                f"💡 **Key Benefits of {top_scheme['scheme_name']}**:\n\n"
                f"{top_scheme['benefits']}\n\n"
                f"🏛️ **Ministry**: {top_scheme['ministry']}\n\n"
                f"🔗 **Official Apply Portal**: [Click here to apply]({top_scheme['apply_link']})"
            )
        elif any(w in q_lower for w in ["eligible", "eligibility", "criteria", "who can", "age"]):
            reply = (
                f"📋 **Eligibility Criteria for {top_scheme['scheme_name']}**:\n\n"
                f"{top_scheme['eligibility']}\n\n"
                f"📍 **Target Audience**: {top_scheme.get('occupation', 'All')} | {top_scheme.get('category', 'All')} | State: {top_scheme.get('state', 'All India')}\n\n"
                f"🔗 **Official Portal**: [Check & Apply]({top_scheme['apply_link']})"
            )
        elif any(w in q_lower for w in ["document", "documents", "paper", "proof", "need"]):
            reply = (
                f"📄 **Required Documents for {top_scheme['scheme_name']}**:\n\n"
                f"{top_scheme['required_documents']}\n\n"
                f"💡 **Next Steps**: Keep these documents ready before applying on the [Official Application Portal]({top_scheme['apply_link']})."
            )
        elif any(w in q_lower for w in ["apply", "how to apply", "process", "link", "register", "website"]):
            reply = (
                f"🔗 **How to Apply for {top_scheme['scheme_name']}**:\n\n"
                f"1. Visit the official government portal: [Click Here to Open Portal]({top_scheme['apply_link']})\n"
                f"2. Ensure you have the required documents: {top_scheme['required_documents']}\n"
                f"3. Verify your eligibility: {top_scheme['eligibility']}\n"
                f"4. Submit your online application or visit your nearest CSC Center."
            )
        else:
            reply = (
                f"📌 **{top_scheme['scheme_name']}**\n\n"
                f"🏛️ **Ministry**: {top_scheme['ministry']}\n\n"
                f"💡 **Benefits**: {top_scheme['benefits']}\n\n"
                f"📋 **Eligibility**: {top_scheme['eligibility']}\n\n"
                f"📄 **Required Documents**: {top_scheme['required_documents']}\n\n"
                f"🔗 **Apply Directly**: [Official Portal Link]({top_scheme['apply_link']})"
            )
    else:
        reply = (
            f"Thank you for asking about '{raw_query}'. You can explore schemes like "
            "PM-Kisan, Ayushman Bharat, PM MUDRA Yojana, Sukanya Samriddhi Yojana, and PM Awas Yojana on our homepage or check your eligibility in the Category Eligibility section."
        )

    return ChatResponse(reply=reply, schemes_mentioned=context_schemes[:3])

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST") or os.getenv("API_HOST") or "127.0.0.1"
    port = int(os.getenv("PORT") or os.getenv("API_PORT") or 8000)
    uvicorn.run("main:app", host=host, port=port, reload=True)
