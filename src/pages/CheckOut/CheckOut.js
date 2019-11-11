import React from 'react';
import PropTypes from "prop-types";

import ChildrenStore from '../../store/ChildrenStore';
import BackgroundImage from '../../components/BackgroundImage/BackgroundImage';
import Profile from '../../components/Profile/Profile';
import ActionButton from '../../components/ActionButton/ActionButton';
import './CheckOut.css';

const CheckOut = props =>  {
    const { store } = props;
    const child = store.getChildById(props.match.params.childId);
    const { childId } = child;

    const checkOut = () => store.checkOut(childId, props.history);

    const navigateBack = () => props.history.push('/');

    return (
        <>
            <BackgroundImage/>
            <main className='flex-container'>
                <Profile child={child} isBig/>
                <div className='flex-aligned-items bottom-aligned'>
                    <ActionButton onClickHandler={navigateBack} text='Close'/>
                    <ActionButton onClickHandler={checkOut} text='Sign out' color='red'/>
                </div>
            </main>
        </>
    )
}

CheckOut.propTypes = {
    store: PropTypes.instanceOf(ChildrenStore).isRequired
}

export default CheckOut;
