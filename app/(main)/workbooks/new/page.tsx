"use client";
import React, {useContext, useState} from "react";
import QA from "@/components/QA";
import {useRouter} from "next/navigation";
import {Alert, Container, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Line, QAInterface} from "@/interfaces/Interfaces";
import {UserInfoContext} from "@/app/(main)/layout";


export default function AddWorkbook() {
    const router = useRouter();
    const [qaList, setQAList] = useState<QAInterface[]>([
        {
            id: 1, index: 1, number: "1",
            question: "",
            answer: [{line_index: 0, variable: "", rules: ""}]
        },
    ]);

    const [workbookName, setWorkbookName] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [releaseTime, setReleaseTime] = useState("");
    const handleAddQA = () => {
        const newId = qaList[qaList.length - 1].id + 1;
        const newExerciseNum = qaList.length + 1;
        setQAList([
            ...qaList,
            {
                id: newId,
                index: newExerciseNum,
                number: newExerciseNum.toString(),
                question: "",
                answer: [{line_index: 0, variable: "", rules: ""}],
            },
        ]);
    };
    const handleDeleteQA = (id: number) => {
        if (qaList.length === 1) {
            return;
        }

        setQAList(
            qaList
                .filter((qanda) => qanda.id !== id)
                .map((qanda, idx) => ({
                    ...qanda,
                    index: idx + 1,
                }))
        );
    };

    const handleQAChange = (
        id: number,
        index: number,
        number: string,
        question: string,
        answer: Line[]
    ) => {
        const updatedQandaList = qaList.map((qanda) =>
            qanda.id === id ? {id, index, number, question, answer} : qanda
        );
        setQAList(updatedQandaList);
    };

    const fetchData = async () => {
        const workbookData = {
            workbook_name: workbookName,
            release_date: `${releaseDate}T${releaseTime}:00`,
            exercises: qaList,
        };
        const api = "/api/workbooks/new";
        const res = await fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(workbookData),
        });

        const data = await res.json();
        if (!res.ok) {
            const errorMsg = data.message || "An error occurred.";
            return (
                <Alert variant={"danger"}>{errorMsg}</Alert>
            );
        }

        console.log("Workbook added successfully");
        router.push(`/workbook/${data.workbook_id}`);

    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        fetchData().catch(e => console.error(e));
    };

    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Alert variant={"danger"}>
                You need to sign in first
            </Alert>
        );
    }
    if (!userInfo.is_admin) {
        return (
            <Alert variant={"danger"}>
                Only admin user can access the page
            </Alert>
        );
    }
    return (
        <Container fluid className={"d-flex flex-column p-0 mx-3"}>
            <Row>
                <Col>
                    <Card className={"rounded-5 shadow-lg"}>
                        <Card.Body>
                            <Form method={"post"} onSubmit={handleSubmit}>
                                <Card border={"primary"} className={"my-3 shadow rounded-5"}>
                                    <Card.Body>
                                        <Row>
                                            <Col>
                                                <Form.Group className={"shadow-sm"}>
                                                    <Form.FloatingLabel
                                                        label={"Workbook Name: "}
                                                    >
                                                        <Form.Control
                                                            type={"text"}
                                                            value={workbookName}
                                                            onChange={(e) => setWorkbookName(e.target.value)}
                                                        />
                                                    </Form.FloatingLabel>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col className={"pe-0"}>
                                                <Form.Group className={"shadow-sm"}>
                                                    <Form.FloatingLabel
                                                        label={"Release Date: "}
                                                    >
                                                        <Form.Control
                                                            type={"date"}
                                                            value={releaseDate}
                                                            onChange={(e) => setReleaseDate(e.target.value)}
                                                        />
                                                    </Form.FloatingLabel>
                                                </Form.Group>
                                            </Col>
                                            <Col className={"ps-0"}>
                                                <Form.Group className={"shadow-sm"}>
                                                    <Form.FloatingLabel
                                                        label={"Release Time: "}
                                                    >
                                                        <Form.Control
                                                            type={"time"}
                                                            value={releaseTime}
                                                            onChange={(e) => setReleaseTime(e.target.value)}
                                                        />
                                                    </Form.FloatingLabel>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                {qaList.map((qa) => (
                                    <QA
                                        key={qa.id}
                                        index={qa.index}
                                        externalOnChange={(data) =>
                                            handleQAChange(
                                                qa.id,
                                                qa.index,
                                                data.number,
                                                data.question,
                                                data.answerLines
                                            )
                                        }
                                        onDelete={() => handleDeleteQA(qa.id)}
                                        isDeleteDisabled={qaList.length === 1}
                                    />

                                ))}
                                <Row className={"my-3 align-items-center"}>
                                    <Col className={"text-start"}>
                                        <Button
                                            variant={"outline-success"}
                                            type="button"
                                            onClick={handleAddQA}
                                            size={"lg"}
                                            className={"shadow-sm rounded-5"}
                                        >
                                            Add Q&A
                                        </Button>
                                    </Col>
                                    <Col className={"text-end"}>
                                        <Button
                                            variant={"outline-primary"}
                                            type={"submit"}
                                            size={"lg"}
                                            className={"shadow-sm rounded-5"}
                                        >
                                            Save All
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
