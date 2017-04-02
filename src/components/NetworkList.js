import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchNetworks } from '../actions/index';
import { Link } from 'react-router';

class NetworkList extends Component {

    componentWillMount() {
        this.props.fetchNetworks();
    }

    renderNetworks() {
        return this.props.networks.map((network) => {
            return (
                <li className="list-group-item" key={network.id}>
                    <Link to={"network/" + network.id}>
                        <strong>{network.name}</strong>
                    </Link>
                </li>
            );
        });
    }

    render() {
        return (
            <div>
                <div className="text-xs-right">
                    <Link to="/network/new" className="btn btn-primary">New</Link>
                </div>
                <h3>Domains</h3>
                <ul className="list-group">
                    {this.renderNetworks()}
                </ul>
            </div>
        );
    }
}

function mapsStateToProps(state) {
    return { networks: state.networks.all};
}

export default connect(mapsStateToProps, { fetchNetworks })(NetworkList);