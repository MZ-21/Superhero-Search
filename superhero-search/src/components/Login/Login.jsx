import React from 'react';
import './login.css';

const Login = () => {
    return (
        <login id="login">
            <div class="login-container container">
                <div class="login-header header">
                    <h1>Login:</h1>
                </div>
                <div className="login-input-container">
                    <div class="username-input">
                        <p class="input-identifier">Username:</p>
                        <input class="input" type='text' placeholder='username'></input>
                    </div>
                    <div class="password-input">
                        <p class="input-identifier">Password:</p>
                        <input class="input" type='text' placeholder='password'></input>
                    </div>

                </div>
            </div>
        </login>
    );
};

export default Login;