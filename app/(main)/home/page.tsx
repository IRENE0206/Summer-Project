"use client";
import {Accordion, Card, Container} from "react-bootstrap";

export default function HomePage() {
    return (
        <Container fluid className={"d-flex flex-column"}>
            <Card className={"rounded-5 m-3 shadow-lg"}>
                <Card.Header className={"p-3 rounded-5 shadow"}>
                    <Card.Title className={"m-3"}>About This Website{/*TODO: Replace with actual title*/}</Card.Title>
                </Card.Header>

                <Card.Body className={"m-3"}>
                    <Card.Subtitle>MESSAGE{/*TODO: Replace with actual subtitle*/}</Card.Subtitle>
                    <Card.Text>
                        MESSAGE{/*TODO: Replace with actual text*/}
                    </Card.Text>

                    <Accordion defaultActiveKey={"0"} className={"shadow"} alwaysOpen>
                        <Accordion.Item eventKey={"0"}>
                            <Accordion.Header>
                                MESSAGE{/*TODO: Replace with actual header*/}
                            </Accordion.Header>
                            <Accordion.Body>
                                MESSAGE{/*TODO: Replace with actual body*/}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Card.Body>
            </Card>
        </Container>
    );
}
