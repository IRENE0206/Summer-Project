import { FormEvent, useState } from "react";
import GrammarInput from "./GrammarInput";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { InputGroup } from "react-bootstrap";

export default function QandA({ index }: { index: string }) {
    const [number, setNumber] = useState(index);
    const [question, setQuestion] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <Form method="post" onSubmit={handleSubmit}>
                <Form.Group as={Row}>
                    <Form.Label>
                        Exercise Number:
                        <Form.Control
                            value={number}
                            name={`index${number}`}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </Form.Label>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label>
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
                    <Form.Label>
                        Correct Answer:
                        <GrammarInput />
                    </Form.Label>
                </Form.Group>
            </Form>
        </>
    );
}
