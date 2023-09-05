"use client";
import {Alert, Container, Tab, TabContainer, Tabs} from "react-bootstrap";
import {useContext, useEffect, useState} from "react";
import {UserInfoContext} from "@/app/(main)/layout";

export default function WorkbookMenu(
    {params}: {
        params: {
            workbook_id: number
        }
    }
) {
    const userInfo = useContext(UserInfoContext);
    const [workbookData, setWorkbookData] = useState();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const api = `/api/workbooks/${params.workbook_id}`;

    const fetchWorkbookData = async () => {
        const res = await fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(workbookData),
        });

        if (!res.ok) {
            const message = await res.json();
            setErrorMsg(message); // Set the error message
            return;
        }
        const workbook_data = await res.json();
        setWorkbookData(workbook_data);
    };
    
    useEffect(() => {
        fetchWorkbookData()
            .catch(
                error => console.error(error)
            );
    }, []);


    if (!userInfo) {
        return (
            <Alert variant={"danger"}>
                You need to sign in first
            </Alert>
        );
    }

    if (errorMsg) {
        return (
            <Alert variant={"danger"}>
                {errorMsg}
            </Alert>
        );
    }


    if (userInfo.is_admin) {
        return (
            <Tabs
                defaultActiveKey={"edit"}
                fill
            >
                <TabContainer>
                    <Tab
                        eventKey={"edit"}
                        title={"Edit"}
                    >
                    </Tab>
                </TabContainer>
                <TabContainer>
                    <Tab
                        eventKey={"preview"}
                        title={"Preview"}
                    >
                    </Tab>
                </TabContainer>
            </Tabs>

        );
    }

    return (
        <Container>

        </Container>

    );
}

