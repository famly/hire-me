import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { getChildren } from './api/childrenApi';
import ChildrenStore from './store/ChildrenStore';

import BackgroundImage from './components/BackgroundImage/BackgroundImage';
import Spinner from './components/Spinner/Spinner';
import Children from './pages/Children/Children';
import Error from './pages/Error/Error';
import CheckIn from './pages/CheckIn/CheckIn';
import CheckOut from './pages/CheckOut/CheckOut';

class App extends Component {
    state = { isLoading: true };
    store = null;
    
    async fetchChildren () {
        try {
            const req = await getChildren();
            const data = await req.json();

            this.store = new ChildrenStore([...data.children]);
            this.setState({ isLoading: false });
        } catch(err) {
            // Show an error screen so the user
            // knows that something went wrong
            console.log(err)
        }
    }

    componentDidMount() {
        this.fetchChildren();
    }

    render() {
        const { isLoading } = this.state;

        return (
            isLoading ?
                <> 
                    <BackgroundImage/>
                    <Spinner/>
                </>
            :
                <Router>
                    <Switch>
                        <Route exact path='/' render={props => <Children store={this.store} {...props}/>} />
                        <Route path='/child/:childId/checkout' render={props => <CheckOut store={this.store} {...props}/>} />
                        <Route path='/child/:childId/checkin' render={props => <CheckIn store={this.store} {...props}/>} />
                        <Route exact path='/error' render={props => <Error {...props}/>} />
                    </Switch>
                </Router>
        )
    }
}

export default App;