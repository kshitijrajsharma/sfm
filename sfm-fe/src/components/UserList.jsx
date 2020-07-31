import React, { Component } from 'react';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';
import NewuserModal from './NewUserModal';

import ConfirmRemovalModal from './ConfirmRemovalModal ';

class UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { users, resetState } = this.props;
    return (
      <Table dark>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Document</th>
            <th>Phone</th>
            <th>Registration</th>
          </tr>
        </thead>
        <tbody>
          {!users || users.length <= 0 ? (
            <tr>
              <td colSpan="6" align="center">
                <b>Ops, no one here yet</b>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.pk}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.document}</td>
                <td>{user.phone}</td>
                <td>{user.registrationDate}</td>
                <td align="center">
                  <NewuserModal create={false} user={user} resetState={resetState} />
                  &nbsp;&nbsp;
                  <ConfirmRemovalModal pk={user.pk} resetState={resetState} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    );
  }
}
UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  resetState: PropTypes.func.isRequired,
};
export default UserList;
