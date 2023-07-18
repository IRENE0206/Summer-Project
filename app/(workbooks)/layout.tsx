"use client";
import { useAuth } from "@/utils/useAuth";
import NavBar from "@/components/NavBar";
import User from "@/utils/user";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useAuth();
    const userInfo = User();
    return (
        <>
            <header>
                <nav>
                    <div>
                        <h1>WEBSITE NAME</h1>
                    </div>
                    <div>
                        <button type="button">
                            <Link href="/workbook/edit">+ New workbook</Link>
                        </button>
                    </div>
                    <NavBar />
                    <UserMenu info={userInfo} />
                </nav>
            </header>
            <main>{children}</main>
        </>
    );
}
