from django.db import models
from django.conf import settings

class IncidentReport(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
    )
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=255)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    image = models.ImageField(upload_to='incident_images/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    CATEGORY_CHOICES = (
        ('conflict', 'Human-Wildlife Conflict'),
        ('injured', 'Injured / Trapped Animal'),
        ('sighting', 'Wildlife Sighting'),
        ('illegal', 'Suspected Illegal Activity'),
        ('invasive', 'Invasive Species'),
        ('other', 'Other'),
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    
    # AI Intelligence Fields
    ai_confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    risk_score = models.IntegerField(default=0)
    ai_removal_advice = models.TextField(null=True, blank=True)
    ai_species = models.CharField(max_length=255, null=True, blank=True)
    
    SENSITIVITY_CHOICES = (
        ('low', 'Low'),
        ('high', 'High - Protected Species/Location'),
    )
    sensitivity_level = models.CharField(max_length=20, choices=SENSITIVITY_CHOICES, default='low')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
