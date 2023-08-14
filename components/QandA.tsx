import { FormEvent, useState } from "react";
import GrammarInput from "./GrammarInput";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { InputGroup } from "react-bootstrap";

export default function QandA({
    defaultNum,
    onDelete,
    isDeleteDisabled,
}: {
    defaultNum: string;
    onDelete: () => void;
    isDeleteDisabled: boolean;
}) {
    const [manuallyEdited, setManuallyEdited] = useState(false);
    const [manualNum, setManualNum] = useState("");
    const [number, setNumber] = useState(
        manuallyEdited ? manualNum : defaultNum
    );
    const [question, setQuestion] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <Form method="post" onSubmit={handleSubmit}>
            <Form.Group as={Row}>
                <Form.Label column>
                    Exercise Number:
                    <Form.Control
                        value={number}
                        name={`index${number}`}
                        onChange={(e) => {
                            setNumber(e.target.value);
                            setManuallyEdited(true);
                            setManualNum(e.target.value);
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
                    <GrammarInput />
                </Form.Label>
            </Form.Group>

            <Form.Group as={Row}>
                <Col>
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleteDisabled}
                    >
                        Delete
                    </button>
                </Col>
            </Form.Group>
        </Form>
    );
}
