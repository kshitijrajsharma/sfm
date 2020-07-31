from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from django.db import connection
from rest_framework import generics
import geopandas as gp
  
from django.http import HttpResponse

from django.shortcuts import render
import geojson,gdal,subprocess
from .models import User,ROI,ROI_DIVIDED
from .serializers import *
import shapely
import itertools,requests
import json

import fiona
from shapely.geometry import shape, mapping,MultiPolygon

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

def polytoline(request):
    if request.method == 'GET':
        incomingapi = request.GET['data']
        print(incomingapi)
        bufferline= request.GET['bufferlength']
        incomingbuffer=float(bufferline)
        # print(incomingbuffer)
        # incomingurl=str(incomingapi)
        # print (incomingurl)
        

        # incomingurl='http://127.0.0.1:8000/api/ROI/4/4/4326'
        # print("this is inside the get request")
        
       
        # r = requests.get(incomingurl)
        apijson = json.loads(incomingapi)
        # print('i am from incoming api')
        print(apijson)
        
        with open('poly.geojson', 'w')as f:
            json.dump(apijson,f) 
        Multi = MultiPolygon([shape(poly['geometry']) for poly in fiona.open('poly.geojson')])
        schema = {'geometry': 'LineString','properties': {'fireline': 'int'}}
        with fiona.open('intersection.geojson','w','GeoJSON', schema) as e:
            for i in  itertools.combinations(Multi, 2):
                if i[0].touches(i[1]):
                    e.write({'geometry':mapping(i[0].intersection(i[1])), 'properties':{'fireline':1}})
       
        shp = r'intersection.geojson'

        # with open('intersection.geojson', 'r') as f:
         #    intersection_obj = json.load(f)
        # print("i am from intersection shp")
        # print(intersection_obj)
        # print(incomingbuffer)
        gdf = gp.GeoDataFrame.from_file(shp)
        gdf['geometry'] = gdf.geometry.buffer(incomingbuffer,0)
        gdf.to_file("output.geojson", driver="GeoJSON")
        with open('output.geojson', 'r') as f:
             my_json_obj = json.load(f)
        # print(my_json_obj)

        return JsonResponse(my_json_obj)
    else:
        return HttpResponse("unsuccesful")
   

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
      
        