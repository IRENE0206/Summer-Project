"use client";
import React, {FormEvent, useContext, useEffect, useState} from "react";
import {Alert, Button, Card, Col, Container, Form, Row, Spinner, Toast, ToastContainer} from "react-bootstrap";
import {ExerciseDataInterface, Line, UserInfoInterface, WorkbookDataInterface} from "@/interfaces/Interfaces";
import UserInfoContext from "@/utils/UserInfoContext";
import {fetchAPI} from "@/utils/fetchAPI";
import {useParams} from "next/navigation";
import QA from "@/components/QA";

export default function EditWorkbook() {
    const workbook_id = useParams()["workbook_id"];
    const userInfo = useContext(UserInfoContext) as UserInfoInterface;
    const api = `/api/workbooks/${workbook_id}`;

    const [isLoading, setIsLoading] = useState(false);
    const [workbookName, setWorkbookName] = useState<string>("");
    const [releaseDate, setReleaseDate] = useState("");
    const [releaseTime, setReleaseTime] = useState("");

    const [qaList, setQAList] = useState<ExerciseDataInterface[]>([]);
    const [showToast, setShowToast] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                console.log("before fetch");
                const response = await fetchAPI(api, {method: "GET"});
                console.log("after fetch");
                if (response.success) {
                    setWorkbookName((response.data as WorkbookDataInterface).workbook_name);
                    // Convert to JavaScript Date object first
                    const releaseDateTime = new Date((response.data as WorkbookDataInterface).release_date);

                    // Convert to string in the format YYYY-MM-DDTHH:MM:SS
                    const formattedReleaseDateTime = releaseDateTime.toISOString().split(".")[0].split("T");
                    const formattedReleaseDate = formattedReleaseDateTime[0];
                    const formattedReleaseTime = formattedReleaseDateTime[1];
                    setReleaseDate(formattedReleaseDate);
                    setReleaseTime(formattedReleaseTime);
                    setQAList((response.data as WorkbookDataInterface).exercises);
                } else {
                    console.error(response.errorMessage || "An error occurred.");
                }
            } catch (error) {
                console.error("An error occurred while fetching data.", error);
            }
            setIsLoading(false);
        };
        fetchInitialData().catch(e => console.log(e));
    }, []);

    // Update data to the backend
    const updateData = async () => {
        const updatedWorkbookData: WorkbookDataInterface = {
            workbook_name: workbookName,
            release_date: releaseDate,
            exercises: qaList,
        };

        const updateApi = `/api/workbooks/update/${workbook_id}`;
        setIsLoading(true);
        try {
            const response = await fetchAPI(updateApi, {
                method: "PUT",
                body: updatedWorkbookData,
            });
            if (response.success) {
                setShowToast(true);
            } else {
                console.error(response.errorMessage || "An error occurred.");
            }
        } catch (error) {
            console.error("An error occurred while updating data.", error);
        }
        setIsLoading(false);
    };

    // Form submission handler
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await updateData();
    };

    const handleAddQA = () => {
        const newId = qaList[qaList.length - 1].exercise_id + 1;

        const newExerciseNum = qaList.length + 1;
        setQAList([
            ...qaList,
            {
                exercise_id: newId,
                exercise_index: newExerciseNum,
                exercise_number: newExerciseNum.toString(),
                exercise_content: "",
                lines: [{line_index: 0, variable: "", rules: ""}],
            },
        ]);
    };
    const handleDeleteQA = (id: number) => {
        if (qaList.length === 1) {
            return;
        }

        setQAList(
            qaList
                .filter((qanda) => qanda.exercise_id !== id)
                .map((qanda, idx) => ({
                    ...qanda,
                    exercise_index: idx + 1,
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
            qanda.exercise_id === id ? {
                exercise_id: id, exercise_index: index,
                exercise_number: number,
                exercise_content: question,
                lines: answer
            } : qanda
        );
        console.log("BEFORE UPDATE: " + question);
        setQAList(updatedQandaList);
        console.log("AFTER UPDATE: " + question);
        qaList.map(qa => (console.log("In qa List question: " + qa.exercise_content)));
    };

    // Conditional rendering based on user information
    if (!userInfo) return <Alert variant={"danger"}>Failed to get user information.</Alert>;
    if (!userInfo.is_admin) return <Alert variant={"danger"}>Only admin users can access this page.</Alert>;

    return (
        <Container fluid
            className={"d-flex flex-column align-items-center justify-content-center w-100 p-0 m-0 ms-md-5 ps-md-5"}
        >
            <ToastContainer position={"middle-center"}>
                <Toast
                    onClose={() => {
                        setShowToast(false);
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
                                key={qa.exercise_id}
                                index={qa.exercise_index}
                                qa={qa}
                                externalOnChange={(data) =>
                                    handleQAChange(
                                        qa.exercise_id,
                                        qa.exercise_index,
                                        data.number,
                                        data.question,
                                        data.answerLines
                                    )
                                }
                                onDelete={() => handleDeleteQA(qa.exercise_id)}
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

