
import React from 'react';
import './App.css';
import Home from './components/Home/Home.jsx'
import Nav from './components/nav/Nav.jsx';
import About from './components/About/About.jsx';
import Login from './components/Login/Login.jsx';
import CreateAccount from './components/CreateAccount/CR.jsx';
import { useState } from 'react';
import SuperheroSearch from './components/SuperheroSearch/SH.jsx';

function App() {
  const [displayComponent, setDisplayedComponent] = useState(null);
  console.log("ahh")
  const displayLogin = () => {
    setDisplayedComponent('login');
  }

  const displayCreateAccount = () => {
    setDisplayedComponent('createAccount');
  }
  const displaySearch = () => {
    setDisplayedComponent('search');
  }

  return (
    <div className="App">
      <Nav onLoginClick={displayLogin} onCreateAccountClick = {displayCreateAccount} onSearch={displaySearch}/>
      <Home/>
      <About/>
      {displayComponent=== 'login' && <Login/>}
      {displayComponent === 'createAccount' && <CreateAccount/>}
      {displayComponent === 'search' && <SuperheroSearch/>}
    </div>
  );
}

export default App;
