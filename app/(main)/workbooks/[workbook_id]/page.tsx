"use client";
import React, {useContext, useEffect, useState} from "react";
import {Alert, Button, Card, Col, Container, Form, Row, Spinner, Toast, ToastContainer} from "react-bootstrap";
import {ExerciseDataInterface, Line, WorkbookDataInterface} from "@/interfaces/Interfaces";
import UserInfoContext from "@/utils/UserInfoContext";
import {fetchAPI} from "@/utils/fetchAPI";
import {useParams, useRouter} from "next/navigation";
import Exercise from "@/components/Exercise";

export default function EditWorkbook() {
    const router = useRouter();
    const userInfo = useContext(UserInfoContext);
    const [workbookId, setWorkbookId] = useState(useParams()["workbook_id"]);
    const [feedbacks, setFeedbacks] = useState<{ [key: string]: string } | null>(null);
    const [workbookName, setWorkbookName] = useState<string>("");
    const [releaseDate, setReleaseDate] = useState("");
    const [releaseTime, setReleaseTime] = useState("");
    const [exercises, setExercises] = useState<ExerciseDataInterface[]>([
        {
            exercise_id: 1, exercise_index: 1, exercise_number: "1",
            exercise_content: "",
            lines: [{line_index: 0, variable: "", rules: ""}]
        },
    ]);
    const isNewWorkbook = (workbookId === "new");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    const [showExitModal, setShowExitModal] = useState(false);

    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const handleExit = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "Note: Save all your changes before exiting";
            setShowExitModal(true);
        };
        window.addEventListener("beforeunload", handleExit);

        return () => {
            window.removeEventListener("beforeunload", handleExit);
        };
    }, [isSaving]);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const workbookAPI = `/api/workbooks/${workbookId}`;
                const response = await fetchAPI(workbookAPI, {method: "GET"});
                if (response.success) {
                    setWorkbookName((response.data as WorkbookDataInterface).workbook_name);
                    // Convert to JavaScript Date object first
                    const releaseDateTime = new Date((response.data as WorkbookDataInterface).release_date);

                    // Convert to string in the format "YYYY-MM-DDTHH:MM:SS"
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
        fetchInitialData().catch(e => console.error(e));
    }, []);


    // Update data to the backend
    const updateData = async () => {
        const updatedWorkbookData: WorkbookDataInterface = {
            workbook_name: workbookName,
            release_date: `${releaseDate}T${releaseTime}`,
            exercises: exercises,
        };
        const updateApi = (isNewWorkbook ? "/api/workbooks/new" : `/api/workbooks/update/${workbookId}`);
        setIsSaving(true);
        try {
            if (userInfo?.is_admin) {
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
                    console.error(response.errorMessage || "An error occurred.");
                }
            } else if (userInfo) {
                const answersOnly = updatedWorkbookData.exercises.map(exercise => ({
                    exercise_id: exercise.exercise_id,
                    lines: exercise.lines
                }));
                const response = await fetchAPI(updateApi, {
                    method: "POST",
                    body: answersOnly,
                });
                if (response.success) {
                    setShowToast(true);
                } else {
                    console.error(response.errorMessage || "An error occurred.");
                }

            }
        } catch (error) {
            console.error("An error occurred while updating data.", error);
        }
        setIsSaving(false);
    };

    const checkingFeedbacks = async () => {
        const feedbackAPI = `api/workbooks/check/${workbookId}`;
        await updateData();
        setIsChecking(true);
        try {
            const response = await fetchAPI(feedbackAPI, {method: "POST"});
            if (response.success) {
                setFeedbacks(response.data as { [key: string]: string });
            } else {
                console.error("WRONG WRONG WRONG");
                console.error(response.errorMessage || "An error occurred.");
            }
        } catch (error) {
            console.error("An error occurred while checking answers", error);
        }
        setIsChecking(false);
    };

    // Form submission handler
    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        await updateData();
    };

    const handleCheck = async (event: React.FormEvent) => {
        event.preventDefault();
        await checkingFeedbacks();
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
                   className={"d-flex flex-column align-items-center justify-content-center"}
        >
            <ToastContainer position={"middle-center"}>
                <Toast
                    onClose={() => {
                        setShowToast(false);
                        isNewWorkbook && router.push(`/workbooks/${workbookId}`);
                    }}
                    show={showToast}
                    bg={"info"}
                >
                    <Toast.Header>
                        <strong className={"mr-auto"}>Notification</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Workbook saved successfully!
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <ToastContainer position={"middle-center"}>
                <Toast show={showExitModal} onClose={() => setShowExitModal(false)} bg={"warning"}>
                    <Toast.Header closeButton>
                        Unsaved Changes
                    </Toast.Header>
                    <Toast.Body>
                        <Row>
                            <Col>
                                <p>
                                    You have unsaved changes. Do you want to leave without saving?
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Button variant={"secondary"} onClick={() => setShowExitModal(false)}
                                        className={"text-start"}>
                                    Do not Save
                                </Button>
                            </Col>
                            <Col>
                                <Button variant={"primary"}
                                        onClick={async () => {
                                            await updateData();
                                            setShowExitModal(false);
                                        }}
                                        className={"text-end"}
                                >
                                    Save All
                                </Button>
                            </Col>
                        </Row>
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Card
                className={"p-3 w-100 d-flex flex-column justify-content-center align-items-center rounded-5 shadow-lg"}>
                <Card.Body
                    className={"w-100 d-flex flex-column justify-content-center align-items-center rounded-5"}>
                    {isLoading ? (<Spinner>Loading</Spinner>) :
                        <Form method={"post"} onSubmit={handleSave} className={"w-100 h-100 p-0 m-0"}>

                            <Card border={"primary"} className={"w-100 shadow rounded-5 mb-3"}>
                                <Card.Body className={"d-grid"}>
                                    <Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.FloatingLabel
                                                    label={"Workbook Name: "}
                                                >
                                                    <Form.Control
                                                        className={"border-secondary-subtle shadow" + (!userInfo?.is_admin && " bg-secondary-subtle")}
                                                        type={"text"}
                                                        value={workbookName}
                                                        onChange={(e) => setWorkbookName(e.target.value)}
                                                        readOnly={!userInfo.is_admin}
                                                    />
                                                </Form.FloatingLabel>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>

                                        <Col className={"mx-0 pe-0"}>
                                            <Form.Group>
                                                <Form.FloatingLabel
                                                    label={"Release Date: "}
                                                >
                                                    <Form.Control
                                                        className={"mx-0 border-secondary-subtle shadow" + (!userInfo?.is_admin && " bg-secondary-subtle")}
                                                        type={"date"}
                                                        value={releaseDate}
                                                        onChange={(e) => setReleaseDate(e.target.value)}
                                                        readOnly={!userInfo.is_admin}
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
                                                        className={"mx-0 border-secondary-subtle shadow" + (!userInfo?.is_admin && " bg-secondary-subtle")}
                                                        type={"time"}
                                                        value={releaseTime}
                                                        onChange={(e) => setReleaseTime(e.target.value + ":00")}
                                                        readOnly={!userInfo.is_admin}
                                                    />
                                                </Form.FloatingLabel>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {exercises.map((exercise) => (
                                <Container key={exercise.exercise_id} className={"d-flex flex-column m-0 p-0"}>
                                    <Exercise
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
                                    {userInfo.is_admin && feedbacks &&
                                        <Alert>{feedbacks["${exercise.exercise_id}"]}</Alert>}
                                </Container>
                            ))}
                            <Row className={"d-flex flex-row mt-3"}>
                                {userInfo.is_admin &&
                                    <Col className={"text-start"}>
                                        <Button
                                            variant={"outline-success"}
                                            type={"button"}
                                            onClick={handleAddQA}
                                            size={"lg"}
                                            className={"shadow rounded-5"}
                                        >
                                            Add Exercise
                                        </Button>
                                    </Col>
                                }
                                <Col className={userInfo.is_admin ? ("text-end") : ("text-start")}>
                                    <Button
                                        variant={"outline-primary"}
                                        type={"submit"}
                                        size={"lg"}
                                        className={"shadow rounded-5"}
                                    >
                                        {isSaving ? "Saving..." : "Save All"}
                                    </Button>
                                </Col>

                                {!userInfo.is_admin &&
                                    <Col className={"text-end"}>
                                        <Button
                                            variant={"outline-warning"}
                                            type={"button"}
                                            size={"lg"}
                                            className={"shadow rounded-5"}
                                            onClick={handleCheck}
                                        >
                                            {isChecking ? "Checking..." : "Check Answers"}
                                        </Button>
                                    </Col>
                                }
                            </Row>
                        </Form>
                    }
                </Card.Body>
            </Card>
        </Container>
    );
}

