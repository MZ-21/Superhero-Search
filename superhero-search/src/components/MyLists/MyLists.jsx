import React, { useState, useEffect, useRef } from 'react';
import './myl.css';
import FindListsClicked from '../Lists/ListsDisplayRender.jsx';
const routerPath = "/api/superheroes";
// const view = require('./SHRender')

const MySuperheroLists = () => {
        const [heroes,setHeroes] = useState([]);
        const [msg,setMsg] = useState([]);
        const isMounted = useRef(true);
        const [expanded,setExpanded] = useState([])
        const [listN,setListN] = useState('');
        const [privacy,setPrivacy] = useState(true);
        const [privacySetting,setPrivacySetting] = useState('Click to Set to Public')
        const [nameHero, setNameHero] = useState('');
        const [listName, setListName ] = useState('')
        const [lists,setLists] = useState(null);
        const [msgOfAdd, setMsgOfAdd] = useState('');
        const [listNForDelete,setlistNForDelete] = useState('');
        const [msgForDelete,setMsgForDelete] = useState('');

        const callDelete = () => {
            deleteAList(listNForDelete);
        }
        const deleteAList = async (enteredListName)=> {//method for displaying heroes
            try{
                
                const jwtToken = localStorage.getItem('token');
                const emailU = localStorage.getItem("email");
                console.log(emailU)
            
                var requestBody = {
                    "listN":`${enteredListName}`,
                }
                const response = await fetch(`${routerPath}/list/delete`,{
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody), 
                })
                
                if(response.ok){
                    const data = await response.json();
                    console.log(data)
                    setMsgForDelete("List was Deleted!")
                    
                }
                else{
                    
                    console.log(response.status + "Problem deleting the list! Make sure you're logged in")
                    setMsgForDelete("Problem deleting the lists! Make sure you're logged in")
                        
                }
            }
            catch(error) {
                console.log(error +" Network Error")
            }
        } 
        

    
    const callCreateAList = () => {
            createAList(listN,privacy);
    }
 

    
    const createAList = async (enteredListName,enteredPrivacy)=> {//method for displaying heroes
        try{
            
            const jwtToken = localStorage.getItem('token');
            const userN = localStorage.getItem("username");
            const emailU = localStorage.getItem("email");
            console.log(emailU)
        
            var requestBody = {
                "listN":`${enteredListName}`,
                "createdBy":`${userN}`,
                "createdByPrivate":`${emailU}`,
                "isPrivate":`${enteredPrivacy}`,
            }
            const response = await fetch(`${routerPath}/heroes/list/create`,{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody), 
            })
            
            if(response.ok){
                const data = await response.json();
                console.log(data)
                setMsg("List was created!")
                
            }
            else{
                
                console.log(response.status + "Problem creating the lists! Make sure you're logged in")
                setMsg("Problem creating the lists! Make sure you're logged in")
                    
            }
        }
        catch(error) {
            console.log(error +" Network Error")
        }
    }  

  const changePrivacy = () => {
        setPrivacy(!privacy);
        setPrivacySetting(privacy ? "Click to Set to Private" : "Click to Set to Public");
  }
  const callAddHeroes = () => {
        addHeroes(nameHero,listName)
  }

  const addHeroes = async (nameEnteredHero,enteredListName) => {
        try{
            const listNameInput = enteredListName.trim();
            const nameOfHero = nameEnteredHero.trim();
            console.log(nameOfHero)
            const jwtToken = localStorage.getItem('token')
            // "hero":`${nameHero}`,
        
            const response = await fetch(`${routerPath}/heroes/find/name/${nameOfHero}`);
            
            if(response.ok){
                const data = await response.json();
                console.log(data)
                setHeroes(data);//setting heroes to data to display later
                var requestBody = {
                    "listN": `${listNameInput}`,
                    "superhero": data,
                }
                const response2 = await fetch(`${routerPath}/hero/add`,
                    {
                        method: 'POST', 
                        headers: {
                            "Authorization": `Bearer ${jwtToken}`,
                            "Content-Type": "application/json", // Set the content type to JSON
                        },
                        body: JSON.stringify(requestBody),
                    })
                
                if(response2.ok){
                    const data2 = await response2.json();
                    console.log(data2);
                    setMsgOfAdd("Hero was Added to Your List!")

                }
                else{ 
                    setMsgOfAdd("Problem adding the hero! Make Sure You're Logged In! Or inputted the correct List Name!")
                    console.log(response2.status + "Problem adding the hero!")
                }
            }
            else{
                setMsgOfAdd("Problem finding the hero! Make Sure You Inputted a correct Hero!")
                console.log(response.status + "Problem finding the hero!")
                    
            }
        }
        catch(error) {
            console.log(error +" Network Error")
        }

  }

  useEffect(()=>{//fetching data when mounted
    const displayPrivateLists = async ()=> {//method for displaying heroes
        try{
            const jwtToken = localStorage.getItem('token')
            const privateEmail = localStorage.getItem('email');
            const response = await fetch(`${routerPath}/heroes/lists/${privateEmail}`,{
                method: 'GET', 
                headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Content-Type": "application/json", // Set the content type to JSON
                },
            })
            
            if(response.ok){
                const data = await response.json();
                console.log(data)
                setLists(data);
            }
            else{
                
                console.log(response.status + "Problem finding the lists!")
                    
            }
        }
        catch(error) {
            console.log(error +" Network Error")
        }
    }     
    displayPrivateLists();
   
},[])


