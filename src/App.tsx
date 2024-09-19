import { useEffect } from 'react';
import './App.scss';
import { useChildrenStore } from './store/child/store';
import { checkInChild, checkOutChild, getChildren } from './utils/api';
import {
    checkInChildAction,
    checkOutChildAction,
    setChildrenAction,
} from './store/child/actions';

function App() {
    const [children, dispatch] = useChildrenStore();
    useEffect(() => {
        const fetchChildren = async () => {
            const fetchedChildren = await getChildren();
            dispatch(setChildrenAction(fetchedChildren.slice(0, 1)));
        };

        fetchChildren();
    }, [dispatch]);

    const checkInFirstChild = async () => {
        if (children.length === 0) {
            return;
        }
        const pickupTime = new Date();
        pickupTime.setHours(16, 0, 0, 0);
        await checkInChild(children[0].id, pickupTime);
        dispatch(checkInChildAction(children[0].id, pickupTime));
    };

    const checkOutFirstChild = async () => {
        if (children.length === 0) {
            return;
        }
        await checkOutChild(children[0].id);
        dispatch(checkOutChildAction(children[0].id));
    };

    return (
        <>
            <div></div>
            <h1>Famly check-in management</h1>
            <div className="card">{JSON.stringify(children, undefined, 4)}</div>
            <button onClick={() => checkInFirstChild()}>
                Check in first child
            </button>
            <button onClick={() => checkOutFirstChild()}>
                Check out first child
            </button>
        </>
    );
}

export default App;
