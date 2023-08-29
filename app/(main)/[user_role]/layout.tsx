"use client";
import React from "react";
import {Container} from "react-bootstrap";
import {UserRole} from "@/interfaces/Interfaces";

export default function HomeLayout({params, children}: {
    params: { user_role: UserRole }
    children: React.ReactNode;
}) {
    return <Container>{children}</Container>;
}
