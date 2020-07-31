import React, { Component, createRef } from 'react';
import Axios from 'axios';
import * as turf from '@turf/turf';
import Map from './Map';
import MenuModal from '../Models/MenuModal';
import Settings from '../Models/Settings';
import MainHeader from '../PageContents/MainHeader';
import { ROI_API, FIRE_LINE } from '../../constants';

class MainComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuShow: false,
      measureContainer: false,
      legendContainer: false,
      exportMap: false,
      paramsMeasure: '',
      geojsonData: null,
      geojsonCsvData: null,
      settingModal: false,
      allDatas: null,
      createClicked: false,
      generatePolygon: false,
      allPolygonsData: [],
      dataId: 0,
      firstList: false,
      clusterUrl: '',
      bufferGeojosn: {},
    };
    this.menuRef = createRef();
  }

  componentDidMount() {
    Axios.get(ROI_API).then((res) => {
      this.setState(() => ({
        allPolygonsData: res.data,
      }));
    });
  }

  handleMenuArrow = () => {
    this.setState((prevState) => ({
      menuShow: !prevState.menuShow,
    }));
    document.getElementById('button-left').style.display = 'none';
  };

  handleClickItems = (e) => {
    const { id } = e.target;
    switch (id) {
      case 'Measure':
        document.querySelector('.overlay-list').style.display = 'none';
        this.setState(() => ({
          measureContainer: true,
        }));
        break;
      case 'Legend':
        document.querySelector('.overlay-list').style.display = 'none';
        this.setState(() => ({
          legendContainer: true,
        }));
        break;
      case 'Export':
        this.setState((prevState) => ({
          exportMap: !prevState.exportMap,
        }));
        break;
      default:
    }
  };

  handleCloseFunction = (e) => {
    const { id } = e.target;
    switch (id) {
      case 'Measure':
        document.querySelector('.overlay-list').style.display = 'block';
        document.querySelector('#measureArea').checked = false;
        document.querySelector('#measureLength').checked = false;
        this.setState(() => ({
          paramsMeasure: 'reset',
          measureContainer: false,
        }));
        break;
      case 'Legend':
        document.querySelector('.overlay-list').style.display = 'block';
        this.setState(() => ({
          legendContainer: false,
        }));
        break;
      case 'Menu':
        document.getElementById('button-left').style.display = 'block';
        this.setState(() => ({
          menuShow: false,
        }));
        break;
      default:
    }
  };

  handleChangeFunction = (e) => {
    const { id } = e.target;
    this.setState(() => ({
      paramsMeasure: id,
    }));
  };

  handleResetFunction = () => {
    document.querySelector('#measureArea').checked = false;
    document.querySelector('#measureLength').checked = false;
    this.setState(() => ({
      paramsMeasure: 'reset',
    }));
  };

  getGeojsonData = (geojson) => {
    const { allPolygonsData } = this.state;
    const dataId = allPolygonsData.features.length + 1;
    Axios.post(
      ROI_API,
      {
        id: dataId,
        type: geojson.features[0].type,
        geometry: {
          type: geojson.features[0].geometry.type,
          coordinates: geojson.features[0].geometry.coordinates,
        },
        properties: {
          objectid: dataId,
          name: geojson.fileName,
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
      .then((res) => {
        this.setState(() => ({
          allPolygonsData: res.data,
          dataId,
        }));
      })
      .catch((err) => console.log(err));

    this.setState(() => ({
      geojsonData: geojson,
    }));
  };

  getGeojsonCsvData = (geojson) => {
    this.setState(() => ({
      geojsonCsvData: geojson,
    }));
  };

  handleSettings = () => {
    this.setState(() => ({
      settingModal: true,
    }));
  };

  handleSettingsData = (data) => {
    this.setState(() => ({
      allDatas: data,
    }));
  };

  generateCompartment = () => {
    const { allDatas, geojsonData, dataId } = this.state;
    const { numberValue, epsgSelected, areaValue } = allDatas;
    if (dataId !== 0) {
      if (allDatas && numberValue) {
        Axios.get(`${ROI_API}${dataId}/${numberValue}/${epsgSelected}`).then((res) => {
          this.setState(() => ({
            geojsonClusters: res.data,
            clusterUrl: `${ROI_API}${dataId}/${numberValue}/${epsgSelected}`,
          }));
        });
      } else if (allDatas && areaValue) {
        const polygon = turf.polygon(geojsonData.features[0].geometry.coordinates);
        const totalArea = turf.area(polygon) / (1000 * 1000);
        const number = totalArea / areaValue;
        let newNumber = 0;
        if (number.toFixed(0) - number >= 0.5) {
          newNumber = number.toFixed(0);
        } else {
          newNumber = number.toFixed(0) - 1;
        }
        Axios.get(`${ROI_API}${dataId}/${newNumber}/${epsgSelected}`).then((res) => {
          this.setState(() => ({
            geojsonClusters: res.data,
            clusterUrl: `${ROI_API}${dataId}/${numberValue}/${epsgSelected}`,
          }));
        });
      }
    } else {
      console.log('required datas are not available');
    }
  };

  createPolygon = () => {
    this.setState((prevState) => ({
      createClicked: !prevState.createClicked,
      generatePolygon: true,
    }));
  };

  generateClose = (geojson) => {
    const { allPolygonsData } = this.state;
    const dataId = allPolygonsData.features.length + 1;
    Axios.post(
      ROI_API,
      {
        id: dataId,
        type: geojson.type,
        geometry: {
          type: geojson.geometry.type,
          coordinates: geojson.geometry.coordinates,
        },
        properties: {
          objectid: dataId,
          name: 'userCreatedLayer',
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
      .then((res) => {
        this.setState(() => ({
          allPolygonsData: res.data,
          dataId,
        }));
      })
      .catch((err) => console.log(err));

    this.setState(() => ({
      geojsonData: geojson,
      generatePolygon: false,
      firstList: true,
    }));
  };

  callResetFunction = () => {
    this.setState(() => ({
      dataId: 0,
      geojsonData: null,
      geojsonCsvData: null,
      geojsonClusters: null,
      generatePolygon: false,
      allDatas: null,
    }));
  };

  generateFireLineBuffer = () => {
    console.log('generated');
    const { geojsonClusters, allDatas } = this.state;
    const { bufferWidth } = allDatas;
    let bufferValue = 0;
    if (bufferWidth === '4meter') {
      bufferValue = 2 / 100000;
    }
    if (bufferWidth === '6meter') {
      bufferValue = 3 / 100000;
    }

    Axios.get(
      FIRE_LINE,
      {
        params: {
          data: JSON.stringify(geojsonClusters),
          bufferlength: `${bufferValue}`,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    ).then((res) => {
      this.setState(() => ({
        bufferGeojosn: res.data,
      }));
    });
  };

  render() {
    const {
      menuShow,
      geojsonCsvData,
      geojsonData,
      measureContainer,
      legendContainer,
      paramsMeasure,
      settingModal,
      exportMap,
      allDatas,
      geojsonClusters,
      createClicked,
      generatePolygon,
      firstList,
      bufferGeojosn,
      clusterUrl,
    } = this.state;
    const OverlayItems = ['Legend', 'Measure', 'Export'];
    console.log(clusterUrl);

    return (
      <body className="main-body">
        <MainHeader handleSettings={this.handleSettings} />
        <div className="for-line" />
        <section className="main-wrapper">
          <div className="left-icons-overlay" id="button-left">
            <button type="button" onClick={this.handleMenuArrow}>
              <i className="material-icons">keyboard_arrow_right</i>
            </button>
          </div>
          <Map
            paramsMeasure={paramsMeasure}
            geojsonCsvData={geojsonCsvData}
            geojsonData={geojsonData}
            exportMap={exportMap}
            geojsonClusters={geojsonClusters}
            allDatas={allDatas}
            createClicked={createClicked}
            generatePolygon={generatePolygon}
            generateClose={this.generateClose}
            bufferGeojosn={bufferGeojosn}
          />
          <div className="overlay-container-div">
            <ul className="overlay-list">
              {OverlayItems.map((items) => {
                return (
                  <li role="presentation" key={items} id={items} onClick={(e) => this.handleClickItems(e)}>
                    {items}
                  </li>
                );
              })}
            </ul>
            {measureContainer && (
              <div className="custom-container">
                <h4>Measure</h4>
                <div className="custom-radios">
                  <label htmlFor="measureArea">
                    <input type="radio" id="measureArea" name="measure-radios" onChange={this.handleChangeFunction} />
                    Measure Area
                  </label>
                </div>
                <div className="custom-radios">
                  <label htmlFor="measureLength">
                    <input type="radio" id="measureLength" name="measure-radios" onChange={this.handleChangeFunction} />
                    Measure Length
                  </label>
                </div>
                <div className="clear-button">
                  <button type="button" onClick={this.handleResetFunction}>
                    Clear
                  </button>
                </div>
                <div className="close-button">
                  <button type="button" id="Measure" onClick={this.handleCloseFunction}>
                    Close
                  </button>
                </div>
              </div>
            )}
            {legendContainer && (
              <div className="custom-container">
                <h4>Legend</h4>
                <div className="legend-container">Layers on the map will be shown once available</div>
                <div className="close-button">
                  <button type="button" id="Legend" className="legend-button" onClick={this.handleCloseFunction}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="right-icons-overlay">
            <button type="button">
              <i className="material-icons">keyboard_arrow_left</i>
            </button>
          </div>
        </section>
        {menuShow && (
          <MenuModal
            getGeojsonData={this.getGeojsonData}
            menuRef={this.menuRef}
            handleCloseFunction={this.handleCloseFunction}
            getGeojsonCsvData={this.getGeojsonCsvData}
            handleSettings={this.handleSettings}
            generateCompartment={this.generateCompartment}
            createPolygon={this.createPolygon}
            callResetFunction={this.callResetFunction}
            firstListProps={firstList}
            allDatas={allDatas}
            generateFireLineBuffer={this.generateFireLineBuffer}
          />
        )}
        {settingModal && (
          <Settings
            handleSettingsData={this.handleSettingsData}
            show={settingModal}
            allDatas={allDatas}
            onHide={() => this.setState(() => ({ settingModal: false }))}
          />
        )}
      </body>
    );
  }
}
export default MainComponent;
