"use client";
import {UserRole} from "@/interfaces/Interfaces";
import {Alert, Button, Container, Offcanvas} from "react-bootstrap";
import WorkbooksNavBar from "@/components/WorkbooksNavBar";
import UserMenu from "@/components/UserMenu";
import React, {useContext} from "react";
import UserInfoContext from "@/utils/UserInfoContext";
import OffCanvasContext from "@/utils/OffCanvasContext";
import Link from "next/link";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function SideBar() {
    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Container>
                <Alert variant="danger" className={"text-center"}>
                    Failed to fetch user information. Please try again.
                </Alert>
            </Container>
        );
    }
    const user_role = userInfo.user_role;
    const {showOffCanvas, handleShowOffCanvas} = useContext(OffCanvasContext);
    return (
        <Offcanvas
            backdrop={"static"}
            responsive={"md"}
            placement={"start"}
            show={showOffCanvas}
            onHide={handleShowOffCanvas}
            className={"h-100 bg-black shadow-lg pt-3"}
        >
            <Offcanvas.Header closeButton closeVariant={"white"} className={"bg-dark mb-3"}>
                <Offcanvas.Title className={"text-white"}>WEBSITE NAME</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body
                className={"d-flex flex-column p-3"}>
                <Container fluid className={"h-100 flex-column p-0 m-0"}>
                    {user_role === UserRole.Admin ? (
                        <Row className={"position-relative top border-bottom border-secondary pb-3"}>
                            <Col>
                                <Link href="/workbooks/new" className={"text-center"}>
                                    <Button variant="outline-primary" className={"w-100 shadow-sm"} size={"lg"}>
                                        + New workbook
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    ) : null}
                    <Row className={"my-3 flex-grow-1"}>
                        <Col>
                            <WorkbooksNavBar/>
                        </Col>
                    </Row>
                    <Row className={"pt-3 border-top border-secondary"}>
                        <Col>
                            <UserMenu/>
                        </Col>
                    </Row>
                </Container>
            </Offcanvas.Body>
        </Offcanvas>

    );
}