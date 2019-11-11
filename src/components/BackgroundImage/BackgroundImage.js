import React from 'react';
import './BackgroundImage.css';

const BackgroundImage = () => (
    <div 
        className='background-image' 
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background-image.jpg)` }}
    />
);

export default BackgroundImage;
