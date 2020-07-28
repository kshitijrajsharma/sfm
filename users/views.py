from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db import connection
from rest_framework import generics

from django.shortcuts import render

from .models import User,ROI,ROI_DIVIDED
from .serializers import *

def polydivider(srid,id,noofpoly):
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS poly; CREATE TABLE poly AS SELECT * FROM users_roi WHERE objectid = "+str(id)+" ")
    cursor.execute("DROP TABLE IF EXISTS poly_pts; CREATE TABLE poly_pts AS SELECT (ST_Dump(ST_GeneratePoints(geom, 2000))).geom AS geom FROM poly ")
    cursor.execute("DROP TABLE IF EXISTS poly_pts_clustered;CREATE TABLE poly_pts_clustered AS SELECT geom, ST_ClusterKMeans(geom, "+str(noofpoly)+") over () AS cluster FROM poly_pts;")
    cursor.execute("DROP TABLE IF EXISTS poly_centers; CREATE TABLE poly_centers AS SELECT cluster, ST_Centroid(ST_collect(geom)) AS geom FROM poly_pts_clustered GROUP BY cluster; ")
    cursor.execute("DROP TABLE IF EXISTS poly_voronoi; CREATE TABLE poly_voronoi AS SELECT (ST_Dump(ST_VoronoiPolygons(ST_collect(geom)))).geom AS geom FROM poly_centers; ")
    cursor.execute("DROP TABLE IF EXISTS poly_divided; CREATE TABLE poly_divided AS SELECT ST_Intersection(a.geom, b.geom) AS geom FROM poly  a CROSS JOIN poly_voronoi b;")
    cursor.execute("Alter table  users_roi_divided alter column geom type geometry ( Polygon,4326)")
    cursor.execute("DELETE FROM users_roi_divided;")
    cursor.execute("INSERT INTO users_roi_divided(geom,Area) SELECT geom,ST_Area(ST_Transform(geom,"+str(srid)+" )) FROM poly_divided;")
    cursor.execute("UPDATE users_roi_divided SET objectid="+str(id)+"")


   

@api_view(['GET'])
def polygondivide(request,objid,noofpoly,localsrid):
    try:
        objid=objid
        noofpoly=noofpoly
        localsrid=localsrid
        polydivider(localsrid,objid,noofpoly)
    except:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    
   
            
            

    

    if request.method == 'GET':
        
        data = ROI_DIVIDED.objects.all()
        serializer = ROIdividedSerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)
  


    # elif request.method == 'POST':
    #     serializer = ROIdividedSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(status=status.HTTP_201_CREATED)
            
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def polygon_list(request):
    if request.method == 'GET':
        data=ROI.objects.all()

        

        serializer = ROISerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ROISerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


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

# @api_view(['PUT', 'DELETE'])
# def polygon_detail(request, pk):
    

#     if request.method == 'PUT':
        
#         newuser = ROI.objects.filter(objectid=pk)
#         serializer = ROISerializer(newuser, data=request.data,context={'request': request})
#         if serializer.is_valid():   
#             serializer.save()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
        

#     elif request.method == 'DELETE':
       
#         newuser = ROI.objects.filter(objectid=pk)
#         newuser.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT', 'DELETE'])
def Users_detail(request, pk):
    

    if request.method == 'PUT':
        
        newuser = User.objects.get(pk=pk)
        serializer = UserSerializer(newuser, data=request.data,context={'request': request})
        if serializer.is_valid():   
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
        

    elif request.method == 'DELETE':
       
        newuser = User.objects.filter(pk=pk)
        newuser.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
      
        