import { FETCH_NETWORKS, FETCH_NETWORK, SELECT_NODE } from '../actions/index';

const INITIAL_STATE = { all: [], network: null, selectedNode: null};


export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case FETCH_NETWORKS: return {... state, all: action.payload};
        case FETCH_NETWORK:  return {... state, network: action.payload};
        case SELECT_NODE:    return {... state, selectedNode: action.payload};
        default: return state
    }
}