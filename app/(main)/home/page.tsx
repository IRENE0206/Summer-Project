"use client";
import {Accordion, Card, Container} from "react-bootstrap";

export default function HomePage() {
    return (
        <Container fluid className={"d-flex flex-column"}>
            <Card className={"rounded-5 m-3 shadow-lg"}>
                <Card.Header className={"p-3 rounded-5 shadow"}>
                    <Card.Title className={"m-3"}>About This Website{/*TODO*/}</Card.Title>
                </Card.Header>

                <Card.Body className={"m-3"}>
                    <Card.Subtitle>MESSAGE{/*TODO*/}</Card.Subtitle>
                    <Card.Text>
                        MESSAGE{/*TODO*/}
                    </Card.Text>

                    <Accordion defaultActiveKey={"0"} className={"shadow"} alwaysOpen>
                        <Accordion.Item eventKey={"0"}>
                            <Accordion.Header>
                                MESSAGE{/*TODO*/}
                            </Accordion.Header>
                            <Accordion.Body>
                                MESSAGE{/*TODO*/}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Card.Body>
            </Card>
        </Container>
    );
}

