"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./authContext";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import SurfboardCard from "./components/SurfboardCard";

interface Surfboard {
  id: number;
  title: string;
  condition: string;
  owner_id: number;
}

export default function Home() {
  const [surfboards, setSurfboards] = useState<Surfboard[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setHydrated(true);
    fetchSurfboards();
  }, []);

  const fetchSurfboards = async () => {
    try {
      const res = await fetch("http://localhost:5050/surfboards", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const data: Surfboard[] = await res.json();
      setSurfboards(data);
    } catch (error) {
      console.error("Error fetching surfboards:", error);
    }
  };

  if (!hydrated) {
    return null;
  }

  return (
    <Box p={5}>
      <Heading mb={4}>Available Surfboards</Heading>

      {/* User Info */}
      {user ? (
        <VStack mt={4} spacing={3}>
          <Text fontSize="lg">Logged in as: {user.name}</Text>
          <Text>
            Manage your surfboards in your <a href="/dashboard">dashboard</a>.
          </Text>
          <Text onClick={logout} style={{ cursor: "pointer", color: "red" }}>Logout</Text>
        </VStack>
      ) : (
        <Text mt={4}>
          <a href="/login">Login</a> to rent or list surfboards.
        </Text>
      )}

      {/* Surfboard List */}
      <Box mt={4}>
        {surfboards.length > 0 ? (
          surfboards.map((board) => (
            <SurfboardCard
              key={board.id}
              id={board.id}
              title={board.title}
              condition={board.condition}
            />
          ))
        ) : (
          <Text>No surfboards available.</Text>
        )}
      </Box>
    </Box>
  );
}
