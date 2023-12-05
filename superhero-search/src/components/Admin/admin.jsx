import React, { useState, useEffect, useRef } from 'react';
import './admin.css';


const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";
// const view = require('./SHRender')

const MyAdminRights = () => {
        const [reviewData,setReviewData] = useState(''); //use using usestate to set the data of the reviews
        const [isAdmin, setIsAdmin] = useState(); //
        const [msgForAdmin, setMsgForAdmin] = useState('');//msg that displays when admin created
        const [newAdminEmail,setEmaiForNewAdmin] = useState('');//setting email of user who will be disabled
        const [emailDisableUser,setEmailDisableUser] = useState('');
        const [msgForUser, setMsgForUser] = useState('');
        const [policyText, setPolicyText] = useState('');
        const [policyTitle,setPolicyTitle] = useState('');
        const [msgForPolicy, setMsgForPolicy] = useState('');
        

const setModifySecurityAndPrivacy =() => {
    modifySecurityAndPrivacy(policyTitle);
}
const modifySecurityAndPrivacy = async (policyOfTitle) => {
        try {

            const response = await fetch(`${routerPath2}/policies`);
    
            if (response.ok) {
                const data = await response.json();
                for(let dataObj of data){
                    if(dataObj.title === policyOfTitle){
                        setPolicyText(dataObj.content);
                    }
                }
            }
            else {
              console.log("There was a problem finding policy data")//eror statements for admin method
            }
          } catch (error) {
            console.error('Error getting data', error);
          }


}

const setUpdateSecurityAndPrivacy =() => {
    updateSecurityAndPrivacy(policyTitle,policyText);
}
const updateSecurityAndPrivacy = async (policyOfTitle,policyTextInput) => {
    
    try{
        const emailOfAdmin = localStorage.getItem('email');//get email of user
        const gottenPT = policyOfTitle;
        const trimmedPolicyText = policyTextInput;

        var requestBody = {
            "title": `${gottenPT}`,//title of policy
            "content": `${trimmedPolicyText}`,//content of policy
            "createdBy":`${emailOfAdmin}`, //need email for who created policy
           
        }
        const response = await fetch(`${routerPath2}/admin/policy/create`, {//fetching router in backend to set policy
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication 
            },
            body: JSON.stringify(requestBody), 
        });
        if(response.ok){//if the response received is okay
            const data = await response.json();
            console.log(data)
            console.log(data.msg)
            setMsgForPolicy(data.msg)
        }
        else if(!response.ok){//if the response received isnt correct, there was a problem disabling the user
            console.log(response.status + " Problem creating a policy!");
        }
    }
    catch(err){
        console.log(err,"Error creating policy");
    }


}

