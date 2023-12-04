import React, { useState, useEffect, useRef } from 'react';
import './list.css';
import FindListsClicked from './ListsDisplayRender.jsx';

const routerPath = "/api/superheroes";
// const view = require('./SHRender')

const SuperheroLists = () => {
        const [heroes,setHeroes] = useState([]);
        const [msg,setMsg] = useState([]);
        const isMounted = useRef(true);
        const [expanded,setExpanded] = useState([])
        // const [listN,setListN] = useState('');
        // const [privacy,setPrivacy] = useState(true);
        // const [privacySetting,setPrivacySetting] = useState('Click to Set to Public')
        // const [nameHero, setNameHero] = useState('');
        // const [listName, setListName ] = useState('')
        // const [name,setName] = useState('');
        // const [race,setRace] = useState('');
        // const [power,setPower] = useState('');
        // const [publisher,setPublisher] = useState('');
        const [lists,setLists] = useState(null);
        


    useEffect(()=>{//fetching data when mounted
        const displayAllLists = async ()=> {//method for displaying heroes
            try{
                const response = await fetch(`${routerPath}/heroes/lists`)
                
                if(response.ok){
                    const data = await response.json();
                    console.log(data)
                    setLists(data);
                }
                else{
                    console.log(response.status + "Problem finding the lists!")
                    setLists(null);
                }
            }
            catch(error) {
                console.log(error +" Network Error")
            }
        }     

        displayAllLists();    
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
            <div className="public">
                <h1 className='header-lists'>Public Superhero Lists:</h1>
                <div className='public-lists-container'>
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
    );
};

export default SuperheroLists;
