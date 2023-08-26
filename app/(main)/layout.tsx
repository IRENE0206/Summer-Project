"use client";
import Container from "react-bootstrap/Container";

import WorkbooksNavBar from "@/components/WorkbooksNavBar";
import UserMenu from "@/components/UserMenu";
import useAuth from "@/utils/useAuth";
import UserInfo from "@/utils/UserInfo";
import { useState, useEffect } from "react";
import { Offcanvas, Row } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Link from "next/link";

export default function MainLayout({children}: {
    children: React.ReactNode;
}) {
    console.log("app/(main)/layout.tsx")
    const passAuth = useAuth();
    console.log("Pass authentication: " + passAuth)

    const userInfo = UserInfo();
    const [show, setShow] = useState(true);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setShow(true);
    };
    return (
        <>{
            passAuth ? (
                    <div>
                        <header>
                            <Navbar expand="sm" sticky="top">
                                <Container fluid>
                                    <Navbar.Brand>WEBSITE NAME</Navbar.Brand>
                                    <Navbar.Toggle
                                        onClick={show ? handleClose : handleShow}
                                    ></Navbar.Toggle>
                                </Container>
                            </Navbar>
                        </header>
                        <div className="container-xxl bd-gutter bd-layout">
                            <aside>
                                <Offcanvas
                                    show={show}
                                    onHide={handleClose}
                                    bsPrefix="offcanvas"
                                    backdrop={false}
                                    keyboard={false}
                                    scroll={true}
                                    placement="start"
                                    responsive="sm"
                                >
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>WORKBOOKS</Offcanvas.Title>
                                    </Offcanvas.Header>

                                    <Offcanvas.Body>
                                        <Container fluid>
                                            <Row>
                                                <Link href="/workbook/new">
                                                    <button type="button">
                                                        + New workbook
                                                    </button>
                                                </Link>
                                            </Row>
                                            <Row>
                                                <WorkbooksNavBar/>
                                            </Row>

                                            <Row>
                                                <UserMenu info={userInfo}/>
                                            </Row>
                                        </Container>
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </aside>

                            <main className="bd-main">{children}</main>
                        </div>
                    </div>)
                : (
                    <p>You need to log in first</p>)
        }</>

    );
}
