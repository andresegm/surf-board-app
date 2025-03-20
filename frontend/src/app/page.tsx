"use client";

import { Box, Heading, Text, Button, VStack, Center } from "@chakra-ui/react";
import { useAuth } from "./authContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box
      w="100vw"
      h="100vh"
      bgImage="url('/hero.jpg')"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Center bg="rgba(0, 0, 0, 0.5)" p={10} borderRadius="lg" flexDir="column">
        <Heading mb={4} color="white" fontSize="4xl" textAlign="center">
          Welcome to Surfing Board App
        </Heading>
        <Text fontSize="lg" mb={6} color="gray.200" textAlign="center">
          Rent, buy, or list your surfboards hassle-free. Join the surfing community today!
        </Text>

        <VStack spacing={4}>
          <Button size="lg" colorScheme="blue" onClick={() => router.push("/surfboards")}>
            Browse Surfboards
          </Button>
          {!user ? (
            <>
              <Button size="lg" colorScheme="green" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Text color="gray.300">or <a href="/register" style={{ color: "white", textDecoration: "underline" }}>Sign Up</a></Text>
            </>
          ) : (
            <Button size="lg" colorScheme="purple" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          )}
        </VStack>
      </Center>
    </Box>
  );
}
