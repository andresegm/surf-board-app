"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { Box, Heading, Text, VStack, Input, Button, Select } from "@chakra-ui/react";
import SurfboardCard from "../components/SurfboardCard";

interface Surfboard {
    id: number;
    title: string;
    condition: string;
    owner_id: number;
}

const validConditions = ["new", "good", "used", "damaged"];

export default function Dashboard() {
    const { user } = useAuth();
    const [surfboards, setSurfboards] = useState<Surfboard[]>([]);
    const [title, setTitle] = useState("");
    const [condition, setCondition] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        if (user) fetchUserSurfboards();
    }, [user]);

    const fetchUserSurfboards = async () => {
        try {
            const res = await fetch("http://localhost:5050/surfboards", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Unauthorized");
            }

            const data: Surfboard[] = await res.json();
            setSurfboards(data.filter(board => board.owner_id === user?.id));
        } catch (error) {
            console.error("Error fetching surfboards:", error);
        }
    };

    const handleAddOrUpdateSurfboard = async () => {
        if (!title || !condition) {
            alert("Title and Condition are required.");
            return;
        }

        try {
            if (editingId) {
                const res = await fetch(`http://localhost:5050/surfboards/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ title, condition }),
                });

                if (res.ok) {
                    setEditingId(null);
                } else {
                    console.error("Failed to update surfboard.");
                }
            } else {
                const res = await fetch("http://localhost:5050/surfboards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ title, condition }),
                });

                if (!res.ok) {
                    console.error("Failed to add surfboard.");
                }
            }

            setTitle("");
            setCondition("");
            fetchUserSurfboards();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDeleteSurfboard = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5050/surfboards/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setSurfboards(surfboards.filter((board) => board.id !== id));
            } else {
                console.error("Failed to delete surfboard.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleEditClick = (surfboard: Surfboard) => {
        setEditingId(surfboard.id);
        setTitle(surfboard.title);
        setCondition(surfboard.condition);
    };

    if (!hydrated) {
        return null;
    }

    return (
        <Box p={5}>
            <Heading mb={4}>My Surfboards</Heading>

            {/* Surfboard Form */}
            <VStack spacing={3} mb={6} align="start">
                <Input placeholder="Surfboard Title" value={title} onChange={(e) => setTitle(e.target.value)} />

                <Select placeholder="Select Condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
                    {validConditions.map((cond) => (
                        <option key={cond} value={cond}>
                            {cond}
                        </option>
                    ))}
                </Select>

                <Button colorScheme="blue" onClick={handleAddOrUpdateSurfboard}>
                    {editingId ? "Update Surfboard" : "Add Surfboard"}
                </Button>
            </VStack>

            {/* Surfboard List */}
            <Box>
                {surfboards.length > 0 ? (
                    surfboards.map((board) => (
                        <SurfboardCard
                            key={board.id}
                            id={board.id}
                            title={board.title}
                            condition={board.condition}
                            onEdit={() => handleEditClick(board)}
                            onDelete={() => handleDeleteSurfboard(board.id)}
                            isOwner={true}
                        />
                    ))
                ) : (
                    <Text>No surfboards added yet.</Text>
                )}
            </Box>
        </Box>
    );
}
