"use client";
import Link from "next/link";
import { FormEvent } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

export default function Register() {
    const router = useRouter();
    function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        e.preventDefault();

        // Read the form data
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
            username: formData.get("register_username"),
            password: formData.get("first_password"),
            repeat_password: formData.get("repeat_password"),
        };
        // Verify all input fields are filled
        if (!data.username || !data.password || !data.repeat_password) {
            console.log("Form fields are required.");
            return;
        }

        console.log("Form fields filled. Pass data to backend.");
        console.log(JSON.stringify(data));
        // pass data as a fetch body
        const api = "/api/register";
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => {
                console.log(res);
                if (!res.ok) {
                    throw new Error("Login failed.");
                }
                return res.json();
            })
            .then((data) => {
                // store the session in client side
                const sessionIdentifier = data.session_identifier;
                const encryptedSessionIdentifier = CryptoJS.AES.encrypt(
                    sessionIdentifier,
                    "secretKey"
                ).toString();
                localStorage.setItem(
                    "sessionIdentifier",
                    encryptedSessionIdentifier
                );
                console.log("Registration successful. Now direct to '/home");
                // Redirect to homepage if registration is successful
                router.push("/home");
            })
            .catch((error) => {
                console.log(error);
            });
    }
    return (
        <Form method="post" onSubmit={handleRegisterSubmit}>
            <Form.Group>
                <Form.Label>Email address</Form.Label>
                <InputGroup>
                    <Form.Control
                        id="register_username"
                        name="register_username"
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
                    id="first_password"
                    name="first_password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Confirm Password</Form.Label>

                <Form.Control
                    id="repeat_password"
                    name="repeat_password"
                    type="password"
                    autoComplete="current-password"
                    required
                />
            </Form.Group>

            <button type="submit">Register</button>

            <p>
                Already have an account?
                <Link href="/login">Sign In</Link>
            </p>
        </Form>
    );
}
