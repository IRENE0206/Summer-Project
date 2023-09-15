"use client";
import React, {useContext, useEffect, useState} from "react";
import {Alert, Button, Card, Col, Container, Form, Row, Spinner, Toast, ToastContainer} from "react-bootstrap";
import {ExerciseDataInterface, Line, WorkbookDataInterface} from "@/interfaces/Interfaces";
import UserInfoContext from "@/utils/UserInfoContext";
import {fetchAPI} from "@/utils/fetchAPI";
import {useParams, useRouter} from "next/navigation";
import Exercise from "@/components/Exercise";

export default function EditWorkbook() {
    const [workbookId, setWorkbookId] = useState(useParams()["workbook_id"]);
    const isNewWorkbook = (workbookId === "new");
    const userInfo = useContext(UserInfoContext);
    const api = `/api/workbooks/${workbookId}`;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [workbookName, setWorkbookName] = useState<string>("");
    const [releaseDate, setReleaseDate] = useState("");
    const [releaseTime, setReleaseTime] = useState("");
    const router = useRouter();

    const [exercises, setExercises] = useState<ExerciseDataInterface[]>([
        {
            exercise_id: 1, exercise_index: 1, exercise_number: "1",
            exercise_content: "",
            lines: [{line_index: 0, variable: "", rules: ""}]
        },
    ]);
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
                    setExercises((response.data as WorkbookDataInterface).exercises);
                } else {
                    console.error(response.errorMessage || "An error occurred.");
                }
            } catch (error) {
                console.error("An error occurred while fetching data.", error);
            }
            setIsLoading(false);
        };
        if (isNewWorkbook) {
            return;
        }
        fetchInitialData().catch(e => console.log(e));
    }, []);


    // Update data to the backend
    const updateData = async () => {
        const updatedWorkbookData: WorkbookDataInterface = {
            workbook_name: workbookName,
            release_date: `${releaseDate}T${releaseTime}:00`,
            exercises: exercises,
        };

        const updateApi = (isNewWorkbook ? "/api/workbooks/new" : `/api/workbooks/update/${workbookId}`);
        setIsLoading(true);
        try {
            const response = await fetchAPI(updateApi, {
                method: "POST",
                body: updatedWorkbookData,
            });
            if (response.success) {
                setShowToast(true);
                if (isNewWorkbook) {
                    setWorkbookId(((response.data as { workbook_id: number }).workbook_id).toString());
                }
            } else {
                console.log("hey, something went wrong");
                console.error(response.errorMessage || "An error occurred.");
            }
        } catch (error) {
            console.error("An error occurred while updating data.", error);
        }
        setIsLoading(false);
    };

    // Form submission handler
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await updateData();
    };

    const handleAddQA = () => {
        const newId = exercises[exercises.length - 1].exercise_id + 1;

        const newExerciseNum = exercises.length + 1;
        setExercises([
            ...exercises,
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
        if (exercises.length === 1) {
            return;
        }

        setExercises(
            exercises
                .filter((exercise) => exercise.exercise_id !== id)
                .map((exercise, idx) => ({
                    ...exercise,
                    exercise_index: idx + 1,
                }))
        );
    };

    const handleQAChange = (
        exercise_id: number,
        exercise_index: number,
        exercise_number: string,
        exercise_content: string,
        lines: Line[],
    ) => {
        const updatedExercises = exercises.map((exercise) =>
            exercise.exercise_id === exercise_id ? {
                exercise_id: exercise_id, exercise_index: exercise_index,
                exercise_number: exercise_number,
                exercise_content: exercise_content,
                lines: lines
            } : exercise
        );
        setExercises(updatedExercises);
    };

    // Conditional rendering based on user information
    if (!userInfo) {
        return (
            <Alert variant={"danger"}>
                Failed to get user information.
            </Alert>
        );
    }
    if (isNewWorkbook && !userInfo.is_admin) {
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
                        isNewWorkbook && router.push(`/workbooks/${workbookId}`);
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

                        {exercises.map((exercise) => (
                            <Exercise
                                key={exercise.exercise_id}
                                index={exercise.exercise_index}
                                qa={exercise}
                                externalOnChange={(data) =>
                                    handleQAChange(
                                        exercise.exercise_id,
                                        exercise.exercise_index,
                                        data.number,
                                        data.question,
                                        data.answerLines
                                    )
                                }
                                onDelete={() => handleDeleteQA(exercise.exercise_id)}
                                isDeleteDisabled={exercises.length === 1}
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

