import { useState } from "react";

interface Line {
    id: number;
    variable: string;
    rule: string;
}
/*
interface GrammarInputProps {
    lines: Line[];
    onLineChange: (id: number, variable: string, rule: string) => void;
    onAddLine: () => void;
    onDeleteLine: (id: number) => void;
} */

export default function GrammarInput() {
    const [lines, setLines] = useState<Line[]>([
        { id: 0, variable: "", rule: "" },
    ]);
    const handleAddLine = () => {
        setLines((prevLines) => [
            ...prevLines,
            { id: lines[prevLines.length - 1].id + 1, variable: "", rule: "" },
        ]);
    };
    const handleDeleteLine = (id: number) => {
        if (lines.length === 1) {
            return;
        }
        setLines((prevLines) => prevLines.filter((line) => line.id !== id));
    };

    const handleChangeLineVariable = (id: number, variable: string) => {
        setLines((prevLines) =>
            prevLines.map((line) =>
                line.id === id ? { ...line, variable: variable } : line
            )
        );
    };

    const handleChangeLineRule = (id: number, rule: string) => {
        setLines((prevLines) =>
            prevLines.map((line) =>
                line.id === id ? { ...line, rule: rule } : line
            )
        );
    };

    return (
        <>
            {lines.map((line) => (
                <div key={line.id}>
                    <input
                        type="search"
                        value={line.variable}
                        onChange={(e) =>
                            handleChangeLineVariable(line.id, e.target.value)
                        }
                    />
                    <span>arrow</span>
                    <input
                        type="search"
                        value={line.rule}
                        onChange={(e) =>
                            handleChangeLineRule(line.id, e.target.value)
                        }
                    />
                    <button
                        type="button"
                        disabled={lines.length === 1}
                        onClick={() => handleDeleteLine(line.id)}
                    >
                        Delete
                    </button>
                    <br />
                </div>
            ))}
            <button type="button" onClick={handleAddLine}>
                Add new line
            </button>
        </>
    );
}
