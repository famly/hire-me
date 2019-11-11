import React from 'react';
import './ActionButton.css';

const ActionButton = ({ color, text, onClickHandler }) => (
    <button type='button' className={`action-button ${color}`} onClick={onClickHandler}>{text}</button>
);

export default ActionButton;