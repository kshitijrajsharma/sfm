from rest_framework import serializers
from .models import User,ROI_DIVIDED,ROI

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User 
        fields = ('pk', 'name', 'email', 'document', 'phone', 'registrationDate')
class ROIdividedSerializer(serializers.ModelSerializer):

    class Meta:
        model = ROI_DIVIDED 
        fields = '__all__'
class ROISerializer(serializers.ModelSerializer):

    class Meta:
        model = ROI 
        fields = '__all__'