from rest_framework import serializers
from .models import IncidentReport
from audit.models import AuditLog
import base64
import uuid
import random
from django.core.files.base import ContentFile

class Base64ImageField(serializers.ImageField):
    """
    A Django REST framework field for handling image-uploads through raw post data.
    It uses base64 for encoding and decoding the contents of the file.
    """
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            # format: data:image/jpeg;base64,<data>
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            id = uuid.uuid4()
            data = ContentFile(base64.b64decode(imgstr), name=f'{id}.{ext}')
        
        return super().to_internal_value(data)

class PublicIncidentReportSerializer(serializers.ModelSerializer):
    """
    Serializer for the public feed. Obfuscates the latitude and longitude
    by approximately 2km to protect sensitive wildlife locations, while keeping
    the offset deterministic per-incident.
    """
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = IncidentReport
        fields = [
            'id', 'category', 'description', 'latitude', 'longitude', 
            'status', 'ai_species', 'risk_score', 'created_at'
        ]
        # We deliberately exclude sensitive fields like image, reporter details (if any), etc.

    def get_latitude(self, obj):
        # Seed random with ID so the point doesn't jump around on every page refresh
        random.seed(f"lat_{obj.id}")
        offset = random.uniform(-0.018, 0.018) # ~2km
        return float(obj.latitude) + offset

    def get_longitude(self, obj):
        random.seed(f"lon_{obj.id}")
        offset = random.uniform(-0.018, 0.018) # ~2km
        return float(obj.longitude) + offset

class IncidentReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.name')
    image = Base64ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ['reporter', 'ai_confidence', 'risk_score', 'ai_species']

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
