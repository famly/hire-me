import React, { Component } from 'react';
import * as API from '../api/index';
import { Link, Redirect } from 'react-router-dom';
import TimePicker from './TimePicker';

class CheckIn extends Component {
    constructor(props) {
        super(props)

        this.signIn = this.signIn.bind(this);
    }

    state = {
        child: null,
        time: null,
        success: false
    }

    async componentDidMount() {
        this.getFetchData();
    }

    async getFetchData() {
        const resp = await API.getChild(this.props.id);
        this.setState({ child: resp });
    }

    getTime = (hours, minute) => {
        const time = hours && minute ? `${hours}:${minute}` : null;
        this.setState({ time });
    }

    async signIn() {
        if (this.state.child && this.state.time) {
            const resp = await API.signInChild(this.state.child.childId, this.state.time);
            if (resp.error) {
                alert(resp.error);
            } else {
                this.setState({ success: true });
            }
        } else {
            return false;
        }
    }

    render() {
        if (this.state.success) {
            return <Redirect to="/" />;
        }

        return this.state.child ? (
            <div className="child-page">
                <div>
                    <img src={this.state.child.image.small} alt={this.state.child.name.fullName} />
                </div>
                <span>{this.state.child.name.fullName}</span>
                <p>Choose when {this.state.child.name.firstName} will be picked up: {this.state.time} </p>

                <TimePicker getTime={this.getTime} />
                <div className="footer">
                    <Link className="close" to="/">Close</Link>
                    <a className="sign-in" onClick={this.signIn} disabled={!this.state.time}>Sign in</a>
                </div>
            </div>
        ) : '';
    }
}

export default CheckIn;