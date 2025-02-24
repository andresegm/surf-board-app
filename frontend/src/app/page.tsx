"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

// Define the Surfboard type
interface Surfboard {
  id: number;
  title: string;
  condition: string;
}

export default function Home() {
  const [surfboards, setSurfboards] = useState<Surfboard[]>([]);

  useEffect(() => {
    fetch("http://localhost:5050/surfboards")
      .then((res) => res.json())
      .then((data: Surfboard[]) => setSurfboards(data))
      .catch((error) => console.error("Error fetching surfboards:", error));
  }, []);

  return (
    <Box p={5}>
      <Heading>Welcome to the Surfing Board App</Heading>
      <Box mt={4}>
        {surfboards.length > 0 ? (
          surfboards.map((board) => (
            <Box key={board.id} p={3} border="1px solid #ddd" borderRadius="md" mb={2}>
              <Text fontWeight="bold">{board.title}</Text>
              <Text>Condition: {board.condition}</Text>
            </Box>
          ))
        ) : (
          <Text>No surfboards available.</Text>
        )}
      </Box>
    </Box>
  );
}

