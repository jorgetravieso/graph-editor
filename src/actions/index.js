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
        {id: 0, highlighted : false, reflexive: false, type: "person", name: "John"},
        {id: 1, highlighted : false, reflexive: false, type: "person", name: "Eddie"},
        {id: 3, highlighted : false, reflexive: false, type: "person", name: "Mariana"},
        {id: 4, highlighted : false, reflexive: false, type: "person", name: "Lauren"},
        {id: 5, highlighted : false, reflexive: false, type: "person", name: "George"},
        {id: 6, highlighted : false, reflexive: false, type: "movie", name: "Matrix I"},
        {id: 7, highlighted : true, reflexive: false, type: "person", name: "Keanu"},
        {id: 8, highlighted : true, reflexive: false, type: "movie", name: "Matrix II"},
        {id: 9, highlighted : true, reflexive: false, type: "movie", name: "Matrix III"}
    ];

    var links = [
        {sourceIndex: 0, targetIndex: 2, left: false, right: true},
        {sourceIndex: 0, targetIndex: 3, left: false, right: true},
        {sourceIndex: 0, targetIndex: 4, left: false, right: true},
        {sourceIndex: 1, targetIndex: 2, left: false, right: true},
        {sourceIndex: 1, targetIndex: 3, left: false, right: true},
        {sourceIndex: 1, targetIndex: 4, left: false, right: true},
        {sourceIndex: 3, targetIndex: 5, left: false, right: true},
        {sourceIndex: 4, targetIndex: 5, left: false, right: true},
        {sourceIndex: 6, targetIndex: 7, left: false, right: true},
        {sourceIndex: 6, targetIndex: 8, left: false, right: true}
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