const callDisableUser= () => {//function to call and pass in parameters for disable user method
    disableUser(emailDisableUser);

}
const disableUser = async (emailUser) => {//method to disable or enable a user
    try{
        const emailOfU = emailUser;

        var requestBody = {
            "email":`${emailOfU}`, //only need the email to change disable property in user
           
        }
        const response = await fetch(`${routerPath2}/disable/user`, {//fetching router in backend to set isDisabled status
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication 
            },
            body: JSON.stringify(requestBody), 
        });
        if(response.ok){//if the response received is okay
            const data = await response.json();
            if(data.disabled === true){//if the user is disabled, then set the msg to appropriate output
                console.log("disabled")
                setMsgForUser("User disabled. Email Admin for Help.")
            }
            else if(data.disabled === false){//if the user is enabled, then set the msg to appropriate output
                setMsgForUser("User un-disabled")

            }
        }
        else if(!response.ok){//if the response received isnt correct, there was a problem disabling the user
            console.log(response.status + " Problem disabling a user!");
        }
    }
    catch(err){
        console.log(err,"Error disabling user");
    }

}
const callSetAdmin= () => {//method called to call setAdmin 
    setAdmin(newAdminEmail);

}
const setAdmin = async (emailNewAdmin) => {//method to add a user as an admin
    try{
        const emailForNewA = emailNewAdmin.trim(); //email of the new admin

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
            setMsgForAdmin(data.msg)//setting msg to be displayed
            console.log(data,"admin response") //

        }
        else if(!response.ok){//if the response isnt expected, print the error
            console.log(response.status + " Problem adding an admin!");
        }
    }
    catch(err){
        console.log(err,"Error Adding Admin");
    }

}
const callHide = async (index) => {//method to hide/show review
        const reviewToUpdate = reviewData[index]; //getting the specific review that needs to be changed
    
        try{
            var requestBody = {
                "listN":`${reviewToUpdate.listN}`,//getting the correct information need to send to change the review
                "email":`${reviewToUpdate.email}`,
                "hidden":`${reviewToUpdate.hidden}`
            }
            const response = await fetch(`${routerPath}/lists/review/updateReview`, {//path to router in backend
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
                reviewToUpdate.hidden = !reviewToUpdate.hidden;//setting the review hidden back to og state if there is a mistake

            }
        }
        catch(err){
            console.log(err,"Error updating Review");
        }
        setReviewData((prevReviewData) => [...prevReviewData]);//

}
useEffect(() => {
    // Fetch admin status from the backend and update the state
    const checkAdminStatus = async () => {//only displaying admin functionalities if admin is logged in
      try {
        console.log("called admin status")
        const email = localStorage.getItem('email');//getting email of user to verify theyre admin
        const response = await fetch(`${routerPath2}/checkAdmin/${email}`, {//path to admin route
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the user's token for authentication
          },
        });

        if (response.ok) {
          const isAdminResponse = await response.json();
          setIsAdmin(isAdminResponse.isAdmin);//so if the isAdmin property is true, then this is an admin
        }
        else {
          console.log("There was a problem finding Admin")//eror statements for admin method
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();//calling checkadmin status everytime mounted

  },[]);

useEffect(()=>{//fetching data when mounted
    const displayReviews = async ()=> {//method for displaying reviews
        try{
            const jwtToken = localStorage.getItem('token')
            //const privateEmail = localStorage.getItem('email');
            const response = await fetch(`${routerPath}/heroes/lists/display/review`,{
                method: 'GET', 
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Content-Type": "application/json", // Set the content type to JSON
                },
            })
            
            if(response.ok){
                const data = await response.json();
                setReviewData(data);//getting review data and setting it
            }
            else{
                
                console.log(response.status + "Problem finding the lists!")
            }
        }
        catch(error) {
            console.log(error +" Network Error")
        }
    }     
    displayReviews();//calling display review method, depending on reviewData

},[reviewData]) //reviewData is dependency


    return (
        <div>
                
            {isAdmin ? (//if it is admin, display the correct information
                <div>
                    <div className='review-container'>
                        <h2 className='review headerOfContainers'>Monitor Reviews:</h2>
                        <div className='display-reviews'>
                            {reviewData && reviewData.map((review,index)=> (//looping through reviewData to separate info & display, also to change each indivudal hidden property
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
                                <p className="input-identifier-admin">Email:</p>
                                <input className="input" type='text' value={newAdminEmail} onChange={(e) => setEmaiForNewAdmin(e.target.value)} placeholder='email'></input>
                            </div>
                            <button className='btn-admin' onClick={callSetAdmin}>Choose Admin</button>
                            {msgForAdmin}
                        </div>
                        <h2 className='disable-user headerOfContainers'>Disable/Enable User:</h2>
                        <div>
                            <div className="email-input-admin">
                                <p className="input-identifier-disable">Email:</p>
                                <input className="input" type='text' value={emailDisableUser} onChange={(e) => setEmailDisableUser(e.target.value)} placeholder='email'></input>
                            </div>
                            <button onClick={callDisableUser} className='btn-admin'>Click to Change</button>
                            {msgForUser}
                        </div>

                    </div>
                    {/* #27 controlled inputs forms - Net Ninja - https://www.youtube.com/watch?v=IkMND33x0qQ  Just learned more about forms*/}
                    <div className='manage-policy-container'>
                        <h2 className='manage-policy headerOfContainers'>Manage Policies:</h2>
                        <div>
                            <form>
                                <label className="input-identifier-policy">Title Policy:</label>
                                <select
                                    className='title-select'  
                                    value={policyTitle} 
                                    onChange={(e) => setPolicyTitle(e.target.value)} >
                                    <option value="Security and Privacy Policy">Security and Privacy Policy</option>
                                    <option value="DMCA Notice & Takedown Policy">DMCA Notice & Takedown Policy</option>
                                    <option value="Acceptable Use Policy">Acceptable Use Policy</option>
                                </select>
                                <label className="input-identifier-policy">Policy Body:</label>
                                <textarea
                                    className="policy-input" 
                                    value={policyText} 
                                    onChange={(e) => setPolicyText(e.target.value)} 
                                    placeholder='text'
                                    type="text"
                                    required
                                >
                                </textarea>
                            
                            </form>
                            <p className='display-policy'><strong>{policyTitle}</strong></p>
                            <p className='display-policy'>{policyText}</p>
                            <button className='btn-policy' onClick={setUpdateSecurityAndPrivacy}>Click to Save Changes</button><button onClick={setModifySecurityAndPrivacy}>Click to Modify</button>{msgForPolicy}
                           
                        </div>
                        <div>
                        </div>

                    </div>
                </div>
            ):(
            <div></div>
            )
            }{isAdmin === false && (//if not admin, 
                    <h1 className='admin-header'>  NOT AUTHORIZED. ONLY ADMINS ALLOWED</h1>
                )
                
            }
        </div>
               
    );
    
};

export default MyAdminRights;

