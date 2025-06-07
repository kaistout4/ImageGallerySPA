import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

interface LoginPageProps {
    isRegistering?: boolean;
    onAuthSuccess?: (token: string) => void;
}

interface FormState {
    error?: string;
}

async function makeAuthRequest(endpoint: string, username: string, password: string) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return response.json();
}

async function handleRegister(username: string, password: string) {
    const data = await makeAuthRequest("/auth/register", username, password);
    console.log("Successfully created account");
    return data.token;
}

async function handleLogin(username: string, password: string) {
    const data = await makeAuthRequest("/auth/login", username, password);
    return data.token;
}

export function LoginPage({ isRegistering = false, onAuthSuccess }: LoginPageProps) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();

    const [state, formAction, isPending] = React.useActionState(
        async (_previousState: FormState, formData: FormData): Promise<FormState> => {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;

            try {
                const handler = isRegistering ? handleRegister : handleLogin;
                const token = await handler(username, password);
                if (onAuthSuccess) {
                    onAuthSuccess(token);
                }
                navigate("/");
                return {};
            } catch (error) {
                return { 
                    error: error instanceof Error ? error.message : "Failed to connect to server. Please try again." 
                };
            }
        },
        {}
    );

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={formAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input 
                    id={usernameInputId} 
                    name="username"
                    required 
                    disabled={isPending}
                />

                <label htmlFor={passwordInputId}>Password</label>
                <input 
                    id={passwordInputId} 
                    name="password"
                    type="password" 
                    required 
                    disabled={isPending}
                />

                <input 
                    type="submit" 
                    value="Submit" 
                    disabled={isPending}
                />
                {state.error && (
                    <p 
                        style={{ color: "red" }} 
                        aria-live="polite"
                    >
                        {state.error}
                    </p>
                )}
            </form>
            {!isRegistering && (
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            )}
        </>
    );
}
