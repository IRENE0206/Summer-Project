"use client";

import Link from "next/link";
import { FormEvent } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

export default function Login() {
    const router = useRouter();
    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        e.preventDefault();
        // Read the form data
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
            username: formData.get("login_username") as string,
            password: formData.get("login_password") as string,
        };
        // Verify all input fields are filled
        if (!data.username || !data.password) {
            console.log("Form fields are required");
            return;
        }

        console.log("LOGIN HERE");
        const api = "/api/login";
        // pass data as a fetch body
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) {
                    throw new Error(data.message || "Unknown Error");

                }
                const sessionIdentifier = data.sessionIdentifier;
                console.log("sessionIdentifier " + sessionIdentifier)
                const encryptedSessionIdentifier = CryptoJS.AES.encrypt(
                    sessionIdentifier,
                    "secretKey"
                ).toString();
                console.log("encryptedSessionIdentifier " + encryptedSessionIdentifier)
                localStorage.setItem(
                    "sessionIdentifier",
                    encryptedSessionIdentifier
                );
                console.log("Login successful. Now direct to '/home");
                // Redirect to homepage if login is successful
                router.push("/home");
            })
            .catch((error) => {
                console.error("Login error:", error);
            });
    }

    return (
        <Form method="post" onSubmit={handleLoginSubmit}>
            <Form.Group>
                <Form.Label>Email address</Form.Label>
                <InputGroup>
                    <Form.Control
                        id="login_username"
                        name="login_username"
                        type="search"
                        autoComplete="username"
                        placeholder="You UoB username"
                        required
                    />
                    <InputGroup.Text>@bristol.ac.uk</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group>
                <Form.Label>Password</Form.Label>

                <Form.Control
                    id="login_password"
                    name="login_password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </Form.Group>

            <button type="submit">Sign In</button>

            <p>
                Do not have an account?
                <Link href="/register">Register</Link>
            </p>
        </Form>
    );
}
