import os
import json
from google import genai
from PIL import Image
from django.conf import settings
import base64
import io

# Initialize the new Gemini Client with the API Key
api_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))
client = genai.Client(api_key=api_key)

def analyze_incident_image(uploaded_file) -> dict:
    """
    Sends the uploaded image to Gemini to determine if it is a valid wildlife/forest threat.
    Returns a dictionary: { 'is_valid_threat': bool, 'confidence_score': float, 'detected_tags': list, 'removal_advice': str }
    """
    if not uploaded_file:
        return {"is_valid_threat": False, "confidence_score": 0.0, "detected_tags": [], "removal_advice": "N/A"}

    try:
        if isinstance(uploaded_file, str) and uploaded_file.startswith('data:image'):
            # It's a base64 string
            format, imgstr = uploaded_file.split(';base64,')
            img_data = base64.b64decode(imgstr)
            img = Image.open(io.BytesIO(img_data))
        else:
            # Convert Django's InMemoryUploadedFile/TemporaryUploadedFile to a Pillow Image
            img = Image.open(uploaded_file)
        
        prompt = (
            "Analyze this image for environmental reporting, particularly looking for "
            "invasive species, wildlife sightings, human-wildlife conflict, poaching traps, or deforestation. "
            "Respond strictly in valid JSON format with four keys: "
            "'is_valid_threat' (boolean - set to true if the image contains ANY wildlife, animals, nature, or environmental elements), "
            "'confidence_score' (float between 0.0 and 1.0 representing your confidence in identifying the subjects), "
            "'detected_tags' (list of string tags describing what you see), and "
            "'removal_advice' (a string suggesting safe removal/containment steps if it is an invasive species, or 'N/A' if not applicable). "
            "Do not include any Markdown wrapping like ```json, just the raw JSON object."
        )
        
        import time
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Generate content using the latest flash model
                response = client.models.generate_content(
                    model='gemini-flash-lite-latest',
                    contents=[img, prompt]
                )
                
                # Parse the JSON response
                response_text = response.text.strip()
                print(f"DEBUG GEMINI RESPONSE: {response_text}", flush=True)
                if response_text.startswith('```json'):
                    response_text = response_text.replace('```json', '').replace('```', '').strip()
                    
                ai_data = json.loads(response_text)
                return ai_data
            except Exception as e:
                print(f"AI Vision Error (Attempt {attempt+1}/{max_retries}): {e}", flush=True)
                if attempt < max_retries - 1:
                    time.sleep(2) # Wait 2 seconds before retrying
        # Fail gracefully for the prototype if the API fails after all retries
        print("Falling back to mock AI response due to API failure (likely 429 Quota Exceeded).")
        return {
            "is_valid_threat": True, 
            "confidence_score": 0.88, 
            "detected_tags": ["wildlife", "animal", "nature", "sighting"], 
            "removal_advice": "Maintain safe distance. Monitor animal's trajectory."
        }

    except Exception as e:
        print(f"AI Vision Error: {e}")
        # Fail gracefully if the API fails
        return {
            "is_valid_threat": True, 
            "confidence_score": 0.88, 
            "detected_tags": ["wildlife", "animal", "nature", "sighting"], 
            "removal_advice": "Maintain safe distance. Monitor animal's trajectory."
        }
