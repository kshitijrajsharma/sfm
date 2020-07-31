import React from 'react';
import './scss/style.scss';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MainComponent from './components/MainBody/MainComponent';
import UsersPage from './components/UsersPage';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/users">
          <UsersPage />
        </Route>
        <Route exact path="/">
          <MainComponent />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
