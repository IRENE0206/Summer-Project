import Link from "next/link";

export default function Logout() {
    function onClickHandler() {
        const api = "/api/logout";
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.ok) {
                    console.log("Login out successful");
                } else {
                    throw new Error("Login failed");
                }
            })
            .catch((error) => console.log("Log out failed"));
    }
    return (
        <Link href="/logout">
            <button type="button" onClick={onClickHandler}>
                Sign out
            </button>
        </Link>
    );
}
