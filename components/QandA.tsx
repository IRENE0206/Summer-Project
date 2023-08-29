import {useCallback, useEffect, useState} from "react";
import GrammarInput from "./GrammarInput";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import {Line} from "@/interfaces/Interfaces";
import Card from "react-bootstrap/Card";

export default function QandA({
    index,
    onDelete,
    isDeleteDisabled,
    onChange: externalOnChange,
}: {
    index: number;
    onDelete: () => void;
    isDeleteDisabled: boolean;
    onChange: (data: {
        number: string,
        question: string,
        answer: Line[]
    }) => void;
}) {
    const [manuallyEdited, setManuallyEdited] = useState(false);
    const [number, setNumber] = useState<string>(index.toString());
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<Line[]>([
        {line_index: 0, variable: "", rules: ""},
    ]);
    const memoizedOnChange = useCallback(externalOnChange, []);
    useEffect(() => {
        if (!manuallyEdited) {
            setNumber(index.toString());
        }
    }, [index, manuallyEdited]);

    useEffect(() => {
        memoizedOnChange({
            number,
            question,
            answer,
        });
    }, [number, question, answer, memoizedOnChange]);

    return (
        <Card border="success">
            <Card.Header>
                <Form.Group as={Row}>
                    <Form.Label column md={2}>
                        Exercise Number:
                    </Form.Label>
                    <Col md={10}>
                        <Form.Control
                            value={number}
                            name={`index${number}`}
                            onChange={(e) => {
                                setNumber(e.target.value);
                                setManuallyEdited(true);
                            }}
                        />
                    </Col>
                </Form.Group>
            </Card.Header>

            <Card.Body>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column md={2}>
                        Content:
                    </Form.Label>
                    <Col md={10}>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={question}
                            name={`question${number}`}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column md={2}>
                        Correct Answer:
                    </Form.Label>
                    <Col md={10}>
                        <GrammarInput value={answer} onChange={setAnswer}/>
                    </Col>
                </Form.Group>
            </Card.Body>

            <Card.Footer>
                <Form.Group as={Row}>
                    <Col className="text-end">
                        <Button
                            variant="outline-danger"
                            type="button"
                            value="Delete Exercise"
                            onClick={onDelete}
                            disabled={isDeleteDisabled}
                        >
                            Delete
                        </Button>
                    </Col>
                </Form.Group>
            </Card.Footer>

        </Card>
    );
}
