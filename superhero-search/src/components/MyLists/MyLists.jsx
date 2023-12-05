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
        const [listNForDeleteHero,setlistNForDeleteHero] = useState('');
        const [listNForReview,setlistNForReview] = useState('');
        const [review,setReview] = useState('');
        const [ratingOfRev, setRatingOfRev] = useState(0);
        const [nameHForDelete,setNameHForDelete] = useState('');
        const [msgForDelete,setMsgForDelete] = useState('');
        const [msgForDeleteH,setMsgForDeleteH] = useState('');
        const [reviewData,setReviewData] = useState('');
        const [hiddenReview, setReviewHidden] = useState(false);

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
  const callDeleteHeroes = () => {
    deleteHeroes(nameHForDelete,listNForDeleteHero)
}

const deleteHeroes = async (nameEnteredHero,enteredListName) => {
    try{
        const listNameInput = enteredListName.trim();
        const nameOfHero = nameEnteredHero.trim();

        const jwtToken = localStorage.getItem('token')
        // "hero":`${nameHero}`,
            var requestBody = {
                "listN": `${listNameInput}`,
                "nameHero": nameOfHero,
            }
            const response = await fetch(`${routerPath}/delete/hero`,
                {
                    method: 'DELETE', 
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`,
                        "Content-Type": "application/json", // Set the content type to JSON
                    },
                    body: JSON.stringify(requestBody),
                })
                if(response.ok){
                    const data = await response.json();
                    setMsgForDeleteH("SUCCESS! Hero was deleted. Refresh.")
                    
                }
                else{
                    setMsgForDeleteH("Problems Deleting Hero. Make sure you're logged in or inputted the correct hero/list name")
                }
            
          
    }
    catch(error) {
        console.log(error +" Network Error")
    }

}
const callHide = () => {
    setReviewHidden(true);
}

const callAddReview = () => {
    addReview(review,listNForReview,ratingOfRev)
}

const addReview = async (review,enteredListName,ratingOfList) => {
    try{
        const listNameInput = enteredListName.trim();
        const reviewComment = review.trim();
        const rating = ratingOfList;

        const jwtToken = localStorage.getItem('token')
        const userN = localStorage.getItem("username");
        const emailU = localStorage.getItem("email");
        // "hero":`${nameHero}`,
            var requestBody = {
                "listN": `${listNameInput}`,
                "review": reviewComment,
                "rating": rating,
                "username":userN,
                "email":emailU,
                
            }
            const response = await fetch(`${routerPath}/list/review`,
                {
                    method: 'POST', 
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`,
                        "Content-Type": "application/json", // Set the content type to JSON
                    },
                    body: JSON.stringify(requestBody),
                })
                if(response.ok){
                    const data = await response.json();
                    console.log(data,"data")
                    // setReviewData(data);
                    setMsgForDeleteH("SUCCESS! List was reviewed. Refresh.")
                    
                }
                else{
                    console.log("error when adding review")
                    setMsgForDeleteH("Problems Reviewing List. Make sure you're logged in or inputted the correct list name")
                }
            
          
    }
    catch(error) {
        console.log(error +" Network Error")
    }
}



const buttonIncrease = () => {
    if(ratingOfRev > 4){
        setRatingOfRev(0);
    }
    else {
        setRatingOfRev(1 + ratingOfRev);

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
                const data2 = data.sort((a, b) =>  b.dateModified - a.dateModified);
                
                console.log(data2)
                setLists(data2);
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
                console.log(data)
                setReviewData(data)
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
                <div className='delete-hero-input-container'>
                        <h2 className='header-list-display'>Delete a Hero</h2>
                        <div className="listN-input">
                            <p className="input-identifier">List Name:</p>
                            <input className="input" type='text' value={listNForDeleteHero} onChange={(e) => setlistNForDeleteHero(e.target.value)} placeholder='List Name'></input>
                        </div>
                        <div className="hero-input">
                            <p className="input-identifier">Hero Name:</p>
                            <input className="input" type='text' value={nameHForDelete} onChange={(e) => setNameHForDelete(e.target.value)} placeholder='Hero Name'></input>
                        </div>
                        <button className='btn' onClick={callDeleteHeroes}>Delete Hero</button>
                        <p className='msgForAdd'>{msgForDeleteH}</p>
                </div>
                <div className='review-input-container'>
                        <h2 className='header-list-display'>Review a List</h2>
                        <div className="listN-input">
                            <p className="input-identifier">List Name:</p>
                            <input className="input" type='text' value={listNForReview} onChange={(e) => setlistNForReview(e.target.value)} placeholder='List Name'></input>
                        </div>
                        <div className="review-input">
                            <p className="input-identifier">Review Comment:</p>
                            <input className="input" type='text' value={review} onChange={(e) => setReview(e.target.value)} placeholder='comment'></input>
                        </div>
                        <div className="rating-input">
                            <p className="input-identifier">Rating:</p>
                            <button onClick={(buttonIncrease)}  onChange={(e) => setRatingOfRev(e.target.value)}>{ratingOfRev}</button>
                        </div>

                        <button className='btn' onClick={callAddReview}>Add Review</button>
                        <p className='msgForAdd'>{}</p>
                </div>
                <div className='display-hero-input-container'>
                        <h2 className='header-list-display'>Display My Lists</h2>
                        <div className="private-lists-container">
                            {lists && lists.map((list, index)=>(
                                <div key={index+"1"}>
                                    <div key={index} className='hero-div'>
                                        <button id={index} className='label-heroes' onClick={() => toggleExtraInfo(list)}><strong>{list.listN}</strong> - {list.createdBy} - {list.superhero.length} - {list.rating} - {list.lastModified} - Private: {`${list.isPrivate}`}</button>
                                        {list.superhero.map((hero,index2)=>(
                                            <div key={index2}>
                                                {expanded.includes(list) && <FindListsClicked hero={hero}/>}
                                          
                                            </div>
                                            
                                        ))}
                                         {expanded.includes(list) && reviewData && reviewData.map((review,index3)=>(
                                           list.listN === review.listN && review.hidden===false && list.createdByPrivate===review.email ? (
                                                <p hidden={hiddenReview ? false: (true , review.hidden=true)} onClick={callHide}><button><strong>Review: </strong></button>{review.comments}-Rating: {review.rating}-By: {review.username} Modified: {review.lastModified}</p>                            
                                            
                                           ):(
                                               console.log('')
                                           )
                                        ))}
                                     
                                    </div>   
                                </div>
                            ))}  
                        </div>
                </div>
            </div>
        </div>
    );
};

export default MySuperheroLists;