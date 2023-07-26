"use client";
import QandA from "@/components/QandA";

export default function AddWorkbook() {
    return (
        <>
            <div>
                <p>NEW WORKBOOK</p>
                <QandA index="1" />
                <button type="submit">Save</button>
            </div>
        </>
    );
}
