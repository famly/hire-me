import React from 'react';
import PropTypes from "prop-types";
import './Children.css';

import ChildrenStore from '../../store/ChildrenStore';
import BackgroundImage from '../../components/BackgroundImage/BackgroundImage';
import Profile from '../../components/Profile/Profile';

const Children = ({ store }) => {
    const { children } = store;

    return (
        <>
            <BackgroundImage/>
            <main>
                <h1>Elephants</h1>
                <div className='children-wrapper'>
                    {children.length > 1 && children.map(child => <Profile key={child.childId} child={child} hasBadge/>)}
                </div>
            </main>
        </>
    );
}

Children.propTypes = {
    store: PropTypes.instanceOf(ChildrenStore).isRequired
}

export default Children;
