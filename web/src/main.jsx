import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { store } from './app/redux/store';
import { Provider } from 'react-redux'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/bootstrap/css/bootstrap.min.css';
import './assets/bootstrap/js/bootstrap.bundle.min.js';
import './index.css'
import "src/utils/i8next.js"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
