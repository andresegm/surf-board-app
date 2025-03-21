"use client";

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Center,
  SimpleGrid,
  Card,
  CardBody,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAuth } from "./authContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box
      w="100%"
      h="100vh"
      bgImage="url('/hero.jpg')"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={4}
    >
      {/* Welcome Box */}
      <Center
        bg="rgba(0, 0, 0, 0.5)"
        p={8}
        borderRadius="lg"
        flexDir="column"
        maxW="600px"
        textAlign="center"
        mb={100}
      >
        <Heading mb={4} color="white" fontSize="4xl">
          Welcome to Surfing Board App
        </Heading>
        <Text fontSize="lg" mb={6} color="gray.200">
          Rent, buy, or store surfboards while traveling. Built for surfers by surfers.
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
              <Text color="gray.300">
                or{" "}
                <a href="/register" style={{ color: "white", textDecoration: "underline" }}>
                  Sign Up
                </a>
              </Text>
            </>
          ) : (
            <Button size="lg" colorScheme="purple" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          )}
        </VStack>
      </Center>

      {/* Info Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} maxW="1500px" w="100%">
        {[
          {
            title: "Rent Boards",
            text: "Find and rent quality surfboards wherever you're traveling — without paying premium shop prices.",
          },
          {
            title: "List Your Board",
            text: "Have a board you're not using? List it on our app and earn money while you travel or take a break.",
          },
          {
            title: "Partner With Us",
            text: "Rent out your extra space to store surfboards for traveling surfers. Earn commission on each rental and sale.",
          },
        ].map((card, index) => (
          <Card
            key={index}
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(4px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            color="white"
            borderRadius="lg"
            p={6}
            transition="all 0.3s ease"
            boxShadow="lg"
            _hover={{
              transform: "translateY(-8px)",
              boxShadow: "xl",
              bg: "rgba(0, 0, 0, 0.7)",
            }}
          >
            <CardBody>
              <Heading size="md" mb={3}>
                {card.title}
              </Heading>
              <Text>{card.text}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
