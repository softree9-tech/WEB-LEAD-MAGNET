import os
from google import genai

def generate_response(prompt: str) -> str:
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"❌ Error in generate_response: {e}")
        return "Error: LLM generation failed"