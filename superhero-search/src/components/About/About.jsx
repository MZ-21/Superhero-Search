import React from 'react';
import './About.css';

const About = () => {
    return (
        <div id="about">
            <div className="about-container container">
                <div className="about-header header">
                    <h1>About Us:</h1>
                </div>
                <div className="about-words">
                    <p>Superhero search is a website where anyone can search for a superhero and view public lists. Authorized users have the additional functionality of creating lists to save lists of heroes.</p>
                </div>
            </div>
        </div>
    );
};

export default About;