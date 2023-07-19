"use client";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import UserMenu from "@/components/UserMenu";
import UseAuth from "@/utils/UseAuth";
import UserInfo from "@/utils/UserInfo";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const passAuth = UseAuth();
    const userInfo = UserInfo();
    return (
        <>
            {passAuth ? (
                <>
                    <header>
                        <nav>
                            <div>
                                <h1>WEBSITE NAME</h1>
                            </div>
                            <div>
                                <Link href="/new-workbook/edit">
                                    <button type="button">
                                        + New workbook
                                    </button>
                                </Link>
                            </div>
                            <NavBar />
                            <UserMenu info={userInfo} />
                        </nav>
                    </header>
                    <main>{children}</main>
                </>
            ) : (
                <>
                    <p>Loading...</p>
                    <p>You need to sign in first</p>
                </>
            )}
        </>
    );
}
