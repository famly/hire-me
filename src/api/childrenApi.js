import queryParams from '../utils/queryParams';

const TOKEN = '234ffdb8-0889-4be3-b096-97ab1679752c';

const getChildren = () => {
    const params = {
        accessToken: TOKEN,
        groupId: '11fc220c-ebba-4e55-9346-cd1eed714620',
        institutionId: 'fb6c8114-387e-4051-8cf7-4e388a77b673'
    };

    return fetch(`https://tryfamly.co/api/daycare/tablet/group?${queryParams(params)}`);
}

const checkIn = (childId, pickupTime) => {
    const params = {
        accessToken: TOKEN,
        pickupTime
    };

    return fetch(`https://tryfamly.co/api/v2/children/${childId}/checkins?${queryParams(params)}`, {
        method: 'POST'
    });
}

const checkOut = childId => {
    const params = {
        accessToken: TOKEN
    };

    return fetch(`https://tryfamly.co/api/v2/children/${childId}/checkout?${queryParams(params)}`, {
        method: 'POST'
    });
}

export { getChildren, checkIn, checkOut };