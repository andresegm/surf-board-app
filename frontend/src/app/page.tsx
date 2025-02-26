"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Input, Button, VStack, HStack } from "@chakra-ui/react";

// Define the Surfboard type
interface Surfboard {
  id: number;
  title: string;
  condition: string;
}

export default function Home() {
  const [surfboards, setSurfboards] = useState<Surfboard[]>([]);
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [hydrated, setHydrated] = useState(false); // Added to prevent hydration mismatch

  // Ensures hydration has completed before rendering
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
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

  const handleAddSurfboard = async () => {
    if (!title || !condition) {
      alert("Title and Condition are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/surfboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: 1, title, condition }) // Default owner_id for now
      });

      if (res.ok) {
        setTitle("");
        setCondition("");
        fetchSurfboards(); // Refresh list
      } else {
        console.error("Failed to add surfboard.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteSurfboard = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5050/surfboards/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSurfboards(surfboards.filter((board) => board.id !== id)); // Remove from UI
      } else {
        console.error("Failed to delete surfboard.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ✅ Prevents rendering until hydration is complete
  if (!hydrated) {
    return null;
  }

  return (
    <Box p={5}>
      <Heading mb={4}>Welcome to the Surfing Board App</Heading>

      <VStack spacing={3} mb={6} align="start">
        <Input
          placeholder="Surfboard Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Condition (new, good, used, damaged)"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleAddSurfboard}>
          Add Surfboard
        </Button>
      </VStack>

      <Box>
        {surfboards.length > 0 ? (
          surfboards.map((board) => (
            <Box key={board.id} p={3} border="1px solid #ddd" borderRadius="md" mb={2}>
              <Text fontWeight="bold">{board.title}</Text>
              <Text>Condition: {board.condition}</Text>
              <HStack mt={2}>
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
