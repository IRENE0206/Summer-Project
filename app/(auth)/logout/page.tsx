import Link from "next/link";

export default function Logout() {
    return (
        <>
            <p>You have logged out</p>
            <Link href="/login">
                <button>Click here to sign in</button>
            </Link>
        </>
    );
}
