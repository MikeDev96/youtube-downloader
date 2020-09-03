import React from 'react';
import './App.css';
import { Container } from 'semantic-ui-react';
import YTDownloader from './components/YTDownloader';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

function App() {
  return (
    <Container style={{ marginTop: "4em" }}>
      <Router>
        <Switch>
          <Route path="/">
            <YTDownloader />
          </Route>
        </Switch>
      </Router>
    </Container>
  );
}

export default App;