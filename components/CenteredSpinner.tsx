import {Container, Spinner} from "react-bootstrap";

export default function CenteredSpinner() {
    return (
        <Container className={"d-flex justify-content-center align-items-center"} style={{height: "100vh"}}>
            <Spinner animation={"border"} role={"status"}>
                <span className={"visually-hidden"}>Loading...</span>
            </Spinner>
        </Container>
    );
}