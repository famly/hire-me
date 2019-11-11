import { checkIn, checkOut } from '../api/childrenApi';

export default class ChildrenStore {
    constructor(children) {
        this._children = children;
    }
    
    get children () {
        return this._children;
    }

    set children (children) {
        this._children = children;
    }

    getChildById(id) {
        let child = this.children.find(({ childId }) => childId === id);
        return child ? child : null;
    }

    async checkIn(childId, pickupTime, history) {
        try {
            const resp = await checkIn(childId, new Date(pickupTime));
            const data = await resp.json();

            if(data) {
                const child = this.getChildById(childId);
                child.checkedIn = true;
                history.push('/');
            }
        } catch(err) {
            console.log(err);
            history.push('/error');
        }
    }

    async checkOut(childId, history) {
        try {
            const resp = await checkOut(childId);
            const data = await resp.json();

            if(data) {
                const child = this.getChildById(childId);
                child.checkedIn = false;
                history.push('/');
            }
        } catch(err) {
            console.log(err);
            history.push('/error');
        }
    }
}