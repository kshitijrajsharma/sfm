from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db import connection

from .models import User,ROI
from .serializers import *

@api_view(['GET', 'POST'])
def polygondivide(request):
    if request.method == 'GET':
        

        cursor = connection.cursor()
      
       
        cursor.execute("DROP TABLE IF EXISTS peru; CREATE TABLE peru AS SELECT * FROM users_roi ")
        cursor.execute("DROP TABLE IF EXISTS peru_pts; CREATE TABLE peru_pts AS SELECT (ST_Dump(ST_GeneratePoints(geom, 2000))).geom AS geom FROM users_roi ")
        cursor.execute("DROP TABLE IF EXISTS peru_pts_clustered;CREATE TABLE peru_pts_clustered AS SELECT geom, ST_ClusterKMeans(geom, 10) over () AS cluster FROM peru_pts;")
        cursor.execute("DROP TABLE IF EXISTS peru_centers; CREATE TABLE peru_centers AS SELECT cluster, ST_Centroid(ST_collect(geom)) AS geom FROM peru_pts_clustered GROUP BY cluster; ")
        cursor.execute("DROP TABLE IF EXISTS peru_voronoi; CREATE TABLE peru_voronoi AS SELECT (ST_Dump(ST_VoronoiPolygons(ST_collect(geom)))).geom AS geom FROM peru_centers; ")
        cursor.execute("DROP TABLE IF EXISTS peru_divided; CREATE TABLE peru_divided AS SELECT ST_Intersection(a.geom, b.geom) AS geom FROM users_roi a CROSS JOIN peru_voronoi b;")

  

        # serializer = UserSerializer(data, context={'request': request}, many=True)

        return None

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