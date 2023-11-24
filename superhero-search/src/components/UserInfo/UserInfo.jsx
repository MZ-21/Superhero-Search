import { useState, useEffect } from 'react';
const routerPath = "/api/superheroes";
const routerPath2 = "/api/users";

function UserInfo({userId}){
    const [userData, setUserData] = useState(null);//using state to update content based on user

    useEffect(()=>{
        //fetching user data when component is mounted
        const fetchData = async() => {
            try{
                const response = await fetch(`${routerPath}/heroes/lists`)
                const data = await response.json;
                setUserData(data)
            }
            catch(err) {
                console.error('Error fetching user data:',err);
            }
        }
        fetchData();
    }, [userId]);//only happens if userID changes
     
    if(!userData){
        return <><h1>WAIT...</h1></>
    }

}
export default UserInfo;