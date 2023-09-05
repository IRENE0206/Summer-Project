import {useEffect, useState} from "react";
import Answer from "./Answer";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {Line} from "@/interfaces/Interfaces";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {InlineMath} from "react-katex";

export default function QA({
    index,
    onDelete,
    isDeleteDisabled,
    externalOnChange,
}: {
    index: number;
    onDelete: () => void;
    isDeleteDisabled: boolean;
    externalOnChange: (data: {
        number: string,
        question: string,
        answer: Line[]
    }) => void;
}) {
    const [manuallyEdited, setManuallyEdited] = useState(false);
    const [number, setNumber] = useState<string>(index.toString());
    const [question, setQuestion] = useState<string>("");
    const [answer, setAnswer] = useState<Line[]>(
        [{line_index: 0, variable: "", rules: ""}]
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
            answer,
        });
    }, []);

    return (
        <Card border={"success"} className={"shadow-sm my-3"}>
            <Card.Header className={"d-flex flex-column align-items-start shadow-sm"}>
                <Form.Group className={"align-items-center shadow-sm"}>
                    <Form.FloatingLabel label={"Exercise Number:"}>
                        <Form.Control
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
            <Card.Body className={"d-flex flex-column shadow-sm"}>
                <Row className={"border-bottom border-secondary-subtle pb-3"}>
                    <Col>
                        <Form.Group className={"my-3 align-items-center shadow-sm"}>
                            <div className={"latex-preview"}>
                                <InlineMath math={question}/>
                            </div>
                            <Form.FloatingLabel label={"Question:"}>
                                <Form.Control
                                    plaintext
                                    className={"h-auto"}
                                    value={question}
                                    name={`question${number}`}
                                    onChange={(e) => setQuestion(e.target.value)}
                                />
                            </Form.FloatingLabel>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className={"pt-3"}>
                    <Col>
                        <Form.Group className={"my-3"}>
                            <Form.Label>
                                Answer:
                            </Form.Label>
                            <Answer lines={answer} onChange={setAnswer}/>
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
            <Card.Footer className={"text-end shadow-sm"}>
                <Button
                    type={"button"}
                    value={"Delete Exercise"}
                    variant={"outline-danger"}
                    className={"shadow-sm"}
                    onClick={onDelete}
                    disabled={isDeleteDisabled}
                >
                    Delete
                </Button>
            </Card.Footer>
        </Card>
    );
}
