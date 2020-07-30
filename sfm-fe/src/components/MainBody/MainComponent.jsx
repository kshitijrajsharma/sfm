import React, { Component, createRef } from 'react';
import Map from './Map';
import MenuModal from '../Models/MenuModal';
import Settings from '../Models/Settings';
import MainHeader from '../PageContents/MainHeader';
import { regionDivided, postGeojsonData } from '../../constants';

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
    };
    this.menuRef = createRef();
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
    console.log(id);
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
    const bodyFormData = new FormData();
    bodyFormData.append('id', 2);
    bodyFormData.append('idobjectid', 2);
    bodyFormData.append('name', 'annapurna');
    bodyFormData.append(
      'geom',
      `SRID=4326', ${geojson.features[0].geometry.type}((${geojson.features[0].geometry.coordinates}))`,
    );

    postGeojsonData(bodyFormData).then((res) => console.log(res));

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
    const { numberValue, epsgSelected, areaValue } = data;
    this.setState(() => ({
      allDatas: data,
    }));
    if (data && numberValue) {
      regionDivided(numberValue, epsgSelected).then((response) => {
        console.log(response);
      });
    } else if (data && areaValue) {
      const totalArea = 100;
      const number = (totalArea / areaValue).toFixed(0);
      regionDivided(number, epsgSelected).then((response) => {
        console.log(response);
      });
    }
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
    } = this.state;
    const OverlayItems = ['Legend', 'Measure', 'Export'];

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
