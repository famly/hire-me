import React, { useState } from 'react';
import PropTypes from "prop-types";

import ChildrenStore from '../../store/ChildrenStore';
import BackgroundImage from '../../components/BackgroundImage/BackgroundImage';
import ActionButton from '../../components/ActionButton/ActionButton';
import TimeButton from '../../components/TimeButton/TimeButton';
import { hoursInRange, minutesIntervalInHour, convertToHours, convertToHoursAndMinutes } from '../../utils/timeHandler';
import './CheckIn.css';

const CheckIn = props => {
    const { store } = props;
    const { name, childId } = store.getChildById(props.match.params.childId);
    const [ pickupTime, setPickupTime ] = useState(null);
    const [ time, setTime ] = useState(null);

    const navigateBack = () => props.history.push('/');

    const checkIn = () => store.checkIn(childId, pickupTime, props.history);

    return (
        <>
            <BackgroundImage/>
            <main className='flex-container'>
                <h1>{name.firstName}</h1>
                <h2>
                    Choose when {name.firstName} wil be picked up: 
                    <span className='lowercase'>
                        {pickupTime && ` at ${convertToHoursAndMinutes(new Date(pickupTime))}`}
                    </span>
                </h2>

                <div className='buttons-wrapper'>
                    {hoursInRange(16, 8).map((t, key) => 
                        <TimeButton key={key} time={t} onClickHandler={setTime} text={convertToHours(t)}/>
                    )}
                </div>

                <div className='buttons-wrapper round'>
                    {time && minutesIntervalInHour(time, 15).map((h, key) => 
                        <TimeButton key={key} time={h} onClickHandler={setPickupTime} text={convertToHoursAndMinutes(h)}/>
                    )}
                </div>
                
                <div className='flex-aligned-items'>
                    <ActionButton onClickHandler={navigateBack} text='Close'/>
                    <ActionButton onClickHandler={checkIn} text='Sign in' color='green'/>
                </div>
            </main>
        </>
    )
}

CheckIn.propTypes = {
    store: PropTypes.instanceOf(ChildrenStore).isRequired
}

export default CheckIn;
