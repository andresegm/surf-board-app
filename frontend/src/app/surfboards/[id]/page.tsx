"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Heading, Text, Spinner } from "@chakra-ui/react";

interface Surfboard {
  id: number;
  title: string;
  condition: string;
  owner_id: number;
  description?: string;
}

export default function SurfboardDetailPage() {
  const params = useParams();
  const { id } = params;
  const [surfboard, setSurfboard] = useState<Surfboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`http://localhost:5050/surfboards/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setSurfboard(data);
      } catch (err) {
        console.error("Error fetching board:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id]);

  if (loading) return <Spinner size="xl" />;
  if (!surfboard) return <Text>Board not found.</Text>;

  return (
    <Box p={6}>
      <Heading mb={4}>{surfboard.title}</Heading>
      <Text mb={2}><strong>Condition:</strong> {surfboard.condition}</Text>
      <Text><strong>Description:</strong> {surfboard.description || "No description provided."}</Text>
    </Box>
  );
}
