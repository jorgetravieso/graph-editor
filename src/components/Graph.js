import React, { Component } from 'react';
import d3Graph from '../plugins/d3Graph';

class Graph extends Component {

    componentDidMount() {
        d3Graph.create(this.refs.graph, {
            nodes: this.props.nodes,
            links: this.props.links,
            onNodeSelected: this.props.onNodeSelected
        });
    }

    render() {
        return <div className="network" ref="graph"></div>
    }
}

export default Graph;