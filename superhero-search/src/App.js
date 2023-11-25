
import './App.css';
import Home from './components/Home/Home.jsx'
import Nav from './components/nav/Nav.jsx';
import About from './components/About/About.jsx';
import Login from './components/Login/Login.jsx';
import CreateAccount from './components/CreateAccount/CR.jsx';
import { useState } from 'react';

function App() {
  const [displayComponent, setDisplayedComponent] = useState(null);

  const displayLogin = () => {
    setDisplayedComponent('login');
  }

  const displayCreateAccount = () => {
    setDisplayedComponent('createAccount');
  }
  return (
    <div className="App">
      <Nav onLoginClick={displayLogin} onCreateAccountClick = {displayCreateAccount}/>
      <Home/>
      <About/>
      {displayComponent=== 'login' && <Login/>}
      {displayComponent === 'createAccount' && <CreateAccount/>}
    </div>
  );
}

export default App;
