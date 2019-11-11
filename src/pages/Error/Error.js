import React from 'react';
import BackgroundImage from '../../components/BackgroundImage/BackgroundImage';

//Dummy error page, it should receice some props
//with information about what went wrong
const Error = props => {
    const navigateBack = () => props.history.push('/');

    return (
        <>
            <BackgroundImage/>
            <main>
                <h1>Something went wrong with your request, please try again!</h1>
                <div className='action-buttons-wrapper'>
                    <button type='button' className='action-button' onClick={navigateBack}>Close</button>
                </div>
            </main>
        </>
    );
}

export default Error;