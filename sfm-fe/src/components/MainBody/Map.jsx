import React, { Component } from 'react';
import * as L from 'leaflet';
// import * as turf from '@turf/turf';
import 'proj4leaflet';
import 'leaflet-draw';
import 'leaflet-easyprint';
import PropTypes from 'prop-types';
import treeImages from '../../images/Tree-icon.png';

let previousLayer = null;
let previousGeojsonLayer = null;
let previousClustered = null;
let previousGeojsonCsvLayer = null;
let previousCreateLayer = null;

class Maps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      editableLayers: null,
    };
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    const osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap @',
    });
    const streets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Google Street @',
    });
    const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: 'Google Satellite @',
    });
    const hybrid = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
      attribution: 'Google Hybrid @',
    });

    const myMap = L.map(this.mapRef.current, {
      center: [28.170644, 84.19379],
      zoom: 7,
      minZoom: 6.5,
      maxZoom: 25,
      layers: [hybrid],
    });

    this.setState(() => ({
      map: myMap,
    }));

    const baseMaps = {
      OpenStreetMap: osm,
      'Google Street': streets,
      'Google Satellite': satellite,
      'Google Hybrid': hybrid,
    };
    L.control.layers(baseMaps).addTo(myMap);

    L.easyPrint({
      title: 'My awesome print button',
      position: 'topright',
      elementsToHide: 'p, h2',
    }).addTo(myMap);

    document.querySelector('.leaflet-control-easyPrint').style.display = 'none';

    setTimeout(() => {
      this.plotDrawLayers();
    }, 100);
  }

  componentDidUpdate(prevProps) {
    const {
      paramsMeasure,
      exportMap,
      geojsonData,
      createClicked,
      geojsonCsvData,
      geojsonClusters,
      bufferGeojosn,
    } = this.props;
    const { map, editableLayers } = this.state;

    if (prevProps.paramsMeasure !== paramsMeasure) {
      if (paramsMeasure === 'reset') {
        editableLayers.removeLayer(previousLayer);
      } else {
        this.drawMeasure(map, editableLayers, paramsMeasure);
      }
    }
    if (prevProps.exportMap !== exportMap) {
      document.querySelector('.CurrentSize').click();
    }
    if (prevProps.geojsonData !== geojsonData) {
      if (geojsonData) {
        const myLayer = L.geoJSON(geojsonData, {
          style: {
            color: '#e80000',
            fillColor: '#f7f2f3',
            weight: 5,
            opacity: 0.2,
          },
        }).addTo(map);
        previousGeojsonLayer = geojsonData;
        map.fitBounds(myLayer.getBounds());
      } else {
        map.removeLayer(previousGeojsonLayer);
      }
    }
    if (prevProps.geojsonCsvData !== geojsonCsvData) {
      if (geojsonCsvData) {
        const createIcons = function createCustomIcon(feature, latlng) {
          const myIcon = L.icon({
            iconUrl: treeImages,
            iconSize: [30, 30],
            iconAnchor: [12, 12],
            popupAnchor: [0, 0],
          });
          return L.marker(latlng, { icon: myIcon });
        };

        const myLayerOptions = {
          pointToLayer: createIcons,
          // onEachFeature: function onEachFeature(feature, layer) {
          //   layer.bindPopup(`<p>Name: ${feature.properties.Name}</p>`);
          // },
        };
        const pointLayers = L.geoJSON(geojsonCsvData, myLayerOptions).addTo(map);
        previousGeojsonCsvLayer = geojsonCsvData;
        map.fitBounds(pointLayers.getBounds());
      } else {
        map.removeLayer(previousGeojsonCsvLayer);
      }
    }
    if (prevProps.geojsonClusters !== geojsonClusters) {
      if (geojsonClusters) {
        const myLayer = L.geoJSON(geojsonClusters, {
          style: {
            color: '#ffffff',
            fillColor: '#05b08c',
            fillOpacity: 0.9,
            weight: 2,
            // opacity: 1,
          },
          onEachFeature: function onEachFeature(feature, layer) {
            layer.bindPopup(`<p>AREA : ${feature.properties.area} Square Meter</p>`);
            layer.on('mouseover', function mouseOverFunction() {
              this.setStyle({
                fillOpacity: 0,
              });
            });
            layer.on('mouseout', function mouseOutFunction() {
              this.setStyle({
                fillOpacity: 0.9,
                // fillColor: '#05b08c',
              });
            });
            layer.bindTooltip(String(feature.properties.pk), {
              permanent: true,
              direction: 'center',
            });
          },
        }).addTo(map);
        previousClustered = geojsonClusters;
        map.fitBounds(myLayer.getBounds());
        map.removeLayer(previousGeojsonLayer);
        if (previousCreateLayer) {
          map.removeLayer(previousCreateLayer);
        }
      } else {
        map.removeLayer(previousClustered);
      }
    }
    if (prevProps.createClicked !== createClicked) {
      if (previousCreateLayer) {
        editableLayers.removeLayer(previousCreateLayer);
        map.removeLayer(previousCreateLayer);
        if (previousGeojsonLayer) {
          map.removeLayer(previousGeojsonLayer);
        }
      }
      this.drawMeasure(map, editableLayers, 'measureArea');
    }
    if (prevProps.bufferGeojosn !== bufferGeojosn) {
      bufferGeojosn.features.map((buffered) => {
        const myStyle = {
          color: '#c02137',
          fillcolor: '#ff7800',
          weight: 2,
          opacity: 1,
        };
        L.geoJSON(buffered, {
          style: myStyle,
        }).addTo(map);
        return true;
      });
    }
  }

  drawMeasure = (map, editableLayers, paramsMeasure) => {
    const { generatePolygon, generateClose } = this.props;
    if (paramsMeasure === 'measureArea') {
      document.querySelector('.leaflet-draw-draw-polygon').click();
    } else if (paramsMeasure === 'measureLength') {
      document.querySelector('.leaflet-draw-draw-polyline').click();
    }
    map.on(L.Draw.Event.CREATED, function drawAdd(e) {
      const layers = e.layer;
      const type = e.layerType;
      editableLayers.addLayer(layers);
      console.log(generatePolygon, 'generatePolygon');
      if (generatePolygon) {
        const collection = layers.toGeoJSON();
        generateClose(collection);
        previousCreateLayer = layers;
      }
      if (!generatePolygon && type === 'polygon') {
        previousLayer = layers;
        const seeArea = L.GeometryUtil.geodesicArea(layers.getLatLngs()[0]);
        console.log(seeArea);
      }
      // eslint-disable-next-line no-constant-condition
      if ((!generatePolygon && type === 'line') || 'polyline') {
        previousLayer = layers;
        const seeArea = L.GeometryUtil.geodesicArea(layers.getLatLngs()[0]);
        console.log(seeArea);
      }
    });
    map.on('draw:drawstart', function drawStart() {
      editableLayers.removeLayer(previousLayer);
    });
  };

  plotDrawLayers = () => {
    const { map } = this.state;
    const editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    const options = {
      draw: {
        polyline: {
          shapeOptions: {
            color: '#f357a1',
            weight: 5,
          },
          showLength: true,
          metric: true,
        },
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#f357a1',
            message: "<strong>Oh snap!<strong> you can't draw that!",
          },
          shapeOptions: {
            color: '#e80000',
            fillColor: '#f7f2f3',
            weight: 5,
            opacity: 0.2,
          },
          showArea: true,
        },
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: editableLayers,
      },
    };

    const drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);

    document.querySelector('.leaflet-draw').style.display = 'none';
    this.setState(() => ({
      editableLayers,
    }));
  };

  render() {
    return (
      <>
        <div id="map" className="map-container" ref={this.mapRef} />
        <div className="draw-labels" />
        <div id="snapshot" />
      </>
    );
  }
}
Maps.propTypes = {
  paramsMeasure: PropTypes.string.isRequired,
  generateClose: PropTypes.func.isRequired,
  exportMap: PropTypes.bool.isRequired,
  generatePolygon: PropTypes.bool.isRequired,
  createClicked: PropTypes.bool.isRequired,
  geojsonData: PropTypes.oneOfType([PropTypes.object]).isRequired,
  geojsonCsvData: PropTypes.oneOfType([PropTypes.object]).isRequired,
  geojsonClusters: PropTypes.oneOfType([PropTypes.object]).isRequired,
  bufferGeojosn: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
export default Maps;
