import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Axios from 'axios';
import UserList from './UserList';
import NewUserModal from './NewUserModal';

import { API_URL } from '../constants';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    this.resetState();
  }

  getusers = () => {
    Axios.get(API_URL).then((res) => this.setState({ users: res.data }));
  };

  resetState = () => {
    this.getusers();
  };

  render() {
    const { users } = this.state;
    return (
      <Container style={{ marginTop: '20px' }}>
        <Row>
          <Col>
            <UserList users={users} resetState={this.resetState} />
          </Col>
        </Row>
        <Row>
          <Col>
            <NewUserModal create resetState={this.resetState} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Home;
