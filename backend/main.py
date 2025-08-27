from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from database import SessionLocal, engine, Base
from models import Survey
import openai, os, json, logging
import os
import json
from dotenv import load_dotenv
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware


# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Survey Generator")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class SurveyRequest(BaseModel):
    description: str

# API endpoint to generate survey
@app.post("/api/surveys/generate")
def generate_survey(request: SurveyRequest):

    # Input validation
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty.")
    
    if len(request.description.strip()) < 5:
        raise HTTPException(status_code=400, detail="Description too short.")
    
    if len(request.description.strip()) > 100:
        raise HTTPException(status_code=400, detail="Description too long.")

    db = SessionLocal()
    try:
        # Check if survey already exists
        existing = db.execute(
            text("SELECT * FROM surveys WHERE description = :desc LIMIT 1"),
            {"desc": request.description}
        ).fetchone()

        if existing:
            return {"survey": json.loads(existing.generated_json)}

        # Call OpenAI API
        try:
            response = openai.chat.completions.create(
                model="gpt-5-mini",
                messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert survey generator. "
                    "Always return clean, valid JSON that matches the exact schema provided. "
                    "Generate practical, well-structured surveys with appropriate question types."
                )
            },
            {
                "role": "user",
                "content": f"""
                Generate a survey from this description: {request.description}

                Return ONLY valid JSON in this exact format:
                {{
                  "title": "Survey Title Here",
                  "description": "Brief survey description under 100 characters",
                  "questions": [
                    {{
                      "type": "singleChoice",
                      "text": "Question text here?",
                      "options": ["Option 1", "Option 2", "Option 3"]
                    }},
                    {{
                      "type": "multipleChoice", 
                      "text": "Which of these apply to you?",
                      "options": ["Choice A", "Choice B", "Choice C"]
                    }},
                    {{
                      "type": "shortAnswer",
                      "text": "Please provide your thoughts:"
                    }},
                    {{
                      "type": "openQuestion",
                      "text": "Tell us more about your experience:"
                    }},
                    {{
                      "type": "scale",
                      "text": "Rate your satisfaction (1-10 stars):"
                    }},
                    {{
                      "type": "npsScore", 
                      "text": "How likely are you to recommend us?"
                    }}
                  ]
                }}

                IMPORTANT RULES:
                - Use ONLY these question types: "singleChoice", "multipleChoice", "shortAnswer", "openQuestion", "scale", "npsScore"
                - Always use "text" field for question content (not "title")
                - For choice questions, provide 3-5 realistic options as simple strings
                - For shortAnswer/openQuestion/scale/npsScore, do not include options
                - Generate 5-10 relevant questions
                - Make questions specific to the survey topic
                - Return only the JSON, no other text
                """
            }
        ],
                timeout=20  # seconds
            )

            # Validate response
            if not response.choices or not response.choices[0].message.content:
                raise ValueError("OpenAI API returned empty response")

            # Parse JSON
            survey_str = response.choices[0].message.content
            survey_json = json.loads(survey_str)

        # Handle OpenAI errors
        except Exception as e:
            print("OpenAI API error:", e)
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")

        # Save to DB
        db.execute(
            text("INSERT INTO surveys (description, generated_json) VALUES (:desc, :gen_json)"),
            {"desc": request.description, "gen_json": survey_str}
        )
        db.commit()

        return {"survey": survey_json}

    # Handle DB errors
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
