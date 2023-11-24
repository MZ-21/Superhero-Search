import React, { useEffect } from 'react';
import './login.css';
import {useState, useRef } from 'react';
import UserInfo from '../UserInfo/UserInfo';
const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";

function Login (){
    const [email, setEmail] = useState(''); //update username
    const [username,setUsername] = useState('');
    const [password, setPassword] = useState(''); //update state password if need
    const isMounted = useRef(true);
    const [loggedIn, setLoggedIn] = useState(false) //currently not logged in
  
    useEffect(() => {
        isMounted.current = true;
    
        return () => {
          isMounted.current = false;
        };
      }, []); // Empty dependency array ensures the effect runs only once during mount

   

    const authenticate = () => {
        checkCredentials(email, password);

    }
    const checkCredentials = (enteredEmail, enteredPassword) => {
        fetch(`${routerPath2}/user/find/${enteredEmail}/${enteredPassword}`)
            .then(res => res.json()
            .then(data => {
                if(data.email == enteredEmail && isMounted.current){
                  setUsername(data.username)
                  setLoggedIn(true)
                }
                console.log("not ing if")
           
            })
            .catch((error) => {
                
            })
            )
            .catch((err)=>{
                console.log("h"+err)
            })
    }


    return (
        <login id="login">
            {loggedIn ? (
               <div>
                <h3 className="welcome-sign">Welcome: {username}</h3>
               </div>
            ):(
                <div className="login-container container">
                    <div className="login-header header">
                        <h1>Login:</h1>
                    </div>
                    <div className="login-input-container">
                        <div className="username-input">
                            <p className="input-identifier">Email:</p>
                            <input className="input" type='text' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email'></input>
                        </div>
                        <div className="password-input">
                            <p className="input-identifier">Password:</p>
                            <input className="input" type='text' value={password} onChange={(e)=> setPassword(e.target.value)} placeholder='password'></input>
                        </div>
                    </div>
                    <button onClick={authenticate}>Log in</button>
                </div>
            )}
        </login>
    );
};

export default Login;

