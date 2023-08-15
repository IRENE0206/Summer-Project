import Form from "react-bootstrap/Form";

import InputGroup from "react-bootstrap/InputGroup";
import { Line } from "@/interfaces/Interfaces";

export default function GrammarInput({
    value,
    onChange,
}: {
    value: Line[];
    onChange: (updatedLines: Line[]) => void;
}) {
    const handleAddLine = () => {
        const index = value.length;
        onChange([
            ...value,
            {
                line_index: index,
                variable: "",
                rules: "",
            },
        ]);
    };
    const handleDeleteLine = (line_index: number) => {
        if (value.length === 1) return;

        onChange(
            value
                .filter((line) => line.line_index !== line_index)
                .map((line, index) => ({
                    ...line,
                    line_index: index,
                }))
        );
    };

    const handleChangeLineVariable = (line_index: number, variable: string) => {
        onChange(
            value.map((line) =>
                line.line_index === line_index ? { ...line, variable } : line
            )
        );
    };

    const handleChangeLineRules = (line_index: number, rules: string) => {
        onChange(
            value.map((line) =>
                line.line_index === line_index ? { ...line, rules } : line
            )
        );
    };

    return (
        <>
            {value.map((line) => (
                <InputGroup key={line.line_index}>
                    <Form.Control
                        aria-label="Grammar variable input"
                        type="search"
                        value={line.variable}
                        onChange={(e) =>
                            handleChangeLineVariable(
                                line.line_index,
                                e.target.value
                            )
                        }
                    />
                    <InputGroup.Text>&rarr;</InputGroup.Text>
                    <Form.Control
                        aria-label="Grammar rules input"
                        type="search"
                        value={line.rules}
                        onChange={(e) =>
                            handleChangeLineRules(
                                line.line_index,
                                e.target.value
                            )
                        }
                    />
                    <button
                        type="button"
                        aria-label="Delete line"
                        disabled={value.length === 1}
                        onClick={() => handleDeleteLine(line.line_index)}
                    >
                        Delete
                    </button>
                </InputGroup>
            ))}
            <button type="button" aria-label="Add line" onClick={handleAddLine}>
                Add new line
            </button>
        </>
    );
}
