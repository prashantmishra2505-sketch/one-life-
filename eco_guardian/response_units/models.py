from django.db import models

class ResponseUnit(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    jurisdiction = models.CharField(max_length=255)
    availability = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({'Available' if self.availability else 'Busy'})"
