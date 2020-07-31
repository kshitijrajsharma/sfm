import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';

import axios from 'axios';

import { API_URL } from '../constants';

class NewUserForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pk: 0,
      name: '',
      email: '',
      document: '',
      phone: '',
    };
  }

  componentDidMount() {
    const { user } = this.props;
    if (user) {
      const { pk, name, document, email, phone } = user;
      this.setState({ pk, name, document, email, phone });
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  createuser = (e) => {
    const { resetState, toggle } = this.props;
    e.preventDefault();
    axios.post(API_URL, this.state).then(() => {
      resetState();
      toggle();
    });
  };

  edituser = (e) => {
    const { resetState, toggle } = this.props;
    const { pk } = this.state;
    e.preventDefault();
    axios.put(API_URL + pk, this.state).then(() => {
      resetState();
      toggle();
    });
  };

  defaultIfEmpty = (value) => {
    return value === '' ? '' : value;
  };

  render() {
    const { user } = this.props;
    const { name, email, document, phone } = this.state;
    return (
      <Form onSubmit={user ? this.edituser : this.createuser}>
        <FormGroup>
          <Label for="name">Name:</Label>
          <Input type="text" name="name" onChange={this.onChange} value={this.defaultIfEmpty(name)} />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email:</Label>
          <Input type="email" name="email" onChange={this.onChange} value={this.defaultIfEmpty(email)} />
        </FormGroup>
        <FormGroup>
          <Label for="document">Document:</Label>
          <Input type="text" name="document" onChange={this.onChange} value={this.defaultIfEmpty(document)} />
        </FormGroup>
        <FormGroup>
          <Label for="phone">Phone:</Label>
          <Input type="text" name="phone" onChange={this.onChange} value={this.defaultIfEmpty(phone)} />
        </FormGroup>
        <Button>Send</Button>
      </Form>
    );
  }
}
NewUserForm.propTypes = {
  user: PropTypes.oneOfType([PropTypes.object]).isRequired,
  resetState: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
};
export default NewUserForm;
