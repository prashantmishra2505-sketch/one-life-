from django.db import models
from reports.models import IncidentReport
from response_units.models import ResponseUnit

class SOSAlert(models.Model):
    STATUS_CHOICES = (
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    )
    incident = models.ForeignKey(IncidentReport, on_delete=models.CASCADE, related_name='sos_alerts')
    response_unit = models.ForeignKey(ResponseUnit, on_delete=models.CASCADE, related_name='sos_alerts')
    sent_at = models.DateTimeField(auto_now_add=True)
    delivery_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')

    def __str__(self):
        return f"SOS for Incident #{self.incident.id} to {self.response_unit.name}"
