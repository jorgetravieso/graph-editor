import React, { Component } from 'react';
import { connect } from 'react-redux';
import Color from 'color';

class NetworkNodeDetail extends Component {

    render() {
        console.log(this.props.node);
        if (!this.props.node) {
            return  <div className="panel panel-default">
                        <div className="panel-body">Select a node...</div>
                    </div>
        }

        const styles = {
            panel: {
                //"border": `${color.darken(0.7)} 1px solid`
            },
            //heading: {
            //    "backgroundColor": color,
            //    "borderBottom": `${color.darken(0.7)} 1px solid`,
            //    "padding": "8px"
            //},
            body: {
                //"padding": "8px"
            }
        };

        return (
            <div className="panel panel-default" style={styles.panel}>
                <div className="panel-body" style={styles.body}>Node Properties</div>
                <ul className="list-group">
                    <li className="list-group-item"><strong>Name</strong>: {this.props.node.name}</li>
                    <li className="list-group-item"><strong>Type</strong>: {this.props.node.type}</li>
                </ul>
            </div>
        );
    }
}

export default NetworkNodeDetail;

//function mapStateToProps({selectedNode}) {
//    return { node: selectedNode };
//}
//
//export default connect(mapStateToProps)(NetworkNodeDetail);