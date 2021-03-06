import React from 'react';
import ReactDOM from 'react-dom';

// styles
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

import { LoginButton } from './components/LoginButton';
import { Main } from './components/Main';
import { MainState } from './states/MainState';

// This is the app's global state. It consists of multiple parts, consumed by multiple nested components
const appState = new MainState();

ReactDOM.render(

    <div>
        <nav className="navbar navbar-dark bg-dark">
            <a className="navbar-brand" href="/">Let's Go Out Demo</a>

            <LoginButton state={appState.loginState}></LoginButton>
        </nav>
        <Main state={appState}></Main>
    </div>,

    document.getElementById('root') as HTMLElement
);



//import App from './App';


//ReactDOM.render(<App />, document.getElementById('root'));
