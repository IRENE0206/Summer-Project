"use client";

import Link from "next/link";
import { FormEvent } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        e.preventDefault();
        // Read the form data
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
            username: formData.get("login_username"),
            password: formData.get("login_password"),
        };
        // Verify all input fields are filled
        if (!data.username || !data.password) {
            console.log("Form fileds are required");
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
            .then((res) => {
                if (res.ok) {
                    console.log("Login ok successful");
                    return res.json();
                } else {
                    console.log("Login failed");

                    throw new Error("Login failed");
                }
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
                console.log("Login successful. Now direct to '/home");
                // Redirect to homepage if login is successful
                router.push("/home");
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <form method="post" onSubmit={handleLoginSubmit}>
            <div>
                <label>Email address</label>
                <div>
                    <input
                        id="login_username"
                        name="login_username"
                        type="search"
                        autoComplete="username"
                        placeholder="You UoB username"
                        required
                    />
                    <span>@bristol.ac.uk</span>
                </div>
            </div>

            <div>
                <div>
                    <label>Password</label>
                    <div>
                        <input
                            id="login_password"
                            name="login_password"
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                </div>

                <div>
                    <button type="submit">Sign In</button>
                </div>
            </div>

            <p>
                Do not have an account?
                <Link href="/register">Register</Link>
            </p>
        </form>
    );
}
