import React, {useEffect, useState} from "react";
import Answer from "./Answer";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {ExerciseDataInterface, Line} from "@/interfaces/Interfaces";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Latex from "react-latex-next";
import {Container} from "react-bootstrap";

export default function QA({
    index,
    onDelete,
    isDeleteDisabled,
    externalOnChange,
    qa,
}: {
    index: number;
    onDelete: () => void;
    isDeleteDisabled: boolean;
    externalOnChange: (data: {
        number: string,
        question: string,
        answerLines: Line[]
    }) => void;
    qa?: ExerciseDataInterface;
}) {
    const [manuallyEdited, setManuallyEdited] = useState(false);
    const [number, setNumber] = useState<string>(qa?.exercise_number || index.toString());
    const [question, setQuestion] = useState<string>(qa?.exercise_content || "");
    const [answerLines, setAnswerLines] = useState<Line[]>(
        qa ? (qa.lines)
            : ([{line_index: 0, variable: "", rules: ""}])
    );

    useEffect(() => {
        if (!manuallyEdited) {
            setNumber(index.toString());
        }
    }, [index, manuallyEdited]);

    useEffect(() => {
        externalOnChange({
            number,
            question,
            answerLines,
        });
    }, [number, question, answerLines]);


    return (
        <Card border={"success"} className={"shadow my-3 rounded-5"}>

            <Card.Header className={"d-flex align-items-start rounded-5 shadow-sm"}>
                <Form.Group>
                    <Form.FloatingLabel label={"Exercise Number:"}>
                        <Form.Control
                            className={"d-flex border-secondary-subtle shadow"}
                            value={number}
                            name={`index${number}`}
                            onChange={(e) => {
                                setNumber(e.target.value);
                                setManuallyEdited(true);
                            }}
                        />
                    </Form.FloatingLabel>
                </Form.Group>
            </Card.Header>

            <Card.Body className={"d-grid"}>
                <Row>
                    <Col>
                        <Container fluid className={"d-grid px-0 mx-0 shadow rounded"}>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.FloatingLabel label={"Question Preview:"}>
                                            <Form.Control as={Container}
                                                className={"rounded-bottom-0 h-auto bg-secondary-subtle"}>
                                                <Latex>{`${question}`}</Latex>
                                            </Form.Control>
                                        </Form.FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.FloatingLabel label={"Question Input:"}>
                                            <Form.Control
                                                as={"textarea"}
                                                className={"h-auto border-secondary-subtle shadow"}
                                                value={question}
                                                name={`question${number}`}
                                                onChange={(e) => setQuestion(e.target.value)}
                                            />
                                        </Form.FloatingLabel>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>

                <Row className={"pt-3"}>
                    <Col>
                        <Answer answerLines={answerLines} onChange={setAnswerLines}/>
                    </Col>
                </Row>
            </Card.Body>

            <Card.Footer className={"text-end rounded-5 shadow-sm"}>
                <Button
                    type={"button"}
                    value={"Delete Exercise"}
                    variant={"outline-danger"}
                    className={"shadow rounded-5"}
                    onClick={onDelete}
                    disabled={isDeleteDisabled}
                >
                    Delete Exercise
                </Button>
            </Card.Footer>
        </Card>
    );
}
