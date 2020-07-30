from rest_framework import serializers
from .models import User,ROI_DIVIDED,ROI
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User 
        fields = ('pk', 'name', 'email', 'document', 'phone', 'registrationDate')
class ROIdividedSerializer(GeoFeatureModelSerializer):

    class Meta:
        model = ROI_DIVIDED 
        fields = '__all__'
        geo_field = "geom"
class ROISerializer(GeoFeatureModelSerializer):

    class Meta:
        model = ROI 
        geo_field = "geom"
        fields = '__all__'