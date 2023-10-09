"use client";
import {Card, Container, ListGroup} from "react-bootstrap";
import userInfoContext from "@/utils/UserInfoContext";
import {useContext} from "react";

export default function HomePage() {
    const userInfo = useContext(userInfoContext);

    return (
        <Container fluid className={"d-flex flex-column align-items-center m-3"}>
            <Card className={"rounded-5 shadow-lg w-75"}>
                <Card.Header className={"p-3 rounded-5 shadow"}>
                    <Card.Title className={"text-center"}>About This Website Application</Card.Title>
                </Card.Header>

                <Card.Body className={"m-3"}>
                    <Card.Text>
                        A useful tool to check the equivalence of two epsilon-free LL(1) grammars.
                    </Card.Text>
                    {/* Display information based on user role */}
                    <Card className={"mb-3"}>
                        <Card.Body>
                            {userInfo?.is_admin ? (
                                <>
                                    <Card.Title>Admin Users</Card.Title>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>Add/Delete workbooks</ListGroup.Item>
                                        <ListGroup.Item>Edit workbook release dates</ListGroup.Item>
                                        <ListGroup.Item>Add/Delete/Edit questions and answers of
                                            exercises</ListGroup.Item>
                                    </ListGroup>
                                    <Card.Text>To input math equations in questions, please use LaTeX.</Card.Text>
                                </>
                            ) : (
                                <>
                                    <Card.Title>Regular Users</Card.Title>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>View released workbooks</ListGroup.Item>
                                        <ListGroup.Item>View questions of exercises in the
                                            workbooks</ListGroup.Item>
                                        <ListGroup.Item>Edit your own answers and submit for
                                            feedback</ListGroup.Item>
                                    </ListGroup>
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Use ListGroup for Grammar Inputs */}
                    <Card className={"mb-3"}>
                        <Card.Body>
                            <Card.Title>Grammar Inputs</Card.Title>
                            <ListGroup variant={"flush"}>
                                <ListGroup.Item>Input plain text in the answer sections.</ListGroup.Item>
                                <ListGroup.Item>Use a single capital letter for non-terminals.</ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Card>
        </Container>
    );
}
