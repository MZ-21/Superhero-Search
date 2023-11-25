import React from 'react'
import './Nav.css'
import { GiFlyingDagger } from "react-icons/gi";

import { useState } from 'react'
const Nav = ({onLoginClick,onCreateAccountClick}) => {
  // const [activeNav,setActiveNav] = useState('#');
  return (
    <div className="nav-container">
        <nav className="nav">
            <div className="brand">
                <div className="rocket-image-container">
                  <GiFlyingDagger className="rocket-image"/>
                </div>
                <div className="title-website">
                  <h2>Superhero Search</h2>
                </div>
            </div>
            <div className="about-link-container">
              <a className="about-link" href='#about'  >About</a>
              {/* onClick={()=>setActiveNav('#about')} */}
              {/* className={activeNav ==='#about' ? 'active' :''} */}
            </div>
            <div className="home-link-container">
              <a className="home-link" href='#create' onClick={onCreateAccountClick} >Create Account</a>
              {/* onClick={()=>setActiveNav('#')} */}
              {/* className={activeNav ==='#' ? 'active' :''} */}
            </div>
            <div className="login-link-container">
              <a className="login-link" href="#login" onClick={onLoginClick} >Log-in</a>
              {/* onClick={()=>setActiveNav('#login')} */}
              {/* className={activeNav ==='#login' ? 'active' :''} */}
            </div>
        </nav>

    </div>
  )
}

export default Nav