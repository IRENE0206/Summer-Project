"use client";
import React, {useContext, useState} from "react";
import QA from "@/components/QA";
import {useRouter} from "next/navigation";
import {Alert, Button, Card, Col, Container, Form, Row, Spinner, Toast, ToastContainer} from "react-bootstrap";
import {Line, QAInterface} from "@/interfaces/Interfaces";
import UserInfoContext from "@/utils/UserInfoContext";
import {fetchAPI} from "@/utils/fetchAPI";


export default function AddWorkbook() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [qaList, setQAList] = useState<QAInterface[]>([
        {
            id: 1, index: 1, number: "1",
            question: "",
            answer: [{line_index: 0, variable: "", rules: ""}]
        },
    ]);
    const [showToast, setShowToast] = useState(false);
    const [workbookName, setWorkbookName] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [releaseTime, setReleaseTime] = useState("");
    const [workbookId, setWorkbookId] = useState<number>();
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
        console.log("BEFORE UPDATE: " + question);
        setQAList(updatedQandaList);
        console.log("AFTER UPDATE: " + question);
        qaList.map(qa => (console.log("In qa List question: " + qa.question)));
    };

    const fetchData = async () => {
        console.log("Before fetching");
        setIsLoading(true);
        qaList.map(qa => (console.log("before fetch, question: " + qa.question)));

        const workbookData = {
            workbook_name: workbookName,
            release_date: `${releaseDate}T${releaseTime}:00`,
            exercises: qaList,
        };
        const api = "/api/workbooks/new";

        const response = await fetchAPI(api, {
            method: "POST",
            body: workbookData
        });
        console.log(workbookData);
        if (response.success) {
            console.log("Workbook added successfully");
            setShowToast(true);
            setWorkbookId((response.data as { workbook_id: number }).workbook_id);

        } else {
            console.log(workbookData);
            console.error(response.errorMessage || "An error occurred.");
        }
        setIsLoading(false);

    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await fetchData();
    };

    const userInfo = useContext(UserInfoContext);
    if (!userInfo) {
        return (
            <Alert variant={"danger"}>
                Failed to get user information.
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
        <Container fluid
            className={"d-flex flex-column align-items-center justify-content-center w-100 p-0 m-0 ms-md-5 ps-md-5"}
        >
            <ToastContainer position={"middle-center"}>
                <Toast
                    onClose={() => {
                        setShowToast(false);
                        router.push(`/workbooks/${workbookId}`);
                    }}
                    show={showToast}
                >
                    <Toast.Header>
                        <strong className={"mr-auto"}>Notification</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Workbook saved successfully!
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Card
                className={"d-flex flex-column justify-content-center align-items-center ms-md-5 px-3 rounded-5 shadow-lg"}>
                <Card.Body className={"d-flex flex-column justify-content-center align-items-center rounded-5 p-0 m-3"}>

                    <Form method={"post"} onSubmit={handleSubmit} className={"p-0 m-0"}>

                        <Card border={"primary"} className={"my-3 shadow rounded-5"}>
                            <Card.Body className={"d-grid"}>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.FloatingLabel
                                                label={"Workbook Name: "}
                                            >
                                                <Form.Control
                                                    className={"border-secondary-subtle shadow"}
                                                    type={"text"}
                                                    value={workbookName}
                                                    onChange={(e) => setWorkbookName(e.target.value)}
                                                />
                                            </Form.FloatingLabel>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className={"d-flex flex-row"}>

                                    <Col className={"mx-0 pe-0"}>
                                        <Form.Group>
                                            <Form.FloatingLabel
                                                label={"Release Date: "}
                                            >
                                                <Form.Control
                                                    className={"mx-0 border-secondary-subtle shadow"}
                                                    type={"date"}
                                                    value={releaseDate}
                                                    onChange={(e) => setReleaseDate(e.target.value)}
                                                />
                                            </Form.FloatingLabel>
                                        </Form.Group>
                                    </Col>

                                    <Col className={"mx-0 ps-0"}>
                                        <Form.Group>
                                            <Form.FloatingLabel
                                                label={"Release Time: "}
                                            >
                                                <Form.Control
                                                    className={"border-secondary-subtle shadow"}
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
                        <Row className={"d-flex flex-row"}>

                            <Col className={"text-start"}>
                                <Button
                                    variant={"outline-success"}
                                    type={"button"}
                                    onClick={handleAddQA}
                                    size={"lg"}
                                    className={"shadow rounded-5"}
                                >
                                    Add Q&A
                                </Button>
                            </Col>

                            <Col className={"text-end"}>
                                <Button
                                    variant={"outline-primary"}
                                    type={"submit"}
                                    size={"lg"}
                                    className={"shadow rounded-5"}
                                >
                                    {isLoading ? <Spinner animation={"border"} size={"sm"}/> : "Save All"}
                                </Button>
                            </Col>

                        </Row>

                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
