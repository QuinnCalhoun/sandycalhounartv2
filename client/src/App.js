import React, { useState } from 'react'
import { NavigationBar, ContentBody, Footer } from './components/index'
import { Grid, Sidebar, Menu } from 'semantic-ui-react';
import { BrowserRouter as Router, Link } from 'react-router-dom'
import './app.css'

function App() {
  const [visible, setVisible] = useState(false)

  const sidebarrer = () => {
    setVisible(!visible)
  }

  return (
    <Router>
      <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          animation='overlay'
          icon='labeled'
          onHide={() => setVisible(false)}
          vertical
          visible={visible}
        >
          <Menu.Item content='X' onClick={() => setVisible(false)} />
          <Menu.Item as={Link} onClick={() => setVisible(false)} to='/about'>ABOUT</Menu.Item>
          <Menu.Item as={Link} onClick={() => setVisible(false)} to='/artworks'>ARTWORKS</Menu.Item>
          <Menu.Item as={Link} onClick={() => setVisible(false)} to='/upcoming'>UPCOMING</Menu.Item>
          <Menu.Item as={Link} onClick={() => setVisible(false)} to='/contact'>CONTACT</Menu.Item>
        </Sidebar>
        <Sidebar.Pusher>
          <Grid stackable className="App" style={{width: '99%', margin: 'auto'}}>
            <Grid.Column width='3'><NavigationBar dick={sidebarrer} state={{shown: visible}} /></Grid.Column>
            <Grid.Column width='1'></Grid.Column>
            <Grid.Column width='12' style={{ paddingTop: '11vh' }}><ContentBody /></Grid.Column>
          </Grid>
          <Footer />
        </Sidebar.Pusher>
      </Sidebar.Pushable>


    </Router>
  );
}

export default App;
