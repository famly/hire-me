import React, { Component } from 'react';
import * as API from '../api/index';
import { Link, Redirect } from 'react-router-dom';

class CheckOut extends Component {
    constructor(props) {
        super(props)

        this.signOut = this.signOut.bind(this);
    }

    state = {
        child: null,
        success: false
    }

    async componentDidMount() {
        this.getFetchData();
    }

    async getFetchData() {
        const resp = await API.getChild(this.props.id);
        this.setState({ child: resp });
    }

    async signOut() {
        if (this.state.child !== 'null') {
            const resp = await API.signOutChild(this.state.child.childId);
            if (resp.error) {
                alert(resp.error);
            } else {
                this.setState({ success: true });
            }
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

                <div className="footer">
                    <Link className="close" to="/">Close</Link>
                    <a className="sign-out" onClick={this.signOut}>Sign out</a>
                </div>
            </div>
        ) : '';
    }
}

export default CheckOut;