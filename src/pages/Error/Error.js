import React from 'react';

import BackgroundImage from '../../components/BackgroundImage/BackgroundImage';
import ActionButton from '../../components/ActionButton/ActionButton';

//Dummy error page, it should receice some props
//with information about what went wrong
const Error = props => {
    const navigateBack = () => props.history.push('/');

    return (
        <>
            <BackgroundImage/>
            <main className='flex-container'>
                <h1>Something went wrong with your request, please try again!</h1>
                <div className='flex-aligned-items bottom-aligned center'>
                    <ActionButton onClickHandler={navigateBack} text='Close'/>
                </div>
            </main>
        </>
    );
}

export default Error;