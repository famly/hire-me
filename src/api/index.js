const childrenAPI = 'https://tryfamly.co/api/daycare/tablet/group';
const accessToken = '234ffdb8-0889-4be3-b096-97ab1679752c';
const groupId = '11fc220c-ebba-4e55-9346-cd1eed714620';
const institutionId = 'fb6c8114-387e-4051-8cf7-4e388a77b673';

async function fetchChildrenAPI() {
    const response = await fetch(`${childrenAPI}?accessToken=${accessToken}&groupId=${groupId}&institutionId=${institutionId}`);
    return await response.json();
}

async function getChild(id) {
    const response = await fetch(`${childrenAPI}?accessToken=${accessToken}&groupId=${groupId}&institutionId=${institutionId}`);
    const data = await response.json();
    return data.children.find(x => x.childId === id)
}

async function signInChild(id, pickupTime) {
    const response = await fetch(`https://tryfamly.co/api/v2/children/${id}/checkins?accessToken=${accessToken}&pickupTime=${encodeURIComponent(pickupTime)}`,
        {
            method: 'POST'
        });
    return await response.json();
}

async function signOutChild(id) {
    const response = await fetch(`https://tryfamly.co/api/v2/children/${id}/checkout?accessToken=${accessToken}`,
        {
            method: 'POST',
        });
    return await response.json();
}

export { fetchChildrenAPI, getChild, signInChild, signOutChild };