import {Card, Col, Form, Row} from "react-bootstrap";

export default function WorkbookInfo({
    userInfo,
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
    workbookName: string;
    setWorkbookName: (value: string) => void;
    releaseDate: string;
    setReleaseDate: (value: string) => void;
    releaseTime: string;
    setReleaseTime: (value: string) => void;
}) {
    return (
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
    );
}
