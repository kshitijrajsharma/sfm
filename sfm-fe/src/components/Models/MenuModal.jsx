import React, { Component } from 'react';
import PropTypes from 'prop-types';
import csv2geojson from 'csv2geojson';
import shp from 'shpjs';

class MenuModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createUpload: false,
      elementHeight: 0,
    };
  }

  handleClick = () => {
    this.setState((prevState) => ({
      createUpload: !prevState.createUpload,
      elementHeight: document.querySelector('.menu').offsetHeight,
    }));
  };

  handleUploadData = (e) => {
    let extensionFile = e.target.files[0].name.split('.');
    extensionFile = extensionFile[extensionFile.length - 1];
    const file = e.target.files[0];
    const { getGeojsonData } = this.props;

    this.setState(() => ({
      createUpload: false,
    }));

    if (extensionFile === 'zip') {
      const reader = new FileReader();
      reader.onload = function loadReader() {
        function convertToLayer(buffer) {
          shp(buffer).then(function loadShapefile(geojson) {
            console.log(geojson, 'buffer');
            getGeojsonData(geojson);
          });
        }
        if (reader.readyState !== 2 || reader.error) {
          console.log(reader.error);
        } else {
          convertToLayer(reader.result);
        }
        return true;
      };
      reader.readAsArrayBuffer(file);
    }
  };

  handleCsvData = (e) => {
    this.setState((prevState) => ({
      createUpload: !prevState.createUpload,
    }));
    const { getGeojsonCsvData } = this.props;
    let extensionFile = e.target.files[0].name.split('.');
    extensionFile = extensionFile[extensionFile.length - 1];
    if (extensionFile === 'csv') {
      const reader = new FileReader();
      reader.readAsText(e.target.files[0]);
      reader.onloadend = function loadCsv() {
        csv2geojson.csv2geojson(reader.result, function loadGeojson(err, data) {
          if (data.features.length) {
            getGeojsonCsvData(data);
          }
        });
      };
    }
  };

  handleRequirement = () => {
    const { handleSettings } = this.props;
    this.setState(() => ({
      createUpload: false,
    }));
    handleSettings();
  };

  render() {
    const { menuRef, handleCloseFunction } = this.props;
    const { createUpload, elementHeight } = this.state;
    return (
      <div className="menu-container">
        <div className="menu" ref={menuRef}>
          <div className="menu-header">MENU</div>
          <div className="menu-body">
            <ul>
              <li role="presentation" onClick={this.handleClick}>
                1. Create / Upload Forest Area (Shapefile)
              </li>
              <span>
                <i className="material-icons">keyboard_backspace</i>
              </span>
              <li role="presentation" onClick={() => document.getElementById('CsvUpload').click()}>
                2. Upload Survey Data (CSV)
              </li>
              <input
                id="CsvUpload"
                accept=".csv"
                type="file"
                onChange={this.handleCsvData}
                style={{ display: 'none' }}
              />
              <span>
                <i className="material-icons">keyboard_backspace</i>
              </span>
              <li role="presentation" onClick={this.handleRequirement}>
                3. Fill your Requirements
              </li>
              <span>
                <i className="material-icons">keyboard_backspace</i>
              </span>
              <li>4. Generate Forest Management Plans</li>
            </ul>
          </div>
          <div className="menu-footer-left">
            <button type="button">RESET</button>
          </div>
          <div className="menu-footer-right">
            <button type="button" id="Menu" onClick={handleCloseFunction}>
              Close
            </button>
          </div>
        </div>
        {createUpload && (
          <ul className="modal-menu-child" style={{ top: `${document.body.clientHeight - elementHeight}px` }}>
            <div>Do you want to create or upload shapefile?</div>
            <li role="presentation">Create</li>
            <li role="presentation" onClick={() => document.getElementById('fileUpload').click}>
              <label htmlFor="fileUpload">
                <input
                  id="fileUpload"
                  accept=".zip"
                  type="file"
                  onChange={this.handleUploadData}
                  style={{ display: 'none' }}
                />
                Upload
              </label>
            </li>
          </ul>
        )}
      </div>
    );
  }
}
MenuModal.propTypes = {
  handleCloseFunction: PropTypes.func.isRequired,
  handleSettings: PropTypes.func.isRequired,
  getGeojsonData: PropTypes.func.isRequired,
  getGeojsonCsvData: PropTypes.func.isRequired,
  menuRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.object })]).isRequired,
};
export default MenuModal;
