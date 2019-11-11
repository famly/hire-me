import React from 'react';
import './TimeButton.css';

const TimeButton = ({shape, onClickHandler, text, time}) => (
    <button  type='button' className={`button lowercase ${shape}`} onClick={() => onClickHandler(time)}>
        {text}
    </button>
);

export default TimeButton;