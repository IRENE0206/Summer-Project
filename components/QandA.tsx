import { FormEvent, useEffect, useState } from "react";
import GrammarInput from "./GrammarInput";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { Line } from "@/interfaces/Interfaces";

export default function QandA({
    index,
    onDelete,
    isDeleteDisabled,
    onChange,
}: {
    index: number;
    onDelete: () => void;
    isDeleteDisabled: boolean;
    onChange: (data: any) => void;
}) {
    const [manuallyEdited, setManuallyEdited] = useState(false);
    const [number, setNumber] = useState<string>(index.toString());
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<Line[]>([
        { line_index: 0, variable: "", rules: "" },
    ]);
    useEffect(() => {
        if (!manuallyEdited) {
            setNumber(index.toString());
        }
    }, [index, manuallyEdited]);

    useEffect(() => {
        onChange({
            number,
            question,
            answer,
        });
    }, [number, question, answer, onChange]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <Form.Group as={Row}>
                <Form.Label column>
                    Exercise Number:
                    <Form.Control
                        value={number}
                        name={`index${number}`}
                        onChange={(e) => {
                            setNumber(e.target.value);
                            setManuallyEdited(true);
                        }}
                    />
                </Form.Label>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column>
                    Content:
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={question}
                        name={`question${number}`}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </Form.Label>
            </Form.Group>

            <Form.Group as={Row}>
                <Form.Label column>
                    Correct Answer:
                    <GrammarInput value={answer} onChange={setAnswer} />
                </Form.Label>
            </Form.Group>

            <Form.Group as={Row}>
                <Col>
                    <button
                        type="button"
                        value="Delete Exercise"
                        onClick={onDelete}
                        disabled={isDeleteDisabled}
                    >
                        Delete
                    </button>
                </Col>
            </Form.Group>
        </>
    );
}
