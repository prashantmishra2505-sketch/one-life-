import os
import json
from google import genai
from PIL import Image
from django.conf import settings

# Initialize the new Gemini Client with the API Key
api_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))
client = genai.Client(api_key=api_key)

def analyze_incident_image(uploaded_file) -> dict:
    """
    Sends the uploaded image to Gemini to determine if it is a valid wildlife/forest threat.
    Returns a dictionary: { 'is_valid_threat': bool, 'confidence_score': float, 'detected_tags': list }
    """
    if not uploaded_file:
        return {"is_valid_threat": False, "confidence_score": 0.0, "detected_tags": [], "removal_advice": "N/A"}

    try:
        # Convert Django's InMemoryUploadedFile/TemporaryUploadedFile to a Pillow Image
        img = Image.open(uploaded_file)
        
        prompt = (
            "Analyze this image for threats to a forest or wildlife, particularly looking for "
            "invasive species, human-wildlife conflict, poaching traps, or deforestation. "
            "Respond strictly in valid JSON format with four keys: "
            "'is_valid_threat' (boolean), "
            "'confidence_score' (float between 0.0 and 1.0), "
            "'detected_tags' (list of string tags describing the threat), and "
            "'removal_advice' (a string suggesting safe removal/containment steps if it is an invasive species, or 'N/A' if not applicable). "
            "Do not include any Markdown wrapping like ```json, just the raw JSON object."
        )
        
        # Generate content using gemini-1.5-flash
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[img, prompt]
        )
        
        # Parse the JSON response
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            
        data = json.loads(response_text)
        return data

    except Exception as e:
        print(f"AI Vision Error: {e}")
        # Fail gracefully if the API fails
        return {"is_valid_threat": False, "confidence_score": 0.0, "detected_tags": [], "removal_advice": "N/A"}
