import Form from "react-bootstrap/Form";

import InputGroup from "react-bootstrap/InputGroup";
import {Line} from "@/interfaces/Interfaces";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useEffect, useState} from "react";

export default function Answer({
    lines,
    onChange,
}: {
    lines: Line[];
    onChange: (newAnswer: Line[]) => void
}) {
    const [startingSymbolIndex, setStartingSymbolIndex] = useState<number>(0);
    const [uniqueName] = useState(() => `startingSymbol_${Date.now()}`);

    useEffect(() => {
        // Reset to the first line as the default
        setStartingSymbolIndex(0);
    }, [lines]);

    const reorderLines = (newLines: Line[]) => {
        const reordered: Line[] = [
            newLines[startingSymbolIndex],
            ...newLines.slice(0, startingSymbolIndex),
            ...newLines.slice(startingSymbolIndex + 1)
        ].map((line, index) => ({
            ...line,
            line_index: index
        }));
        onChange(
            reordered
        );
    };


    const handleAddLine = () => {
        const index = lines.length;
        onChange([
            ...lines,
            {
                line_index: index,
                variable: "",
                rules: "",
            }
        ]);
    };
    const handleDeleteLine = (line_index: number) => {
        if (lines.length === 1) {
            return;
        }
        const newLines = lines.filter((line) => line.line_index !== line_index);
        if (line_index === startingSymbolIndex) {
            setStartingSymbolIndex(0);
        } else if (line_index < startingSymbolIndex) {
            setStartingSymbolIndex(startingSymbolIndex - 1);
        }
        reorderLines(newLines);
    };

    const handleChangeLineVariable = (line_index: number, variable: string) => {
        onChange(lines.map((line) =>
            line.line_index === line_index ? {...line, variable} : line
        ));
    };

    const handleChangeLineRules = (line_index: number, rules: string) => {
        onChange(lines.map((line) =>
            line.line_index === line_index ? {...line, rules} : line
        ));
    };

    return (
        <>
            <Form.Text muted className={"font-weight-bold"}>
                Please mark the starting symbol.
            </Form.Text>
            {lines.map((line: Line, index: number) => (
                <InputGroup
                    key={line.line_index}
                    as={Row}
                    className={"shadow-sm mx-0 px-0 w-100 align-items-center"}
                >
                    <Col sm={1} className={"mx-0 px-0"}>
                        <Form.Check
                            type={"radio"}
                            name={uniqueName}
                            className={"mx-0 px-0"}
                            checked={startingSymbolIndex === index}
                            onChange={() => setStartingSymbolIndex(index)}
                        />
                    </Col>
                    <Col sm={3} className={"px-0 mx-0"}
                    >
                        <Form.Control
                            aria-label="Grammar variable input"
                            type="search"
                            value={line.variable}
                            className={"mx-0 px-0"}
                            onChange={(e) =>
                                handleChangeLineVariable(
                                    line.line_index,
                                    e.target.value
                                )
                            }
                        />
                    </Col>
                    <Col sm={1} className={"px-0 mx-0 justify-content-center"}>
                        <InputGroup.Text
                            className={"mx-0 text-center"}
                        >&rarr;</InputGroup.Text>
                    </Col>
                    <Col sm={5} className={"px-0 mx-0"}>
                        <Form.Control
                            aria-label="Grammar rules input"
                            type="search"
                            value={line.rules}
                            className={"mx-0 px-0"}
                            onChange={(e) =>
                                handleChangeLineRules(
                                    line.line_index,
                                    e.target.value
                                )
                            }
                        />
                    </Col>
                    <Col sm={2} className={"mx-0"}>
                        <Button
                            variant={"outline-secondary"}
                            type={"button"}
                            aria-label={"Delete line"}
                            disabled={lines.length === 1}
                            className={"shadow-sm justify-content-center"}
                            onClick={() => handleDeleteLine(line.line_index)}
                        >
                            Delete
                        </Button>
                    </Col>
                </InputGroup>
            ))}
            <Row className={"my-3"}>
                <Col>
                    <Button
                        variant={"outline-success"}
                        type={"button"}
                        aria-label={"Add line"}
                        className={"shadow-sm"}
                        onClick={handleAddLine}
                    >
                        Add new line
                    </Button>
                </Col>
            </Row>
        </>
    );
}
