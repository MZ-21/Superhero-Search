import React, { useState, useEffect } from 'react';
import './list.css'; 


const FindListsClicked = ({hero}) => {
    console.log(hero)
    return(
            <div className='hero-content-container'>
                {/* <h2>{hero.name}</h2> */}
                {/* <p><strong>Publisher:</strong>{hero.Publisher}</p> */}
                <h3 className='hero-attribute-name'>{hero.name}</h3>
                <p className='hero-attribute'><strong>Publisher:</strong>{hero.Publisher}</p>
                <p className='hero-attribute'><strong>id:</strong>{hero.id}</p>
                <p className='hero-attribute'><strong>Gender:</strong>{hero.Gender}</p>
                <p className='hero-attribute'><strong>Eye Color:</strong>{hero['Eye color']}</p>
                <p className='hero-attribute'><strong>Race:</strong>{hero.Race}</p>
                <p className='hero-attribute'><strong>Hair color:</strong>{hero['Hair color']}</p>
                <p className='hero-attribute'><strong>Height:</strong>{hero.Height}</p>
                <p className='hero-attribute'><strong>Skin color</strong>{hero['Skin color']}</p>
                <p className='hero-attribute'><strong>Alignment:</strong>{hero.Alignment}</p>
                <p className='hero-attribute'><strong>Weight:</strong>{hero.Weight}</p>
                <p className='hero-attribute'><strong>Powers:</strong>{hero.powers}</p>
                <a href= {`https://duckduckgo.com/?q=${encodeURIComponent(hero.name + " " +  hero.Publisher)}`} target='_blank' rel='noreferrer'>DDG Link</a>
                
            </div>

    )
  }

export default FindListsClicked;