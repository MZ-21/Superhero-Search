import React from 'react'
import './Nav.css'
import { useEffect } from 'react';
import { GiFlyingDagger } from "react-icons/gi";

import { useState } from 'react'
const routerPath2 = "/api/users";
const Nav = ({onLoginClick,onCreateAccountClick,onSearch,onCP,onLists,onPrivateLists,onAdmin}) => {
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch admin status from the backend and update the state
    const checkAdminStatus = async () => {
      try {
        console.log("called admin status")
        const email = localStorage.getItem('email');
        const response = await fetch(`${routerPath2}/checkAdmin/${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication
          },
        });

        if (response.ok) {
          const isAdminResponse = await response.json();
          console.log(isAdminResponse.isAdmin,"this is is admin")
          setIsAdmin(isAdminResponse.isAdmin);
        }
        else {
          setIsAdmin(false)
          console.log("There was a problem finding Admin")
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  },[]);

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
            </div>
            <div className="herosearch-link-container">
              <a className="herosearch-link" href="#search" onClick={onSearch} >Search</a>

            </div>
            <div className="list-link-container">
              <a className="list-link" href="#list" onClick={onLists} >Lists</a>

            </div>
        
            <div className="private-list-link-container">
                <a className="list-link" href="#privatelist" onClick={onPrivateLists} >My Lists</a>

            </div>
          
            <div className="home-link-container">
              <a className="home-link" href='#create' onClick={onCreateAccountClick} >Create Account</a>
            </div>
            <div className="cp-link-container">
              <a className="cp-link" href="#cp" onClick={onCP} >Change Password</a>
            </div>
            {isAdmin ===true && (
              <div className="admin-link-container">
                <a className="admin-link" href="#admin" onClick={onAdmin} >Admin</a>
              </div>
            )}
            <div className="login-link-container">
              <a className="login-link" href="#login" onClick={onLoginClick} >Log-in</a>
            </div>
           
        </nav>

    </div>
  )
}

export default Nav