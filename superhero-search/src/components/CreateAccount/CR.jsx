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
    const [invalid, setInvalid] = useState(false);
  

    useEffect(() => {
        // Reset the incorrectEmail state when the email changes
        setInvalid(false);
      }, [email]); 

    const authenticate = () => {
        checkEmailExist(email);

    }

    const checkEmailExist = (enteredEmail) => {
        console.log(enteredEmail)
        fetch(`${routerPath2}/user/find/${enteredEmail}`)
            .then(res => res.json()
            .then(data => {
                if(data===true){
                    setInvalid(true);
                }
                else{
                }
            })
            )
            .catch((err)=>{
                console.log("h"+err)
            })
    }
    return (
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
                            <input className="input" type='text'placeholder='username'></input>
                        </div>
                        <div className="password-input">
                            <p className="input-identifier">Password:</p>
                            <input className="input" type='text' placeholder='password'></input>
                        </div>
                    
                        <button className='btn' onClick={authenticate}>Create</button>
                        {invalid && (
                            <p id='invalid'>Incorrect Email</p>
                        )}
                    </div>
            </div>
    );
};

export default CreateAccount;
