import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <div className="text-center">
        <img
          src="https://scontent.fktm13-1.fna.fbcdn.net/v/t1.0-0/p640x640/34984406_1515579078552095_3518119690540941312_o.jpg?_nc_cat=102&_nc_sid=dd9801&_nc_ohc=tj-4ArLjgbgAX9Y815w&_nc_ht=scontent.fktm13-1.fna&_nc_tp=6&oh=e487e561fe8641dbd7cdf80d9cd2af58&oe=5F399B8F"
          width="300"
          className="img-thumbnail"
          style={{ marginTop: "20px" }}
        />
        <hr />
        <h5>
          <i>SK Brothers Present </i>
        </h5>
        <h1>Scientific Forest Management</h1>
        <h5>
          <i><b>User Management Panel</b> </i>
        </h5>
      </div>
    );
  }
}

export default Header;