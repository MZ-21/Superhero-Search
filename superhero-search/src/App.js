
import React from 'react';
import './App.css';
import Home from './components/Home/Home.jsx'
import Nav from './components/nav/Nav.jsx';
import About from './components/About/About.jsx';
import Login from './components/Login/Login.jsx';
import CreateAccount from './components/CreateAccount/CR.jsx';
import SuperheroLists from './components/Lists/ListsDisplay.jsx'
import MySuperheroLists from './components/MyLists/MyLists.jsx';
import { useState } from 'react';
import SuperheroSearch from './components/SuperheroSearch/SH.jsx';
import ChangePass from './components/ChangePassword/CP.jsx';


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
  const displayChangePass = () => {
    setDisplayedComponent('CP')
  }
  const displayLists = () => {
    setDisplayedComponent('list')
  }
  const displayPrivateLists = () => {
    setDisplayedComponent('privatelist')
  }

  return (
    <div className="App">
      <Nav onLoginClick={displayLogin} onCreateAccountClick = {displayCreateAccount} onSearch={displaySearch} onCP={displayChangePass} onLists = {displayLists} onPrivateLists={displayPrivateLists}/>
      <Home/>
      <About/>
      {displayComponent=== 'login' && <Login/>}
      {displayComponent === 'createAccount' && <CreateAccount/>}
      {displayComponent === 'search' && <SuperheroSearch/>}
      {displayComponent === 'CP' && <ChangePass/>}
      {displayComponent === 'list' && <SuperheroLists/>}
      {displayComponent === 'privatelist' && <MySuperheroLists/>}
    </div>
  );
}

export default App;
