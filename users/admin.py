from django.contrib import admin
from django.contrib.gis import admin as geoadmin
from import_export.admin import ImportExportModelAdmin
from .models import User,ROI

class ROIadmin(geoadmin.OSMGeoAdmin,ImportExportModelAdmin):
    list_display=('objectid','name')

# Register your models here.
admin.site.register(ROI, ROIadmin)