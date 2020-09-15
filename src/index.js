import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from "react-redux";
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { reducer } from './redux/reducer';
// import { loadState, saveState } from "./localStorage";

// //localStorage state loader
// const persisteState = loadState();

const store = createStore(
  reducer,
  { names: [] },
  // persisteState,
  composeWithDevTools())

// // save data from redux state
// store.subscribe(() => {
//   saveState({      
//     localData: store.getState().names,
//   });
// });

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


