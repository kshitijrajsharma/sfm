import React from 'react';
import treeImage from '@src/images/tree.png';
import PropTypes from 'prop-types';

function MainHeader(props) {
  const { handleSettings } = props;
  return (
    <section className="main-header">
      <div>
        <img src={treeImage} alt="tree" className="tree-icon" />
        <span>Scientific Forest Management</span>
      </div>
      <div className="tabs-wrapper">
        <ul className="tabs">
          <li>About</li>
          <li role="presentation" onClick={handleSettings}>
            Setting
          </li>
          <li>Print</li>
        </ul>
      </div>
    </section>
  );
}
MainHeader.propTypes = {
  handleSettings: PropTypes.func.isRequired,
};
export default MainHeader;
