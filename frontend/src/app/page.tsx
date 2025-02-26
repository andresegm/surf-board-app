"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Input, Button, VStack, HStack, Select } from "@chakra-ui/react";

// Define the Surfboard type
interface Surfboard {
  id: number;
  title: string;
  condition: string;
}

// Allowed conditions 
const validConditions = ["new", "good", "used", "damaged"];

export default function Home() {
  const [surfboards, setSurfboards] = useState<Surfboard[]>([]);
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchSurfboards();
  }, []);

  const fetchSurfboards = async () => {
    try {
      const res = await fetch("http://localhost:5050/surfboards");
      const data: Surfboard[] = await res.json();
      setSurfboards(data);
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
          body: JSON.stringify({ owner_id: 1, title, condition }),
        });

        if (!res.ok) {
          console.error("Failed to add surfboard.");
        }
      }

      setTitle("");
      setCondition("");
      fetchSurfboards();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteSurfboard = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5050/surfboards/${id}`, { method: "DELETE" });

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
      <Heading mb={4}>Welcome to the Surfing Board App</Heading>

      {/* Surfboard Form */}
      <VStack spacing={3} mb={6} align="start">
        <Input placeholder="Surfboard Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        {/* Dropdown for selecting a valid condition */}
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
            <Box key={board.id} p={3} border="1px solid #ddd" borderRadius="md" mb={2}>
              <Text fontWeight="bold">{board.title}</Text>
              <Text>Condition: {board.condition}</Text>
              <HStack mt={2}>
                <Button colorScheme="yellow" size="sm" onClick={() => handleEditClick(board)}>
                  Edit
                </Button>
                <Button colorScheme="red" size="sm" onClick={() => handleDeleteSurfboard(board.id)}>
                  Delete
                </Button>
              </HStack>
            </Box>
          ))
        ) : (
          <Text>No surfboards available.</Text>
        )}
      </Box>
    </Box>
  );
}
