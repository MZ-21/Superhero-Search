
import './App.css';
import Home from './components/Home/Home.jsx'
import Nav from './components/nav/Nav.jsx';
import About from './components/About/About.jsx';
import Login from './components/Login/Login.jsx';
function App() {
  return (
    <div className="App">
      <Nav/>
      <Home/>
      <About/>
      <Login/>
    </div>
  );
}

export default App;
