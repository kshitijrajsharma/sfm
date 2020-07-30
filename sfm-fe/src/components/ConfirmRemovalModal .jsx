import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, Button, ModalFooter } from 'reactstrap';
import axios from 'axios';
import { API_URL } from '../constants';

class ConfirmRemovalModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
    };
  }

  toggle = () => {
    this.setState((previous) => ({
      modal: !previous.modal,
    }));
  };

  deleteuser = (pk) => {
    const { resetState } = this.props;
    axios.delete(API_URL + pk).then(() => {
      resetState();
      this.toggle();
    });
  };

  render() {
    const { modal } = this.state;
    const { pk } = this.props;
    return (
      <>
        <Button color="danger" onClick={() => this.toggle()}>
          Remove
        </Button>
        <Modal isOpen={modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Do you really wanna delete the user?</ModalHeader>

          <ModalFooter>
            <Button type="button" onClick={() => this.toggle()}>
              Cancel
            </Button>
            <Button type="button" color="primary" onClick={() => this.deleteuser(pk)}>
              Yes
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
ConfirmRemovalModal.propTypes = {
  resetState: PropTypes.func.isRequired,
  pk: PropTypes.number.isRequired,
};
export default ConfirmRemovalModal;
