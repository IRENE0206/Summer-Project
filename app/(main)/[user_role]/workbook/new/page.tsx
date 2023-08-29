"use client";
import {useState} from "react";
import QandA from "@/components/QandA";
import {useRouter} from "next/navigation";
import {Line} from "@/interfaces/Interfaces";
import {Container, Form} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


export default function AddWorkbook() {
    const router = useRouter();
    const [qandaList, setQandAList] = useState([
        {id: 1, index: 1, number: "1"},
    ]);

    const [workbookName, setWorkbookName] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const handleAddQandA = () => {
        const newId = qandaList[qandaList.length - 1].id + 1;
        const newExerciseNum = qandaList.length + 1;
        setQandAList([
            ...qandaList,
            {
                id: newId,
                index: newExerciseNum,
                number: newExerciseNum.toString(),
            },
        ]);
    };
    const handleDeleteQandA = (id: number) => {
        if (qandaList.length === 1) {
            return;
        }

        setQandAList(
            qandaList
                .filter((qanda) => qanda.id !== id)
                .map((qanda, idx) => ({
                    ...qanda,
                    index: idx + 1,
                }))
        );
    };

    const handleQandAChange = (
        id: number,
        index: number,
        number: string,
        question: string,
        answer: Line[]
    ) => {
        const updatedQandaList = qandaList.map((qanda) =>
            qanda.id === id ? {id, index, number, question, answer} : qanda
        );
        setQandAList(updatedQandaList);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const workbookData = {
            workbook_name: workbookName,
            release_date: releaseDate,
            exercises: qandaList,
        };
        const api = "/api/workbook/new";
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(workbookData),
        })
            .then((res) => {
                // Check if the HTTP request was successful
                if (!res.ok) {
                    return res.json().then(data => {
                        const errorMsg = data.message || "An error occurred.";
                        // Display the error to the user
                        alert(errorMsg);
                        throw new Error(`Request failed: ${errorMsg}`);
                    });
                }
                return res.json();
            })
            .then((data) => {

                console.log("Workbook added successfully");
                // store the session in client side
                const workbook_id = data.workbook_id;
                console.log("Now direct to '/workbook/[workbook_id]");
                router.push(`/workbook/${workbook_id}`);


            })
            .catch((error) => {
                console.error("There was an error with the request:", error);
            });
    };
    return (
        <Container>
            <h1>NEW WORKBOOK</h1>
            <Form method="post" onSubmit={handleSubmit}>
                <Card border="primary" className="mb-4">
                    <Card.Body>
                        <Form.Group as={Row}>
                            <Form.Label column md={2}>Workbook Name:</Form.Label>
                            <Col md={10}>
                                <Form.Control
                                    type="text"
                                    value={workbookName}
                                    onChange={(e) => setWorkbookName(e.target.value)}
                                    placeholder="Enter workbook name"
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>

                            <Form.Label column md={2}>Release Date:</Form.Label>

                            <Col md={10}>
                                <Form.Control
                                    type="date"
                                    value={releaseDate}
                                    onChange={(e) => setReleaseDate(e.target.value)}
                                />
                            </Col>

                        </Form.Group>
                    </Card.Body>
                </Card>


                {qandaList.map((qanda) => (
                    <QandA
                        key={qanda.id}
                        index={qanda.index}
                        onChange={(data) =>
                            handleQandAChange(
                                qanda.id,
                                qanda.index,
                                data.number,
                                data.question,
                                data.answer
                            )
                        }
                        onDelete={() => handleDeleteQandA(qanda.id)}
                        isDeleteDisabled={qandaList.length === 1}
                    />

                ))}
                <Button
                    variant="outline-success"
                    type="button"
                    onClick={handleAddQandA}
                >
                    Add Q&A
                </Button>

                <Button
                    variant="outline-primary"
                    type="submit"
                >
                    Save All
                </Button>
            </Form>
        </Container>
    );
}
