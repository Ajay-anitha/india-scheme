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
    res = get_scheme_suggestions(query=q, limit=6)
    if isinstance(res, dict):
        return {
            "status": "success",
            "query": q,
            "corrected_query": res.get("corrected_query", ""),
            "suggestions": res.get("suggestions", [])
        }
    return {"status": "success", "suggestions": res}

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

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.chat")

from starlette.requests import Request

def is_valid_gemini_key(key: str) -> bool:
    if not key or len(key.strip()) < 15:
        return False
    k = key.strip().lower()
    if k.startswith("your_") or k.startswith("aq."):
        return False
    return True

def resolve_gemini_key(request: Request = None):
    # 1. Header resolution from request
    if request and hasattr(request, "headers"):
        header_key = request.headers.get("x-api-key") or request.headers.get("authorization")
        if header_key:
            if header_key.lower().startswith("bearer "):
                header_key = header_key[7:].strip()
            if is_valid_gemini_key(header_key):
                logger.info(f"Resolved Gemini API key from request header (prefix: {header_key[:8]}...)")
                return header_key.strip()

    # 2. Environment variables resolution
    for env_var in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "VITE_GEMINI_API_KEY"]:
        val = os.getenv(env_var)
        if is_valid_gemini_key(val):
            logger.info(f"Resolved Gemini API key from environment variable '{env_var}' (prefix: {val[:8]}...)")
            return val.strip()

    logger.info("No external Gemini API key resolved. Active local intent engine will serve chat responses.")
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
                "If the user greets you (e.g. 'Hello', 'Hi', 'Good Morning'), respond with a warm, conversational, friendly greeting and ask how you can assist them with Indian government schemes.\n"
                "Format your answers using clean markdown with headings, bullet points, and official apply links where applicable.\n"
            )
            
            prompt = (
                f"{system_prompt}\n\n"
                f"Official Government Database Context:\n{context_text}\n\n"
                f"User Question: {raw_query}"
            ) if context_text else f"{system_prompt}\n\nUser Question: {raw_query}"

            try:
                genai = importlib.import_module("google.genai")
                client = genai.Client(api_key=gemini_key)
                logger.info("Initializing google.genai Client...")
                
                # Candidate model hierarchy: prioritize active flash-latest models, then fallback variants
                gemini_models = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.0-flash-lite", "gemini-2.0-flash"]
                
                for model_name in gemini_models:
                    try:
                        logger.info(f"Calling Gemini API with model '{model_name}'...")
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt
                        )
                        if response and response.text:
                            logger.info(f"Gemini API SUCCESS with model '{model_name}'! Generated {len(response.text)} chars.")
                            return ChatResponse(reply=response.text, schemes_mentioned=context_schemes[:3])
                    except Exception as model_err:
                        err_str = str(model_err)
                        logger.error(f"[GEMINI API ERROR] Model '{model_name}' failed: {err_str}")
                        # Continue trying the remaining candidate models instead of breaking
                        continue
            except Exception as sdk_err:
                logger.error(f"[GEMINI SDK ERROR] google.genai Client exception: {sdk_err}")
                try:
                    genai = importlib.import_module("google.generativeai")
                    genai.configure(api_key=gemini_key)
                    for legacy_model in ["gemini-1.5-flash", "gemini-pro"]:
                        try:
                            model = genai.GenerativeModel(legacy_model)
                            logger.info(f"Calling legacy google.generativeai model '{legacy_model}'...")
                            response = model.generate_content(prompt)
                            if response and response.text:
                                logger.info(f"Legacy google.generativeai SUCCESS with '{legacy_model}'!")
                                return ChatResponse(reply=response.text, schemes_mentioned=context_schemes[:3])
                        except Exception as leg_mod_err:
                            logger.error(f"[LEGACY GEMINI ERROR] Model '{legacy_model}' failed: {leg_mod_err}")
                except Exception as legacy_err:
                    logger.error(f"[LEGACY GEMINI SDK ERROR]: {legacy_err}")

            # 3. Direct REST HTTP API Fallback for Gemini
            try:
                import requests
                for rest_model in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{rest_model}:generateContent?key={gemini_key}"
                    res = requests.post(
                        url,
                        json={"contents": [{"parts": [{"text": prompt}]}]},
                        headers={"Content-Type": "application/json"},
                        timeout=12
                    )
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                text_resp = parts[0]["text"]
                                logger.info(f"Gemini REST API SUCCESS with '{rest_model}'!")
                                return ChatResponse(reply=text_resp, schemes_mentioned=context_schemes[:3])
            except Exception as rest_err:
                logger.error(f"[GEMINI REST ERROR]: {rest_err}")
        except Exception as e:
            logger.error(f"[GEMINI TOP-LEVEL EXCEPTION]: {e}")

    logger.warning("[FALLBACK TRIGGERED] Gemini API unavailable or failed all candidate models. Falling back to local intent engine.")

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
            logger.error(f"OpenAI API Error: {e}")

    # 3. Intent-Aware Database Knowledge Fallback
    logger.info("Using Intent-Aware Scheme Knowledge Engine for chat reply.")
    q_lower = raw_query.lower().strip()

    # Check for Greetings (Hello, Hi, Good morning, etc.)
    q_clean = q_lower.strip(" !.,?😊🙏")
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste", "greetings", "hi there", "hello there"]
    if any(q_clean == g or q_clean.startswith(g + " ") or q_clean.startswith(g + ",") for g in greetings):
        reply = (
            "Namaste! 🙏 Welcome to the AI Government Scheme Assistant.\n\n"
            "How can I help you today? You can ask me any question about Indian Government schemes (such as PM-Kisan, Ayushman Bharat, PM MUDRA Yojana, Sukanya Samriddhi Yojana), check scheme eligibility criteria, or find out how to apply!"
        )
        return ChatResponse(reply=reply, schemes_mentioned=context_schemes[:3])

    top_scheme = context_schemes[0] if context_schemes else None

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

@app.post("/admin/import-schemes")
def import_official_schemes():
    """Administrative endpoint to trigger the automated official scheme import pipeline."""
    try:
        from importer import OfficialSchemeImporter
        importer = OfficialSchemeImporter()
        report = importer.run_import()
        return {"success": True, "report": report}
    except Exception as e:
        logger.error(f"Import endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    host = os.getenv("HOST") or os.getenv("API_HOST") or "127.0.0.1"
    port = int(os.getenv("PORT") or os.getenv("API_PORT") or 8000)
    uvicorn.run(app, host=host, port=port)
