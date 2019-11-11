import React from 'react';
import './ActionButton.css';

const ActionButton = ({ color, text, onClickHandler }) => (
    <button type='button' className={`action-button ${color ? color : ''}`} onClick={onClickHandler}>{text}</button>
);

export default ActionButton;