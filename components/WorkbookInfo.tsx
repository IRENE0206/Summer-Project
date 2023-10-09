import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {fetchAPI} from "@/utils/fetchAPI";
import {useRouter} from "next/navigation";

export default function WorkbookInfo({
    userInfo,
    workbookId,
    workbookName,
    setWorkbookName,
    releaseDate,
    setReleaseDate,
    releaseTime,
    setReleaseTime,
}: {
    userInfo: {
        is_admin: boolean;
    };
    workbookId: string | null;
    workbookName: string;
    setWorkbookName: (value: string) => void;
    releaseDate: string;
    setReleaseDate: (value: string) => void;
    releaseTime: string;
    setReleaseTime: (value: string) => void;
}) {
    const router = useRouter();
    const handleDeleteWorkbook = async () => {
        if (!workbookId) {
            router.push("/home");
            return;
        }
        const deleteApi = `/api/workbooks/delete/${workbookId}`;
        try {
            const response = await fetchAPI(deleteApi, {
                method: "DELETE",
            });
            if (response.success) {
                // Navigate back to the home page
                router.push("/home");
            } else {
                console.error(response.errorMessage || "An error occurred while deleting.");
            }
        } catch (error) {
            console.error("An error occurred while deleting the workbook.", error);
        }
    };
    return (
        <Card border={"primary"} className={"w-100 shadow rounded-5 mb-3"}>
            <Card.Header className={"rounded-5 shadow-sm"}>
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
            </Card.Header>
            <Card.Body className={"d-grid"}>
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
            {userInfo.is_admin &&
                <Card.Footer className={"rounded-5 shadow-sm"}>
                    <Button
                        variant={"outline-danger"}
                        type={"button"}
                        onClick={handleDeleteWorkbook}
                        size={"lg"}
                        className={"shadow rounded-5"}
                    >
                        Delete Workbook
                    </Button>
                </Card.Footer>
            }
        </Card>
    );
}
