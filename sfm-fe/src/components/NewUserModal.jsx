import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import NewUserForm from './NewUserForm';

class NewUserModal extends Component {
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

  render() {
    const { create, resetState, user } = this.props;
    const { modal } = this.state;

    let title = 'Editing user';
    let button = <Button onClick={this.toggle}>Edit</Button>;
    if (create) {
      title = 'Creating New user';

      button = (
        <Button color="primary" className="float-right" onClick={this.toggle} style={{ minWidth: '200px' }}>
          Create New
        </Button>
      );
    }

    return (
      <>
        {button}
        <Modal isOpen={modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{title}</ModalHeader>

          <ModalBody>
            <NewUserForm resetState={resetState} toggle={this.toggle} user={user} />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
NewUserModal.propTypes = {
  create: PropTypes.bool.isRequired,
  user: PropTypes.oneOfType([PropTypes.object]).isRequired,
  resetState: PropTypes.func.isRequired,
};
export default NewUserModal;
