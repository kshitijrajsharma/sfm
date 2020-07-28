from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db import connection

from .models import User,ROI,ROI_DIVIDED
from .serializers import *

def polydivider()
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS poly; CREATE TABLE poly AS SELECT * FROM users_roi ")
    cursor.execute("DROP TABLE IF EXISTS poly_pts; CREATE TABLE poly_pts AS SELECT (ST_Dump(ST_GeneratePoints(geom, 2000))).geom AS geom FROM users_roi ")
    cursor.execute("DROP TABLE IF EXISTS poly_pts_clustered;CREATE TABLE poly_pts_clustered AS SELECT geom, ST_ClusterKMeans(geom, 3) over () AS cluster FROM poly_pts;")
    cursor.execute("DROP TABLE IF EXISTS poly_centers; CREATE TABLE poly_centers AS SELECT cluster, ST_Centroid(ST_collect(geom)) AS geom FROM poly_pts_clustered GROUP BY cluster; ")
    cursor.execute("DROP TABLE IF EXISTS poly_voronoi; CREATE TABLE poly_voronoi AS SELECT (ST_Dump(ST_VoronoiPolygons(ST_collect(geom)))).geom AS geom FROM poly_centers; ")
    cursor.execute("DROP TABLE IF EXISTS poly_divided; CREATE TABLE poly_divided AS SELECT ST_Intersection(a.geom, b.geom) AS geom FROM users_roi a CROSS JOIN poly_voronoi b;")
    cursor.execute("Alter table  users_roi_divided alter column geom type geometry ( Polygon,4326)")
    cursor.execute("DELETE FROM users_roi_divided;")
    cursor.execute("INSERT INTO users_roi_divided(geom) SELECT (geom) FROM poly_divided;")

@api_view(['GET', 'POST'])
def polygondivide(request):
    if request.method == 'GET':
        

        
        polydivider()
      
       
        
        data = ROI_DIVIDED.objects.all()
        serializer = ROISerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)
  


    elif request.method == 'POST':
      
            
        return None


@api_view(['GET', 'POST'])
def Users_list(request):
    if request.method == 'GET':
        data = User.objects.all()

        serializer = UserSerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def Users_detail(request, pk):
    try:
        User = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = UserSerializer(User, data=request.data,context={'request': request})
        if serializer.is_valid():   
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        User.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)