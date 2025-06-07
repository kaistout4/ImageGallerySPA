import React from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

interface LoginPageProps {
    isRegistering?: boolean;
}

export function LoginPage({ isRegistering = false }: LoginPageProps) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form">
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} required />

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} type="password" required />

                <input type="submit" value="Submit"/>
            </form>
            {!isRegistering && (
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            )}
        </>
    );
}
