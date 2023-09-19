"use client";
import {Accordion, Card, Container} from "react-bootstrap";
import userInfoContext from "@/utils/UserInfoContext";
import {useContext} from "react";

export default function HomePage() {
    const userInfo = useContext(userInfoContext);
    return (
        <Container fluid className={"d-flex flex-column"}>
            <Card className={"rounded-5 m-3 shadow-lg"}>
                <Card.Header className={"p-3 rounded-5 shadow"}>
                    <Card.Title className={"m-3"}>About This Website Application</Card.Title>
                </Card.Header>

                <Card.Body className={"m-3"}>
                    <Card.Subtitle>Usage</Card.Subtitle>
                    {userInfo?.is_admin && (
                        <Card.Text>
                            To input math equations in question, please write it in LaTex.
                        </Card.Text>
                    )}
                    <Accordion defaultActiveKey={"0"} className={"shadow"} alwaysOpen>
                        <Accordion.Item eventKey={"0"}>
                            <Accordion.Header>
                                Grammar Inputs
                            </Accordion.Header>
                            <Accordion.Body>
                                <p>
                                    Input plain text in the answer sections.
                                </p>
                                <p>
                                    Use one single capital letter for non-terminals.
                                </p>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Card.Body>
            </Card>
        </Container>
    );
}
