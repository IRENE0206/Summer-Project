import { FormEvent, useState } from "react";
import GrammarInput from "./GrammarInput";

export default function QandA({ index }: { index: string }) {
    const [number, setNumber] = useState(index);
    const [question, setQuestion] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <form method="post" onSubmit={handleSubmit}>
                <label>
                    Exercise Number:
                    <input
                        value={number}
                        name={`index${number}`}
                        onChange={(e) => setNumber(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Content:
                    <input
                        type="text"
                        value={question}
                        name={`question${number}`}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </label>
                <br />
                <label>
                    Correct Answer:
                    <GrammarInput />
                </label>
            </form>
        </>
    );
}
