
import React, { useEffect } from 'react';
import './login.css';
import {useState, useRef } from 'react';
const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";

function Login (){
    console.log("hi")
    const [email, setEmail] = useState(''); //update username
    const [username,setUsername] = useState('');
    const [password, setPassword] = useState(''); //update state password if need
    const isMounted = useRef(true);
    const [loggedIn, setLoggedIn] = useState('') //currently not logged in
    const [msg, setMsg] = useState('')
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
        //const storedValue = localStorage.getItem(enteredEmail);
        // const jwtToken = localStorage.getItem('token')
        var requestBody = {
            "email":`${enteredEmail}`,
            "password":`${enteredPassword}`
        }
        fetch(`${routerPath2}/user/find`,{
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(requestBody), // Convert the object to a JSON string
        })
            .then(res => res.json()
            .then(data => {
                for(let dataValues in data){
                    if(dataValues == "data"){
                        setUsername(data[dataValues][0].username)
                        localStorage.setItem("username",data[dataValues][0].username);
                        localStorage.setItem("email",data[dataValues][0].email)
                        
                    }
                    if(dataValues=="accessToken"){
                        var dataJWT = data[dataValues];
                    }
                    if(data[dataValues] == "SUCCESS!"){
                        // Storing in local storage
                        console.log(dataJWT)
                        localStorage.setItem("token",dataJWT);
                        setLoggedIn('true')
                        
                    } 
                    if(data[dataValues] == "Failed!"){
                    //     console.log("FFFFFFFFFFFFFFFFFFFFFFFF")
                        setLoggedIn('false')
                    }
                    if(dataValues=="message"){
                        setMsg(data[dataValues])
                    }
                }
            })
            .catch((error) => {
                console.log(error + " error from login data retrievel")    
                })
            )
            .catch((err)=>{
                console.log(err)
            })
    }


    return (
        <div id="login">
            {loggedIn == "true" ? (
               <div>
                <h3 className="welcome-sign">Welcome: {username}</h3>
               </div>
            ):(
                <div className="login-container container">
                    <div className="login-header header">
                        <h1>Login:</h1>
                    </div>
                    <div className="login-input-container input-container">
                        <div className="email-input">
                            <p className="input-identifier">Email:</p>
                            <input className="input" type='text' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email'></input>
                        </div>
                        <div className="password-input">
                            <p className="input-identifier">Password:</p>
                            <input className="input" type='text' value={password} onChange={(e)=> setPassword(e.target.value)} placeholder='password'></input>
                        </div>
                    </div>
                    <button className="btn" onClick={authenticate}>Log in</button>
                    {loggedIn =="false" && (
                        <div>
                            <h3 className='welcome-sign'>{msg}</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Login;



// function ComponentA({ sharedState, setSharedState }) {
//   // Use sharedState and setSharedState as needed
//   return <div>{sharedState}</div>;
// }

// function ComponentB({ sharedState, setSharedState }) {
//   // Use sharedState and setSharedState as needed
//   return <input value={sharedState} onChange={(e) => setSharedState(e.target.value)} />;
// }