const toggleExtraInfo = (list) => {
    setExpanded(prevList => {
    if(prevList.includes(list)){
        return prevList.filter(expanded => expanded !== list);
    }
    else{
        return [...prevList, list];
        }
    })
    
};

    return (
        <div id="list-div-id">
            <div className="private">
                <h1 className='header-lists'>Superhero Lists:</h1>
                <div className='create-list-input-container'>
                        <h2 className='header-list-add'>Create a List</h2>
                        <div className="listN-input">
                            <p className="input-identifier">List Name:</p>
                            <input className="input" type='text' value={listN} onChange={(e) => setListN(e.target.value)} placeholder='List Name'></input>
                        </div>
                        <div className="privacy-select">
                           <button className='privacy-button btn' value={privacy} onClick={changePrivacy}>{privacySetting}</button>
                        </div>
                        <button className='btn' onClick={callCreateAList}>Create a List</button>
                        <p className='msgForCreate'>{msg}</p>
                </div>
                <div className='delete-list-input-container'>
                        <h2 className='header-list-add'>Delete a List</h2>
                        <div className="listN-input">
                            <p className="input-identifier">List Name:</p>
                            <input className="input" type='text' value={listNForDelete} onChange={(e) => setlistNForDelete(e.target.value)} placeholder='List Name'></input>
                        </div>
                        <button className='btn' onClick={callDelete}>Delete a List</button>
                        <p className='msgForCreate'>{msgForDelete}</p>
                </div>
                <div className='Add-hero-input-container'>
                        <h2 className='header-list-add'>Add a Hero</h2>
                        <div className="listN-input">
                            <p className="input-identifier">List Name:</p>
                            <input className="input" type='text' value={listName} onChange={(e) => setListName(e.target.value)} placeholder='List Name'></input>
                        </div>
                        <div className="hero-input">
                            <p className="input-identifier">Hero Name:</p>
                            <input className="input" type='text' value={nameHero} onChange={(e) => setNameHero(e.target.value)} placeholder='Hero Name'></input>
                        </div>
                        <button className='btn' onClick={callAddHeroes}>Add a Hero</button>
                        <p className='msgForAdd'>{msgOfAdd}</p>
                </div>
                <div className='display-hero-input-container'>
                        <h2 className='header-list-display'>Display My Lists</h2>
                        <div className="private-lists-container">
                            {lists && lists.map((list, index)=>(
                                <div key={index} className='hero-div'>
                                    <button id={index} className='label-heroes' onClick={() => toggleExtraInfo(list)}><strong>{list.listN}</strong> - {list.createdBy} - {list.superhero.length} - {list.rating} - {list.lastModified}</button>
                                    {list.superhero.map((hero,index2)=>(
                                        <div key={index2}>
                                            {expanded.includes(list) && <FindListsClicked hero={hero}/>}
                                        </div>
                                    ))}
                                </div>
                            ))}  
                        </div>
                </div>
            </div>
        </div>
    );
};

export default MySuperheroLists;