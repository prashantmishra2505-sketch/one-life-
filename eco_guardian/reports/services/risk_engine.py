def calculate_and_trigger_sos(report_data, ai_data, user_role) -> int:
    """
    Calculates a risk score from 1-10 based on AI confidence and user role.
    Triggers an SOS alert if the score is >= 8.
    """
    confidence_score = ai_data.get('confidence_score', 0.0)
    
    # Base score on AI confidence (0.0 - 1.0 -> 0 - 10)
    base_score = int(confidence_score * 10)
    
    # Trusted officer modifier
    modifier = 2 if user_role == 'officer' else 0
    
    final_score = min(base_score + modifier, 10)
    
    # SOS Trigger Logic
    if final_score >= 8:
        trigger_sos_alert(
            title=report_data.get('title', 'Unknown Threat'),
            lat=report_data.get('latitude'),
            lon=report_data.get('longitude'),
            score=final_score
        )
        
    return final_score

def trigger_sos_alert(title, lat, lon, score):
    """
    Mock function representing an SOS trigger (e.g., Twilio SMS or Email).
    """
    print("=" * 50)
    print(f"!!! CRITICAL SOS ALERT TRIGGERED !!!")
    print(f"Threat: {title}")
    print(f"Location: Lat {lat}, Lon {lon}")
    print(f"Risk Score: {score}/10")
    print("Notifying local authorities immediately...")
    print("=" * 50)
