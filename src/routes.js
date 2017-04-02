import React from 'react'
import { Route, IndexRoute } from 'react-router';

import App from'./components/app';
import NetworkList from './components/NetworkList';
import NetworkNew from './components/NetworkNew';
import NetworkShow from './components/NetworkShow';

export default (
    <Route path="/" component={App} >
        {/*
            IndexRoute helper route, will show up when
            the path matches the parent, but not one of the children
        */}
        <IndexRoute component={NetworkList} />
        <Route path="/network/new" component={NetworkNew} />
        <Route path="/network/:id" component={NetworkShow} />
    </Route>
);