import React from 'react';
import { Link } from "react-router-dom";
import './Profile.css';

const DEFAULT_AVATAR = `${process.env.PUBLIC_URL}/user.svg`;

const Profile = props => {
    const { hasBadge, isBig, child } = props;
    const { childId, name, image, checkedIn } = child;
    const backgroundImage = !isBig ? image.small : image.large

    return (
        <Link 
            className={`child ${isBig ? 'big' : ''}`} 
            to={`/child/${childId}/${!checkedIn ? 'checkin' : 'checkout'}`} 
        >
            <div 
                className='child-avatar' 
                style={{ backgroundImage: `url(${backgroundImage ? backgroundImage : DEFAULT_AVATAR})` }}
            >
                {(hasBadge && checkedIn) && 
                    <img 
                        className='checkedin-icon' 
                        src={`${process.env.PUBLIC_URL}/check-mark.svg`} 
                        alt='check-mark'
                    />
                }
            </div>
            <p className='child-name'>{name.firstName}</p>
        </Link>
    );
}

export default Profile;
