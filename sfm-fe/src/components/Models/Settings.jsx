import React, { Component } from 'react';
import { Card, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CoordinateSystem from '../../JsonDatas/CoordinateSystemNepal.json';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      clickedArea: false,
      clickedNumber: false,
      areaValue: '',
      numberValue: '',
      bufferWidth: '',
      coordinateSelect: '',
      epsgSelected: '',
    };
  }

  componentDidMount() {
    const { allDatas } = this.props;
    const {
      areaValue,
      numberValue,
      bufferWidth,
      clickedArea,
      clickedNumber,
      coordinateSelect,
      epsgSelected,
    } = this.state;

    setTimeout(() => {
      const height = (document.body.clientHeight - document.querySelector('.modal-container').offsetHeight) / 2;
      const width = (document.body.clientWidth - document.querySelector('.modal-container').offsetWidth) / 2;
      this.setState(() => ({
        width,
        height,
        areaValue: allDatas ? allDatas.areaValue : areaValue,
        numberValue: allDatas ? allDatas.numberValue : numberValue,
        bufferWidth: allDatas ? allDatas.bufferWidth : bufferWidth,
        clickedArea: allDatas ? allDatas.clickedArea : clickedArea,
        clickedNumber: allDatas ? allDatas.clickedNumber : clickedNumber,
        coordinateSelect: allDatas ? allDatas.coordinateSelect : coordinateSelect,
        epsgSelected: allDatas ? allDatas.epsgSelected : epsgSelected,
      }));
    }, 100);
  }

  handleChangeFunction = (e) => {
    const { id, value } = e.target;
    if (id === 'provide-area') {
      this.setState(() => ({
        clickedArea: true,
        clickedNumber: false,
      }));
    } else if (id === 'provide-number') {
      this.setState(() => ({
        clickedArea: false,
        clickedNumber: true,
      }));
    } else if (id === '4m') {
      this.setState(() => ({
        bufferWidth: '4meter',
      }));
    } else if (id === '6m') {
      this.setState(() => ({
        bufferWidth: '6meter',
      }));
    } else if (id === 'coordinate-select') {
      if (value === 'Select Coordinate System of your data') {
        this.setState(() => ({
          coordinateSelect: '',
          epsgSelected: '',
        }));
      } else {
        const selectedData = CoordinateSystem.filter((system) => system.name === value);
        this.setState(() => ({
          coordinateSelect: value,
          epsgSelected: selectedData[0].EPSG,
        }));
      }
    }
  };

  handleClickedButton = (e) => {
    const { id } = e.target;
    const { onHide, handleSettingsData } = this.props;
    const {
      bufferWidth,
      epsgSelected,
      areaValue,
      numberValue,
      clickedArea,
      clickedNumber,
      coordinateSelect,
    } = this.state;

    if (id === 'reset') {
      this.setState(() => ({
        bufferWidth: '',
        areaValue: '',
        numberValue: '',
        clickedArea: false,
        clickedNumber: false,
        coordinateSelect: '',
        epsgSelected: '',
      }));
      const allDatas = {
        bufferWidth: '',
        areaValue: '',
        numberValue: '',
        clickedArea: false,
        clickedNumber: false,
        coordinateSelect: '',
        epsgSelected: '',
      };
      handleSettingsData(allDatas);
    } else if (id === 'submit') {
      const allDatas = {
        bufferWidth,
        areaValue,
        numberValue,
        clickedArea,
        clickedNumber,
        coordinateSelect,
        epsgSelected,
      };
      handleSettingsData(allDatas);
      onHide();
    } else if (id === 'close') {
      onHide();
    }
  };

  handleTextInput = (e) => {
    const { id, value } = e.target;
    if (id === 'forArea') {
      this.setState(() => ({
        areaValue: value,
        numberValue: '',
      }));
    } else if (id === 'forNumber') {
      this.setState(() => ({
        numberValue: value,
        areaValue: '',
      }));
    }
  };

  render() {
    const {
      width,
      height,
      clickedArea,
      clickedNumber,
      coordinateSelect,
      areaValue,
      numberValue,
      bufferWidth,
    } = this.state;
    return (
      <div className="modal-container" style={{ left: `${width}px`, top: `${height}px` }}>
        <Card bg="success" className="mb-2">
          <Card.Header>Please provide the following datas.</Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="form-group-inside">
                <h4>1. Please provide the coordinate system of your data.</h4>
                <Form.Control
                  className="form-input-field"
                  id="coordinate-select"
                  size="sm"
                  as="select"
                  onChange={this.handleChangeFunction}
                  value={coordinateSelect}
                >
                  <option>Select Coordinate System of your data</option>
                  {CoordinateSystem.map((coordinates) => {
                    return <option>{coordinates.name}</option>;
                  })}
                </Form.Control>
                <h4>2. Please provide the number / minimum area of compartment.</h4>
                <div className="custom-radios">
                  <label htmlFor="provide-area">
                    <input
                      type="radio"
                      checked={clickedArea}
                      id="provide-area"
                      name="type-radios"
                      onChange={this.handleChangeFunction}
                    />
                    Minimum area of compartment (in square km)
                  </label>
                </div>
                <div className="custom-radios">
                  <label htmlFor="provide-number">
                    <input
                      type="radio"
                      checked={clickedNumber}
                      id="provide-number"
                      name="type-radios"
                      onChange={this.handleChangeFunction}
                    />
                    Number of compartment
                  </label>
                </div>
                {clickedArea && (
                  <Form.Control
                    className="form-input-field"
                    size="sm"
                    type="text"
                    id="forArea"
                    placeholder="Provide minimum area of compartment (in square km)..."
                    onChange={this.handleTextInput}
                    value={areaValue && areaValue}
                  />
                )}
                {clickedNumber && (
                  <Form.Control
                    className="form-input-field"
                    size="sm"
                    type="text"
                    id="forNumber"
                    placeholder="Provide the number of compartment..."
                    onChange={this.handleTextInput}
                    value={numberValue && numberValue}
                  />
                )}
                <h4>3. Please provide the width for fire line.</h4>
                <div className="custom-radios">
                  <label htmlFor="4m">
                    <input
                      type="radio"
                      id="4m"
                      checked={bufferWidth === '4meter'}
                      name="buffer-radios"
                      onChange={this.handleChangeFunction}
                    />
                    4 meter
                  </label>
                </div>
                <div className="custom-radios">
                  <label htmlFor="6m">
                    <input
                      type="radio"
                      id="6m"
                      checked={bufferWidth === '6meter'}
                      name="buffer-radios"
                      onChange={this.handleChangeFunction}
                    />
                    6 meter
                  </label>
                </div>
              </Form.Group>
              <div className="button-container">
                <div className="apply-button">
                  <button type="button" id="submit" onClick={this.handleClickedButton}>
                    Submit
                  </button>
                </div>
                <div className="reset-button">
                  <button type="button" id="reset" onClick={this.handleClickedButton}>
                    Reset
                  </button>
                </div>
                <div className="close-button">
                  <button type="button" id="close" onClick={this.handleClickedButton}>
                    Close
                  </button>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }
}
Settings.propTypes = {
  onHide: PropTypes.func.isRequired,
  handleSettingsData: PropTypes.func.isRequired,
  allDatas: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
export default Settings;
