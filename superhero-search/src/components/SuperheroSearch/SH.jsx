import React, { useState, useEffect } from 'react';
import './SH.css';
import FindHeroClicked from './SHRender.jsx';
const routerPath = "/api/superheroes";
// const view = require('./SHRender')

const SuperheroSearch = () => {
        const [heroes,setHeroes] = useState([]);
        const [msg, setMsg] = useState('');
        const [expanded,setExpanded] = useState([])

        console.log("superhero search")

        useEffect(()=>{//fetching data when mounted
            const displayAllHeroes = async ()=> {//method for displaying heroes
                try{
                    // const jwtToken = localStorage.getItem('token')
                    const response = await fetch(`${routerPath}/heroes`)
                    console.log(response)
                    if(response.ok){
                        const data = await response.json();
                        // const heroesWithExpanded = data.map(hero => ({ ...hero, expanded: false }));
                        setHeroes(data);
                        console.log(data, "data called")
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
            displayAllHeroes();
            
        },[])

    
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

// {
//     method: "GET",
//     headers: {
//     "Authorization": `Bearer ${jwtToken}`,
//     "Content-Type": "application/json",
//     },
// }

