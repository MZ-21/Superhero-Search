import React from 'react'
import './Nav.css'
import { GiFlyingDagger } from "react-icons/gi";

import { useState } from 'react'
const Nav = () => {
  const [activeNav,setActiveNav] = useState('#');
  return (
    <div class="nav-container">
        <nav class="nav">
            <div class="brand">
                <div class="rocket-image-container">
                  <GiFlyingDagger class="rocket-image"/>
                </div>
                <div class="title-website">
                  <h2>Superhero Search</h2>
                </div>
            </div>
            <div class="home-link-container">
              <a class="home-link" href='#home' onClick={()=>setActiveNav('#')} className={activeNav ==='#' ? 'active' :''} >Home</a>
            </div>
            <div class="about-link-container">
              <a class="about-link" href='#about' onClick={()=>setActiveNav('#about')} className={activeNav ==='#about' ? 'active' :''}>About</a>
            </div>
            <div class="login-link-container">
              <a class="login-link" href="#login" onClick={()=>setActiveNav('#login')} className={activeNav ==='#login' ? 'active' :''}>Log-in</a>
            </div>
        </nav>

    </div>
  )
}

export default Nav