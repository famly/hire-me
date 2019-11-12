import React, { Component } from 'react';
import * as API from '../api/index';
import { Link } from 'react-router-dom';

class ListOfChildren extends Component {
    state = {
        children: [],
    }

    async componentDidMount() {
        this.getFetchData();
    }

    async getFetchData() {
        const resp = await API.fetchChildrenAPI();
        const children = resp.children || [];
        this.setState({ children });
    }

    render() {
        return (
            <ul className="children">
                {this.state.children.map(child =>
                    (<li key={child.childId}>
                        <Link to={(child.checkedIn ? '/out' : '/in') + '/' + child.childId}
                        >
                            <div>
                                <img src={child.image.small} alt={child.name.fullName} />
                            </div>
                            <span>{child.name.fullName}</span>
                            <p className={child.checkedIn ? 'checked-in' : 'not-checked-in'}>{child.checkedIn ? 'checked in' : 'not checked in'}</p>
                        </Link>
                    </li>))}
            </ul>
        );
    }
}

export default ListOfChildren;