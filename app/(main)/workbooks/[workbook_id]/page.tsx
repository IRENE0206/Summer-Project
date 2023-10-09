"use client";
import React, {useContext, useEffect, useState} from "react";
import {Alert, Button, Card, Col, Container, Form, Modal, Row, Spinner, Toast, ToastContainer} from "react-bootstrap";
import {ExerciseDataInterface, Line, WorkbookDataInterface} from "@/interfaces/Interfaces";
import UserInfoContext from "@/utils/UserInfoContext";
import {fetchAPI} from "@/utils/fetchAPI";
import {useParams, useRouter} from "next/navigation";
import Exercise from "@/components/Exercise";
import WorkbookInfo from "@/components/WorkbookInfo";

export default function EditWorkbook() {
    const router = useRouter();
    const userInfo = useContext(UserInfoContext);
    const [workbookId, setWorkbookId] = useState(String(useParams()["workbook_id"]));
    const [nextTempId, setNextTempId] = useState(-1);
    const [feedbacks, setFeedbacks] = useState<{ [key: string]: string } | null>(null);
    const [workbookName, setWorkbookName] = useState<string>("");
    const [releaseDate, setReleaseDate] = useState("");
    const [releaseTime, setReleaseTime] = useState("");
    const [exercises, setExercises] = useState<ExerciseDataInterface[]>([
        {
            exercise_id: -1, exercise_index: 1, exercise_number: "1",
            exercise_content: "",
            lines: [{line_id: -2, line_index: 0, variable: "", rules: ""}]
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
                    const retrievedExercises = (response.data as WorkbookDataInterface).exercises;
                    if (retrievedExercises.length > 0) {
                        setExercises(retrievedExercises);
                    }
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
        if (!userInfo) {
            console.error("Failed to fetch userInfo");
            return;
        }
        console.log("RAW:" + exercises);
        const exercisesToSend = exercises.map(exercise => ({
            exercise_id: exercise.exercise_id && exercise.exercise_id > 0 && exercise.exercise_id || null,
            exercise_index: exercise.exercise_index,
            exercise_number: exercise.exercise_number,
            exercise_content: exercise.exercise_content,
            lines: exercise.lines.map(line => ({
                line_id: line.line_id && line.line_id > 0 && line.line_id || null,
                line_index: line.line_index,
                variable: line.variable,
                rules: line.rules,
            }))
        }));
        const updatedWorkbookData = {
            workbook_name: workbookName,
            release_date: `${releaseDate}T${releaseTime}`,
            exercises: exercisesToSend,
        };
        console.log("TO SEND" + exercisesToSend);
        updatedWorkbookData.exercises.map(exercise => console.log(exercise.lines));
        const updateApi = (isNewWorkbook ? "/api/workbooks/update" : `/api/workbooks/update/${workbookId}`);
        setIsSaving(true);
        console.log("before sending data");
        let dataToSend;
        if (userInfo.is_admin) {
            dataToSend = updatedWorkbookData;
            console.log("set data to send");
        } else {
            const answersOnly = exercisesToSend.map(exercise => ({
                exercise_id: exercise.exercise_id,
                lines: exercise.lines
            }));
            dataToSend = {
                exercises: answersOnly
            };
        }
        console.log("Sending data:", dataToSend);
        console.log("Sending data:", dataToSend.exercises[0].lines);
        const response = await fetchAPI(updateApi, {
            method: "POST",
            body: dataToSend,
        });
        if (response.success) {
            if (isNewWorkbook && userInfo.is_admin) {
                setWorkbookId(((response.data as { workbook_id: number }).workbook_id).toString());
            }

            const updatedWorkbook = await fetchAPI(`/api/workbooks/${workbookId}`, {method: "GET"});
            console.log(updatedWorkbook);
            if (updatedWorkbook.success) {
                setExercises((updatedWorkbook.data as WorkbookDataInterface).exercises);
                setShowToast(true);
                if (isNewWorkbook) {
                    router.push(`/workbooks/${workbookId}`);
                }
            } else {
                console.error(updatedWorkbook.errorMessage || "An error occurred.");
            }
        } else {
            console.error(response.errorMessage || "An error occurred.");
        }

        setIsSaving(false);
    };

    const checkingFeedbacks = async () => {
        const feedbackAPI = `/api/workbooks/check/${workbookId}`;
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
    // Function to generate a new temporary ID
    const generateTempId = () => {  // <-- New Function
        const newTempId = nextTempId - 1;
        setNextTempId(newTempId);
        return newTempId;
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
        const newExerciseNum = exercises.length + 1;
        setExercises([
            ...exercises,
            {
                exercise_id: generateTempId(),
                exercise_index: newExerciseNum,
                exercise_number: newExerciseNum.toString(),
                exercise_content: "",
                lines: [{line_id: generateTempId(), line_index: 0, variable: "", rules: ""}],
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
                exercise_id: exercise_id,
                exercise_index: exercise_index,
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
                    bg={"success"}
                    delay={5000} // Delay of 5 seconds before auto-hide
                    autohide
                >
                    <Toast.Header>
                        <strong className={"mr-auto"}>Notification</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Workbook saved successfully!
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Modal show={showExitModal} onHide={() => setShowExitModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Unsaved Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You have unsaved changes. Do you want to leave without saving?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"secondary"} onClick={() => setShowExitModal(false)}>
                        Do not Save
                    </Button>
                    <Button variant={"primary"} onClick={async () => {
                        await updateData();
                        setShowExitModal(false);
                    }}>
                        Save All
                    </Button>
                </Modal.Footer>
            </Modal>

            <Card
                className={"p-3 w-100 d-flex flex-column justify-content-center align-items-center rounded-5 shadow-lg"}>
                <Card.Body
                    className={"w-100 d-flex flex-column justify-content-center align-items-center rounded-5"}>
                    {isLoading ? (<Spinner>Loading</Spinner>) :
                        <Form method={"post"} onSubmit={handleSave} className={"w-100 h-100 p-0 m-0"}>
                            <WorkbookInfo
                                userInfo={userInfo}
                                workbookId={!isNewWorkbook && workbookId || null}
                                workbookName={workbookName}
                                setWorkbookName={setWorkbookName}
                                releaseDate={releaseDate}
                                setReleaseDate={setReleaseDate}
                                releaseTime={releaseTime}
                                setReleaseTime={setReleaseTime}
                            />

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
                                        <Alert variant={"info"}>{feedbacks[`${exercise.exercise_id}`]}
                                        </Alert>}
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

