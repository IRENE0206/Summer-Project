import useAuth from "@/utils/useAuth";
import React from "react";
import {Container} from "react-bootstrap";
import useUserInfo from "@/utils/useUserInfo";
import SideBar from "@/components/SideBar";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    const passAuth = useAuth();

    const {userInfo, error} = useUserInfo();

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
                <SideBar userInfo={userInfo}/>
                <main className="bd-main">
                    {children}
                </main>
            </div>
        </Container>
    );
}
