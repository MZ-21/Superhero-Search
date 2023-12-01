import React, { useEffect } from 'react';
import {useState, useRef } from 'react';
import './cr.css'; 
//const bcrypt = require('bcrypt');//using bcrypt for secure passwords
const saltRounds = 6; //deter cost factor 


const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";

function CreateAccount (){
    const [email, setEmail] = useState(''); //update username
    const [username,setUsername] = useState('');
    const [password, setPassword] = useState(''); //update state password if need
    const isMounted = useRef(true);
    const [invalid, setInvalid] = useState('');
    const [msg, setMsg] = useState('');
  

    useEffect(() => {
        // Reset the incorrectEmail state when the email changes
        setInvalid('');
      }, [email]); 

    const authenticate = () => {
        checkEmail();

    }

    const checkEmail = () => {
                    var requestBody = {
                        "username": `${username}`,
                        "email":`${email}`,
                        "password":`${password}`,
                    }
                    fetch(`${routerPath2}/user/create`,{
                        method: 'POST', 
                        headers: {
                        'Content-Type': 'application/json', // Set the content type to JSON
                        },
                        body: JSON.stringify(requestBody), // Convert the object to a JSON string
                    })
                    .then(res => res.json()
                    .then(data2 => {
                        //handle verification
                        console.log(data2)
                        for(let dataV in data2){
                            console.log(dataV)
                            if(dataV == "message"){
                                setInvalid(data2[dataV])
                            }
                        }
                    

                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    )
                }
    
    return (
        <div id="cr">
            <div className="container">
                    <div className="login-header header">
                        <h1>Create Account:</h1>
                    </div>
                    <div className="input-container">
                        <div className="email-input">
                            <p className="input-identifier">Email:</p>
                            <input className="input" type='text'placeholder='email' onChange={(e) => setEmail(e.target.value)}></input>
                        </div>
                        <div className="username-input">
                            <p className="input-identifier">Username:</p>
                            <input className="input" type='text'placeholder='username' onChange={(e) => setUsername(e.target.value)}></input>
                        </div>
                        <div className="password-input">
                            <p className="input-identifier">Password:</p>
                            <input className="input" type='text' placeholder='password' onChange={(e) => setPassword(e.target.value)}></input>
                        </div>
                    
                        <button className='btn' onClick={authenticate}>Create</button>
                        {(invalid!=='') && (
                            <p id='invalid'>{invalid}</p>
                        )}
                    </div>
            </div>
        </div>
    );
};

export default CreateAccount;
