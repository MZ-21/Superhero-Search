
import React, { useEffect } from 'react';
import './CP.css';
import {useState, useRef } from 'react';
const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";

function ChangePass (){
    const [email, setEmail] = useState(''); //update username
    const [newPassword, setNewPassword] = useState(''); //update state password if need
    const [oldPassword,setOldPassword] = useState("");
    const isMounted = useRef(true);
    const [msg, setMsg] = useState('')
    useEffect(() => {
        isMounted.current = true;
    
        return () => {
          isMounted.current = false;
        };
      }, []); // Empty dependency array ensures the effect runs only once during mount

   

    const authenticate = () => {
        change(email, oldPassword,newPassword);

    }
    const change = (enteredEmail, enteredOldPassword,enteredNewPassword) => {
        //const storedValue = localStorage.getItem(enteredEmail);
        // const jwtToken = localStorage.getItem('token')
        var requestBody = {
            "email":`${enteredEmail}`,
            "oldPassword":`${enteredOldPassword}`,
            "newPassword":`${enteredNewPassword}`,
        }
        fetch(`${routerPath2}/user/changePass`,{
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(requestBody), // Convert the object to a JSON string
        })
        .then(res => res.json()
        .then(data => {
            for(let dataValues in data){//loop through the data sent
                console.log(dataValues)
                if(dataValues=="message"){//set the msg to whatever it is
                    setMsg(data[dataValues])
                }
            }
        })
        .catch((error) => {
            console.log(error + " error from password data retrievel")    
        })
        )
        .catch((err)=>{
            console.log(err)//err msg 
        })
    }


    return (
        <div id="CP">
                <div className="changePassword-container container">
                    <div className="changePassword-header header">
                        <h1>Change Password:</h1>
                    </div>
                    <div className="changePassword-input-container input-container">
                        <div className="email-input">
                            <p className="input-identifier">Email:</p>
                            <input className="input" type='text' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email'></input>
                        </div>
                        <div className="old-password-input">
                            <p className="input-identifier">Old Password:</p>
                            <input className="input" type='text' value={oldPassword} onChange={(e)=> setOldPassword(e.target.value)} placeholder='old password'></input>
                        </div>
                        <div className="new-password-input">
                            <p className="input-identifier">New Password:</p>
                            <input className="input" type='text' value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} placeholder='New Password'></input>
                        </div>
                    </div>
                    <button className="btn" onClick={authenticate}>Change Password</button>
                    {msg !=="" && (
                        <div>
                            <h3 className='sign'>{msg}</h3>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default ChangePass;



// function ComponentA({ sharedState, setSharedState }) {
//   // Use sharedState and setSharedState as needed
//   return <div>{sharedState}</div>;
// }

// function ComponentB({ sharedState, setSharedState }) {
//   // Use sharedState and setSharedState as needed
//   return <input value={sharedState} onChange={(e) => setSharedState(e.target.value)} />;
// }