import React, { Component } from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-easyprint';
import PropTypes from 'prop-types';

let previousLayer = null;
let previousGeojsonLayer = null;
let previousGeojsonCsvLayer = null;
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

    const myMap = L.map(this.mapRef.current, {
      center: [28.170644, 84.19379],
      zoom: 7,
      minZoom: 6.5,
      layers: [osm],
    });

    L.marker([28.170644, 84.19379]).addTo(myMap);

    this.setState(() => ({
      map: myMap,
    }));

    const baseMaps = {
      OpenStreetMap: osm,
      'Google Street': streets,
      'Google Satellite': satellite,
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
    const { paramsMeasure, exportMap, geojsonData, geojsonCsvData } = this.props;
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
        L.geoJSON(geojsonData).addTo(map);
        previousGeojsonLayer = geojsonData;
      } else {
        map.removeLayer(previousGeojsonLayer);
      }
    }
    if (prevProps.geojsonCsvData !== geojsonCsvData) {
      if (geojsonCsvData) {
        L.geoJSON(geojsonCsvData).addTo(map);
        previousGeojsonCsvLayer = geojsonCsvData;
      } else {
        map.removeLayer(previousGeojsonCsvLayer);
      }
    }
  }

  drawMeasure = (map, editableLayers, paramsMeasure) => {
    if (paramsMeasure === 'measureArea') {
      document.querySelector('.leaflet-draw-draw-polygon').click();
    } else if (paramsMeasure === 'measureLength') {
      document.querySelector('.leaflet-draw-draw-polyline').click();
    }
    map.on(L.Draw.Event.CREATED, function drawAdd(e) {
      const layers = e.layer;
      const type = e.layerType;
      previousLayer = layers;
      editableLayers.addLayer(layers);
      if (type === 'polygon') {
        const seeArea = L.GeometryUtil.geodesicArea(layers.getLatLngs()[0]);
        console.log(seeArea);
      }
      // eslint-disable-next-line no-constant-condition
      if (type === 'line' || 'polyline') {
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
            color: '#f357a1',
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
  exportMap: PropTypes.bool.isRequired,
  geojsonData: PropTypes.oneOfType([PropTypes.object]).isRequired,
  geojsonCsvData: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
export default Maps;
