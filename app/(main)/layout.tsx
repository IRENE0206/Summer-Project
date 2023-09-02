"use client";
import useAuth from "@/utils/useAuth";
import React from "react";
import {Container} from "react-bootstrap";
import useUserInfo from "@/utils/useUserInfo";
import SideBar from "@/components/SideBar";
import UserInfoContext from "@/utils/UserInfoContext";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    const passAuth = useAuth();

    const {userInfo, error} = useUserInfo();
    console.log(userInfo);
    if (!passAuth) {
        return (<Container><p>You need to log in first</p></Container>);
    } else if (!userInfo) {
        return (<Container><p>Failed to fetch user information</p></Container>);
    } else if (error) {
        return (<Container><p>Error: {error.message}</p></Container>);
    }
    return (
        <Container>
            <div className="container-xxl bd-gutter bd-layout">
                <UserInfoContext.Provider value={userInfo}>
                    <SideBar/>
                    <main className="bd-main">
                        {children}
                    </main>
                </UserInfoContext.Provider>
            </div>
        </Container>
    );
}
