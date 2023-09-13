import {useEffect, useState} from "react";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import Latex from "react-latex-next";
import {Line} from "@/interfaces/Interfaces";

export default function Answer({
    answerLines,
    onChange,
}: {
    answerLines: Line[];
    onChange: (newAnswer: Line[]) => void
}) {
    const [startingSymbolIndex, setStartingSymbolIndex] = useState<number>(0);
    const [uniqueName] = useState(() => `startingSymbol_${Date.now()}`);

    const updateLineIndexes = (lines: Line[]): Line[] => {
        return lines.map((line, index) => ({
            ...line,
            line_index: index,
        }));
    };

    useEffect(() => {
        // Reset to the first line as the default
        setStartingSymbolIndex(0);
    }, [answerLines]);

    const reorderLines = (newLines: Line[]) => {
        const reordered: Line[] = [
            newLines[startingSymbolIndex],
            ...newLines.slice(0, startingSymbolIndex),
            ...newLines.slice(startingSymbolIndex + 1)
        ];
        onChange(updateLineIndexes(reordered));
    };


    const handleAddLine = () => {
        const newLines = [...answerLines, {line_index: answerLines.length, variable: "", rules: ""}];
        onChange(updateLineIndexes(newLines));
    };
    const handleDeleteLine = (line_index: number) => {
        if (answerLines.length <= 1) {
            return;
        }
        const newLines = answerLines.filter((line) => line.line_index !== line_index);
        if (line_index === startingSymbolIndex) {
            setStartingSymbolIndex(0);
        } else if (line_index < startingSymbolIndex) {
            setStartingSymbolIndex(startingSymbolIndex - 1);
        }
        reorderLines(updateLineIndexes(newLines));
    };

    const handleChangeLineVariable = (line_index: number, variable: string) => {
        onChange(answerLines.map((line) =>
            line.line_index === line_index ? {...line, variable} : line
        ));
    };

    const handleChangeLineRules = (line_index: number, rules: string) => {
        onChange(answerLines.map((line) =>
            line.line_index === line_index ? {...line, rules} : line
        ));
    };

    const latexLines = answerLines.map((line) => {
        if (line.variable && line.rules) {
            const latexLine = `${line.variable} & \\rightarrow `;
            const latexRules = line.rules.split("|").join(" \\mid ");
            return latexLine + latexRules;
        }
        return "";
    });

    // Use align* environment for multiple lines in a single block
    const latexString = `\\begin{align*} ${latexLines.join(" \\\\ ")} \\end{align*}`;


    return (
        <Container fluid className={"d-grid px-0 mx-0 shadow rounded"}>

            <Row>
                <Col>
                    <Form.Group>
                        <Form.FloatingLabel label={"Answer Preview:"}>
                            <Form.Control
                                as={Container}
                                className={"d-flex justify-content-center align-content-center h-auto bg-secondary-subtle"}
                            >
                                {/* Display the entire grammar as a single Latex block */}
                                <Latex>{`$$ ${latexString} $$`}</Latex>
                            </Form.Control>
                        </Form.FloatingLabel>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className={"d-grid"}>
                <Form.FloatingLabel label={"Answer Input:"}>
                    <Form.Control as={Container} className={"d-grid h-auto"}>

                        <Row className={"shadow-sm py-1 align-items-center text-start"}>
                            <Col>
                                <Form.Text muted>
                                    Please mark your starting symbol
                                </Form.Text>
                            </Col>
                        </Row>

                        {answerLines.map((line: Line, index: number) => (
                            <Row key={line.line_index}
                                className={"shadow-sm py-1 px-0 align-items-center text-center"}>
                                <InputGroup className={"align-items-center text-center p-0"}>

                                    <Col sm={1}>
                                        <Form.Check
                                            type={"radio"}
                                            name={uniqueName}
                                            className={"text-center"}
                                            checked={startingSymbolIndex === index}
                                            onChange={() => setStartingSymbolIndex(index)}
                                        />
                                    </Col>

                                    <Col sm={2} className={"text-center"}>
                                        <Form.Control
                                            className={"rounded-end-0"}
                                            aria-label={"Grammar variable input"}
                                            type={"search"}
                                            value={line.variable}
                                            onChange={(e) =>
                                                handleChangeLineVariable(
                                                    line.line_index,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Col>

                                    <InputGroup.Text className={"rounded-0 text-center"}>
                                        <Latex>$\rightarrow$</Latex>
                                    </InputGroup.Text>

                                    <Col sm={5}>
                                        <Form.Control
                                            className={"rounded-start-0"}
                                            aria-label={"Grammar rules input"}
                                            type={"search"}
                                            value={line.rules}
                                            onChange={(e) =>
                                                handleChangeLineRules(
                                                    line.line_index,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Col>

                                    <Col>
                                        <Button
                                            variant={"outline-secondary"}
                                            type={"button"}
                                            aria-label={"Delete line"}
                                            disabled={answerLines.length === 1}
                                            className={"shadow"}
                                            onClick={() => handleDeleteLine(line.line_index)}
                                        >
                                            Delete
                                        </Button>
                                    </Col>

                                </InputGroup>
                            </Row>

                        ))}

                        <Row className={"py-1 text-start"}>
                            <Col>
                                <Button
                                    variant={"outline-success"}
                                    type={"button"}
                                    aria-label={"Add line"}
                                    className={"shadow rounded-5"}
                                    onClick={handleAddLine}
                                >
                                    Add new line
                                </Button>
                            </Col>
                        </Row>

                    </Form.Control>
                </Form.FloatingLabel>
            </Form.Group>

        </Container>

    );
}
