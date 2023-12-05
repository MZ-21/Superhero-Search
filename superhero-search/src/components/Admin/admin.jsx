import React, { useState, useEffect, useRef } from 'react';
import './admin.css';


const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";
// const view = require('./SHRender')

const MyAdminRights = () => {
        const [reviewData,setReviewData] = useState('');
        const [hiddenReview, setReviewHidden] = useState([]);
        const [isAdmin, setIsAdmin] = useState();
        const [isReviewHidden, setIsReviewHidden] = useState("Hide");
        const [msgForAdmin, setMsgForAdmin] = useState('');
        const [newAdminEmail,setEmaiForNewAdmin] = useState('');
        const [emailDisableUser,setEmailDisableUser] = useState('');
        const [msgForUser, setMsgForUser] = useState('');

const callDisableUser= () => {
    disableUser(emailDisableUser);

}
const disableUser = async (emailUser) => {//method to add a user as an admin
    try{
        const emailOfU = emailUser;

        var requestBody = {
            "email":`${emailOfU}`,
           
        }
        const response = await fetch(`${routerPath2}/disable/user`, {//fetching router in backend to set isDisabled status
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication 
            },
            body: JSON.stringify(requestBody), 
        });
        if(response.ok){
            const data = await response.json();
            console.log(data.disabled)
            if(data.disabled === true){
                console.log("disabled")
                setMsgForUser("User disabled")
            }
            else if(data.disabled === false){
                setMsgForUser("User un-disabled")

            }
            console.log(data,"data disable")

        }
        else if(!response.ok){
            console.log(response.status + " Problem disabling a user!");
        }
    }
    catch(err){
        console.log(err,"Error disabling user");
    }

}
const callSetAdmin= () => {
    setAdmin(newAdminEmail);

}
const setAdmin = async (emailNewAdmin) => {//method to add a user as an admin
    try{
        const emailForNewA = emailNewAdmin.trim();

        var requestBody = {
            "email":`${emailForNewA}`,
           
        }
        const response = await fetch(`${routerPath2}/new/admin`, {//fetching router in backend to update isAdmin status
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication 
            },
            body: JSON.stringify(requestBody), 
        });
        if(response.ok){
            const data = await response.json();
            setMsgForAdmin(data.msg)
            console.log(data,"admin response")

        }
        else if(!response.ok){
            console.log(response.status + " Problem adding an admin!");
        }
    }
    catch(err){
        console.log(err,"Error Adding Admin");
    }

}
const callHide = async (index) => {
        const reviewToUpdate = reviewData[index];
    
        try{
            var requestBody = {
                "listN":`${reviewToUpdate.listN}`,
                "email":`${reviewToUpdate.email}`,
                "hidden":`${reviewToUpdate.hidden}`
            }
            const response = await fetch(`${routerPath}/lists/review/updateReview`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication
                },
                body: JSON.stringify(requestBody), 
            });
            if(response.ok){
                const data = await response.json();
                console.log(data)

            }
            else if(!response.ok){
                console.log(response.status + " Problem updating the review!");
                reviewToUpdate.hidden = !reviewToUpdate.hidden;

            }
        }
        catch(err){
            console.log(err,"Error updating Review");
        }
        setReviewData((prevReviewData) => [...prevReviewData]);

}
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
          //console.log(isAdminResponse)
          //console.log(isAdminResponse.isAdmin,"this is is admin")
          setIsAdmin(isAdminResponse.isAdmin);
        }
        else {
          console.log("There was a problem finding Admin")
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();

  },[]);

useEffect(()=>{//fetching data when mounted
    const displayReviews = async ()=> {//method for displaying reviews
        try{
            const jwtToken = localStorage.getItem('token')
            const privateEmail = localStorage.getItem('email');
            const response = await fetch(`${routerPath}/heroes/lists/display/review`,{
                method: 'GET', 
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Content-Type": "application/json", // Set the content type to JSON
                },
            })
            
            if(response.ok){
                const data = await response.json();
                //console.log(data)
                setReviewData(data)
                //console.log(reviewData)
            }
            else{
                
                console.log(response.status + "Problem finding the lists!")
                    
            }
        }
        catch(error) {
            console.log(error +" Network Error")
        }
    }     
    displayReviews();

},[reviewData])


    return (
        <div>
                
            {isAdmin ? (
                <div>
                    <div className='review-container'>
                        <h2 className='review headerOfContainers'>Monitor Reviews:</h2>
                        <div className='display-reviews'>
                            {reviewData && reviewData.map((review,index)=> (
                                <div className='review-box' key={index}>
                                    <p>{review.listN} - {review.comments}-{review.rating} - {review.username} </p>
                                    <button key = {index} onClick={()=> callHide(index,review)}>{review.hidden ? 'Hidden':'Hide'}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='make-admin-container'>
                        <h2 className='make-admin headerOfContainers'>Select Admin:</h2>
                        <div>
                            <div className="email-input-admin">
                                <p className="input-identifier">Email:</p>
                                <input className="input" type='text' value={newAdminEmail} onChange={(e) => setEmaiForNewAdmin(e.target.value)} placeholder='email'></input>
                            </div>
                            <button className='btn-admin' onClick={callSetAdmin}>Choose Admin</button>
                            {msgForAdmin}
                        </div>
                        <div>
                            <div className="email-input-admin">
                                <p className="input-identifier">Email:</p>
                                <input className="input" type='text' value={emailDisableUser} onChange={(e) => setEmailDisableUser(e.target.value)} placeholder='email'></input>
                            </div>
                            <button onClick={callDisableUser} className='btn-admin'>Click to Change</button>
                            {msgForUser}
                        </div>

                    </div>
                </div>
            ):(
            <div></div>
            )
            }{isAdmin === false && (
                    <h1 className='admin-header'>  NOT AUTHORIZED. ONLY ADMINS ALLOWED</h1>
                )
                
            }
        </div>
               
    );
    
};

export default MyAdminRights;