import React, { useState, useEffect, useRef } from 'react';
import './SH.css';
import FindHeroClicked from './SHRender.jsx';
const routerPath = "/api/superheroes";
// const view = require('./SHRender')

const SuperheroSearch = () => {
        const [heroes,setHeroes] = useState([]);
        const [msg,setMsg] = useState([]);
        const isMounted = useRef(true);
        const [expanded,setExpanded] = useState([])
        const [name,setName] = useState('');
        const [race,setRace] = useState('');
        const [power,setPower] = useState('');
        const [publisher,setPublisher] = useState('');

    useEffect(()=>{//fetching data when mounted
            isMounted.current = true;
    
            return () => {
                 isMounted.current = false;
            };
         
            
    },[])
    
    const userSearch = () => {
        displayAllHeroes(name,race,publisher,power);
    }

    const displayAllHeroes = async (enteredName, enteredRace, enteredPublisher, enteredPower)=> {//method for displaying heroes
            try{
                let urlA = ``;

                if(enteredName!==''){urlA += `/name/${enteredName}`}
                if(enteredRace!=='' ){urlA += `/race/${enteredRace}`}
                if(enteredPublisher!==''){urlA += `/publisher/${enteredPublisher}`}
                if(enteredPower!==''){urlA += `/power/${enteredPower}`}
                console.log(urlA)
                const response = await fetch(`${routerPath}/heroes/${urlA}`)
                
                if(response.ok){
                    const data = await response.json();
                    console.log(data)
                    setHeroes(data);
                }
                else{
                    setMsg("Not Authorized");
                    console.log(response.status + " Not Authorized to make this request!")
                        
                }
            }
            catch(error) {
                console.log(error +" Network Error")
            }
    }     

    
  const toggleExtraInfo = (hero) => {
    setExpanded(prevHero => {
      if(prevHero.includes(hero)){
        return prevHero.filter(expanded => expanded !== hero);
    }
    else{
        return [...prevHero, hero];
        }
    })
       
  };

    return (
        <div id="superhero-div-id">
            <div className="">
                <h1>Heroes:</h1>
                <div className='search-bar'>
                    <p className='label'>Name:</p><input id="name-input"className='input-field' value={name} onChange={(e)=> setName(e.target.value)} placeholder='hero name'></input>
                    <p className='label'>Race:</p><input id="race-input" className='input-field' vale={race} onChange={(e)=>setRace(e.target.value)} placeholder='hero race'></input>
                    <p className='label'>Publisher:</p><input id="publisher-input" className='input-field' value={publisher} onChange={(e)=>setPublisher(e.target.value)} placeholder='hero publisher'></input>
                    <p className='label'>Power:</p><input id="power-input" className='input-field' value={power} onChange={(e)=>setPower(e.target.value)} placeholder='hero power'></input>
                    <button id="search-btn" className='btn' onClick={userSearch}>Search</button>
                </div>
                <div className="hero-grid">
                    {heroes.map((hero, index)=>(
                        <div key={index} className='hero-div'>
                            <button id={index} className='label-heroes' onClick={() => toggleExtraInfo(hero)}><strong>{hero.name}</strong> - {hero.Publisher}</button>
                            {expanded.includes(hero) && <FindHeroClicked hero={hero}/>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuperheroSearch;

