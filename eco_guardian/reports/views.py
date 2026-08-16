from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import IncidentReport
from .serializers import IncidentReportSerializer, PublicIncidentReportSerializer
from .services.ai_vision import analyze_incident_image
from .services.risk_engine import calculate_and_trigger_sos

class PublicReportListView(generics.ListAPIView):
    """
    GET: List all incident reports for the public feed.
    Does not require authentication. Uses obfuscated coordinates.
    """
    queryset = IncidentReport.objects.all().order_by('-created_at')
    serializer_class = PublicIncidentReportSerializer
    permission_classes = []

class ReportListCreateView(generics.ListCreateAPIView):
    """
    GET: List all incident reports.
    POST: Create a new report with AI validation and Risk scoring.
    """
    serializer_class = IncidentReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins and Officers see all reports
        if user.role in ['admin', 'officer']:
            return IncidentReport.objects.all().order_by('-created_at')
        # Citizens only see their own reports
        return IncidentReport.objects.filter(reporter=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        print("AUTHORIZATION HEADER RECEIVED:", request.META.get('HTTP_AUTHORIZATION'))
        print("USER:", request.user)
        # 1. Intercept the request to validate the image with Gemini
        image_data = request.data.get('image') or request.FILES.get('image')
        
        # We only run AI if an image is provided
        ai_data = {"is_valid_threat": True, "confidence_score": 0.0, "removal_advice": "N/A"}
        if image_data:
            # If it's a base64 string from JSON, we need to decode it for AI or handle it differently
            # Actually, AI vision currently expects a file-like object or PIL Image.
            # I will fix this in ai_vision.py
            ai_data = analyze_incident_image(image_data)
            
            # If the AI determines it's completely invalid/irrelevant, we just let it pass with low risk
            # instead of blocking the citizen from submitting their report.
            pass
        
        # 2. Calculate the risk score and potentially trigger SOS
        risk_score = calculate_and_trigger_sos(
            report_data=request.data,
            ai_data=ai_data,
            user_role=request.user.role
        )
        
        # 3. Add the AI calculated fields to the data payload before saving
        # request.data is immutable in DRF, so we copy it
        mutable_data = request.data.copy()
        mutable_data['ai_confidence'] = ai_data.get('confidence_score', 0.0)
        mutable_data['risk_score'] = risk_score
        mutable_data['ai_removal_advice'] = ai_data.get('removal_advice', 'N/A')
        
        tags = ai_data.get('detected_tags', [])
        ai_species_str = ", ".join(tags[:3]) if tags else None
        mutable_data['ai_species'] = ai_species_str
        
        # Pass the modified data to the standard DRF serializer workflow
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        ai_confidence = serializer.initial_data.get('ai_confidence', 0.0)
        risk_score = serializer.initial_data.get('risk_score', 0)
        ai_species = serializer.initial_data.get('ai_species', None)
        
        # We must pass read-only fields explicitly to save()
        serializer.save(
            reporter=self.request.user,
            ai_confidence=ai_confidence,
            risk_score=risk_score,
            ai_species=ai_species
        )

class ReportDetailUpdateView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve a single report.
    PATCH/PUT: Update the report's status (used by officers).
    """
    queryset = IncidentReport.objects.all()
    serializer_class = IncidentReportSerializer
    permission_classes = [IsAuthenticated]

class OfficerDashboardView(generics.ListAPIView):
    """GET /api/dashboard/ : Returns dynamic dashboard data ordered by risk score."""
    serializer_class = IncidentReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Optional: Hide dashboard from citizens completely
        if user.role != 'officer':
            return IncidentReport.objects.none()
            
        # Order dynamically by risk_score (descending) so highest risk is at the top
        return IncidentReport.objects.all().order_by('-risk_score', '-created_at')

from rest_framework.views import APIView

class IncidentStatusUpdateView(APIView):
    """PATCH /api/incidents/<pk>/status/ : Allows officers to transition status."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'officer':
            return Response({"error": "Only officers can update status."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            incident = IncidentReport.objects.get(pk=pk)
        except IncidentReport.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        new_status = request.data.get('status')
        if new_status not in ['acknowledged', 'resolved']:
            return Response(
                {"error": "Invalid status update. Choose 'acknowledged' or 'resolved'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        incident.status = new_status
        incident.save()
        
        return Response({"message": f"Status updated to {new_status}"}, status=status.HTTP_200_OK)
