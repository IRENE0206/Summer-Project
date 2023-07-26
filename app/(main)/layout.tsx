"use client";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NavBar from "@/components/NavBar";
import UserMenu from "@/components/UserMenu";
import UserAuth from "@/utils/UserAuth";
import UserInfo from "@/utils/UserInfo";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import { Offcanvas } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Link from "next/link";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const passAuth = UserAuth();
    const userInfo = UserInfo();
    const [show, setShow] = useState(true);
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setShow(true);
    };
    return (
        <>
            {passAuth ? (
                <div>
                    <header>
                        <Navbar expand={false} sticky="top">
                            <Container fluid>
                                <Navbar.Toggle
                                    onClick={handleShow}
                                ></Navbar.Toggle>
                                <Navbar.Brand>WEBSITE NAME</Navbar.Brand>
                            </Container>
                        </Navbar>
                    </header>
                    <div className="container-xxl bd-gutter mt-3 my-md-4 bd-layout">
                        <aside className="bd-sidebar">
                            <Offcanvas
                                backdropClassName="sidebar"
                                show={show}
                                onHide={handleClose}
                                backdrop={false}
                                scroll={true}
                            >
                                <Container fluid>
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>
                                            WORKBOOKS
                                        </Offcanvas.Title>
                                    </Offcanvas.Header>

                                    <Offcanvas.Body>
                                        <div>
                                            <Link href="/workbook/new">
                                                <button type="button">
                                                    + New workbook
                                                </button>
                                            </Link>
                                        </div>
                                        <div>
                                            <NavBar />
                                        </div>

                                        <div>
                                            <UserMenu info={userInfo} />
                                        </div>
                                    </Offcanvas.Body>
                                </Container>
                            </Offcanvas>
                        </aside>
                        <main className="bd-main">{children}</main>
                    </div>
                </div>
            ) : (
                <>
                    <p>Loading...</p>
                    <p>You need to sign in first</p>
                </>
            )}
        </>
    );
}
