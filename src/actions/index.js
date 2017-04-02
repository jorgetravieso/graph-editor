import axios from 'axios';

export const FETCH_NETWORKS = 'FETCH_NETWORKS';
export const FETCH_NETWORK = 'FETCH_NETWORK';
export const SELECT_NODE = 'SELECT_NODE';

export const CREATE_POST = 'CREATE_POSTS';
export const DELETE_POST = 'DELETE_POST';

const ROOT_URL = 'http://reduxblog.herokuapp.com/api';
const API_KEY = '?key=123456qwerty098765';

export function fetchNetworks() {

    const movies = [
        {id: 1, name: "Matrix"}
    ];

    return {
        type: FETCH_NETWORKS,
        payload: movies
    };
}

export function fetchNetwork(id) {

    var nodes = [
        {id: 0, reflexive: false, type: "person", name: "John"},
        {id: 1, reflexive: false, type: "person", name: "Eddie"},
        {id: 3, reflexive: false, type: "person", name: "Mariana"},
        {id: 4, reflexive: false, type: "person", name: "Lauren"},
        {id: 5, reflexive: false, type: "person", name: "George"},
        {id: 6, reflexive: false, type: "movie", name: "Matrix I"},
        {id: 7, reflexive: false, type: "person", name: "Paul"},
        {id: 8, reflexive: false, type: "movie", name: "Matrix II"},
        {id: 9, reflexive: false, type: "movie", name: "Matrix III"}
    ];

    var links = [
        {source: nodes[0], target: nodes[2], left: false, right: true},
        {source: nodes[0], target: nodes[3], left: false, right: true},
        {source: nodes[0], target: nodes[4], left: false, right: true},
        {source: nodes[1], target: nodes[2], left: false, right: true},
        {source: nodes[1], target: nodes[3], left: false, right: true},
        {source: nodes[1], target: nodes[4], left: false, right: true},
        {source: nodes[3], target: nodes[5], left: false, right: true},
        {source: nodes[4], target: nodes[5], left: false, right: true},
        {source: nodes[6], target: nodes[7], left: false, right: true},
        {source: nodes[6], target: nodes[8], left: false, right: true}
    ];

    return {
        type: FETCH_NETWORK,
        payload: { nodes: nodes, links: links }
    };
}

export function selectNode(node) {
    return {
        type: SELECT_NODE,
        payload: node
    }
}

export function createPost(props) {
    const request = axios.post(`${ROOT_URL}/posts${API_KEY}`, props);

    return {
        type: CREATE_POST,
        payload: request
    }
}

export function deletePost(id) {
    const request = axios.delete(`${ROOT_URL}/posts/${id}${API_KEY}`);

    return {
        type: DELETE_POST,
        payload: request
    };
}