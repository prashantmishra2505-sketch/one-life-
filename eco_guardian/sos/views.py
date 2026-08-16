from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from reports.models import IncidentReport
from response_units.models import ResponseUnit
from response_units.utils import find_nearest_unit
from .models import SOSAlert

class SOSDispatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, incident_id):
        # 1. Enforce verified officer restriction
        if request.user.role != 'officer' or not request.user.verified:
            return Response({"error": "Only verified officers can dispatch SOS alerts."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            incident = IncidentReport.objects.get(id=incident_id)
        except IncidentReport.DoesNotExist:
            return Response({"error": "Incident not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # 2. Find the nearest available response unit
        available_units = ResponseUnit.objects.filter(availability=True)
        nearest_unit = find_nearest_unit(incident.latitude, incident.longitude, available_units)
        
        if not nearest_unit:
            return Response({"error": "No available response units found."}, status=status.HTTP_400_BAD_REQUEST)
            
        # 3. Create SOS Alert record
        sos_alert = SOSAlert.objects.create(
            incident=incident,
            response_unit=nearest_unit,
            delivery_status='sent'
        )
        
        # 4. Mock Twilio SMS Dispatch
        print("\n" + "="*40)
        print("MOCK TWILIO SMS DISPATCH")
        print(f"To: {nearest_unit.name} ({nearest_unit.phone})")
        print(f"Message: URGENT! Incident '{incident.title}' reported at Lat: {incident.latitude}, Lon: {incident.longitude}. Risk Score: {incident.risk_score}")
        print("="*40 + "\n")
        
        return Response({"message": f"SOS dispatched to {nearest_unit.name} successfully."}, status=status.HTTP_201_CREATED)
