"use client";
import { useState } from "react";
import QandA from "@/components/QandA";
import { useRouter } from "next/navigation";

export default function AddWorkbook() {
    const router = useRouter();
    const [qandaList, setQandAList] = useState([{ id: 1, key: 1 }]);

    const handleAddQandA = () => {
        const newId = qandaList[qandaList.length - 1].id + 1;
        const newKey = Date.now();
        setQandAList([...qandaList, { id: newId, key: newKey }]);
    };
    const handleDeleteQandA = (id: number) => {
        if (qandaList.length === 1) {
            return;
        }
        const updatedQandAList = qandaList.filter((qanda) => qanda.id !== id);
        setQandAList(updatedQandAList);
    };

    return (
        <div>
            <p>NEW WORKBOOK</p>
            {qandaList.map((qanda, index) => (
                <QandA
                    key={qanda.key}
                    defaultNum={index.toString()}
                    onDelete={() => handleDeleteQandA(qanda.id)}
                    isDeleteDisabled={qandaList.length === 1}
                />
            ))}
            <button type="button" onClick={handleAddQandA}>
                Add Q&A
            </button>
            <button type="submit">Save All</button>
        </div>
    );
}
