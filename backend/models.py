from pydantic import BaseModel
from typing import Optional, List

class EligibilityRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[int] = None
    category: Optional[str] = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    schemes_mentioned: Optional[List[dict]] = []
