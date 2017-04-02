import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import IntentNet  from './Graph';
import NetworkNodeDetail from './NetworkNodeDetail';
import { fetchNetwork, deletePost, selectNode } from '../actions/index';


class NetworkShow extends Component {

    componentWillMount() {
        this.props.fetchNetwork(this.props.params.id);
    }

    render() {
        const { network } = this.props;
        if (!network) {
            return <div>Loading...</div>;
        }

        var styles = {
            nodeDetail: {
                "marginTop": 65
            }
        };

        return(
            <div>
                <Link to="/">Back To Index</Link>
                <div className="row" style={{border: "1px solid #e3e3e3", "border-radius": "4px"}}>
                    <div className="col-md-8">
                        <IntentNet
                            nodes={network.nodes}
                            links={network.links}
                            onNodeSelected={this.props.selectNode} />
                    </div>
                    <div className="col-md-4" style={styles.nodeDetail}>
                        <NetworkNodeDetail node={this.props.selectedNode} />
                    </div>
                </div>
            </div>
        );
    }


}

function mapStateToProps(state) {
    return {
        network: state.networks.network,
        selectedNode: state.networks.selectedNode
    };
}

export default connect(mapStateToProps, { fetchNetwork, deletePost, selectNode })(NetworkShow);