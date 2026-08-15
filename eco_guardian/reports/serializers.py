from rest_framework import serializers
from .models import IncidentReport
from audit.models import AuditLog

class IncidentReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.name')

    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ['reporter', 'ai_confidence', 'risk_score']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            return data

        user = request.user
        
        # Location Masking Logic
        if instance.sensitivity_level == 'high':
            is_verified_officer = (user.role == 'officer' and user.verified)
            
            if not is_verified_officer:
                # Mask coordinates for citizens and unverified officers
                data['latitude'] = "Approx. 2km grid"
                data['longitude'] = "Approx. 2km grid"
            else:
                # Log the action since a verified officer viewed sensitive data
                AuditLog.objects.create(
                    user=user,
                    action="Viewed sensitive location data",
                    incident=instance
                )
                
        return data
