import React, { Component } from 'react';
import _ from 'lodash';
import d3Graph from '../plugins/d3Graph';
import { connect } from 'react-redux';
import { fetchNetwork, selectNode as onNodeSelected } from '../actions/index';

class Graph extends Component {

    componentDidMount() {
        const { network } = this.props;
        if (!network) {
            return <div>Loading...</div>;
        }
        if (!d3Graph.isRendered()) {
            d3Graph.create(this.refs.graph, {
                nodes: network.nodes,
                links: network.links,
                ...this.props
            });
        }
    }

    componentDidUpdate() {
        const { network } = this.props;
        if (!network) {
            return <div>Loading...</div>;
        }
        if (!d3Graph.isRendered()) {
            d3Graph.create(this.refs.graph, {
                nodes: network.nodes,
                links: network.links,
                ...this.props
            });
        } else {
            const updateFn = (nodes, links) => {
                const { mutations } = this.props;
                if (mutations) {
                    _.each(nodes, n => {
                        if (mutations.highlighted && _.indexOf(mutations.highlighted, n.id) > -1) {
                            n.highlighted = true;
                        } else {
                            n.highlighted = false;
                        }
                        if (mutations.reflexive && _.indexOf(mutations.reflexive, n.id) > -1) {
                            n.reflexive = true;
                        } else {
                            n.reflexive = false;
                        }
                    });
                }
            };

            d3Graph.update(this.refs.graph, {
                nodes: network.nodes,
                links: network.links,
                ...this.props
            }, updateFn);

            const editMutation = this.props.editMutation;
            if (editMutation) {
                const {prop, value} = editMutation;
                switch (editMutation.type) {
                    case 'EDIT_NODE':
                        d3Graph.updateNode(editMutation.id, node => {
                            node[prop] = value;
                        });
                }
            }
        }
    }

    render() {
        return <div className="intent-net" ref="graph"/>
    }
}

function mapStateToProps(state) {
    return {
        network: state.networks.network,
        //mutations: state.conversation.mutations,
        // editMutation: state.networks.editMutation
    };
}

export default connect(mapStateToProps, { fetchNetwork, onNodeSelected })(Graph);
