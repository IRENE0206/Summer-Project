"use client";

import Link from "next/link";
import { FormEvent } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
            username: formData.get("login_username"),
            password: formData.get("login_password"),
        };
        if (!data.username || !data.password) {
            console.log("Form fileds are required");
            return;
        }

        console.log("LOGIN HERE");
        const api = "/api/login";
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
                const sessionIdentifier = data.session_identifier;
                const encryptedSessionIdentifier = CryptoJS.AES.encrypt(
                    sessionIdentifier,
                    "secretKey"
                ).toString();
                localStorage.setItem(
                    "sessionIdentifier",
                    encryptedSessionIdentifier
                );
                router.push("/home");
                console.log("redirect");
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
                    {/*{isFormValid ? (
                        <Link href="/workbook">
                            <button type="submit">Sign in</button>
                        </Link>
                    ) : (
                        <button type="submit" disabled={isFormFilled}>
                            Sign in
                        </button>
                    )} */}
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
