from django.db import models
from django.contrib.gis.db import models as geomodels
import uuid


# Create your models here.
class User(models.Model):
    name = models.CharField("Name", max_length=240)
    email = models.EmailField()
    document = models.CharField("Document", max_length=20)
    phone = models.CharField(max_length=20)
    registrationDate = models.DateField("Registration Date", auto_now_add=True)

    def __str__(self):
        return self.name
class ROI(models.Model):
    objectid = models.BigIntegerField(blank=True,null=True)
    name = models.CharField(max_length=100,default='Null')
    geom = geomodels.GeometryField(srid=4326)
    class Meta:
        verbose_name_plural = "ROI"
class ROI_DIVIDED(models.Model):
    objectid = models.BigIntegerField(blank=True,null=True)
    name = models.CharField(max_length=100,default='Null',null=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geom = geomodels.GeometryField(srid=4326)
    area = models.FloatField(max_length=100,null=True)
    class Meta:
        verbose_name_plural = "ROI_DIVIDED"