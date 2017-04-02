import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import networkReducer from './reducer_network';

const rootReducer = combineReducers({
  networks: networkReducer,
  form: formReducer
});

export default rootReducer;
