"use client";

import { useState, useEffect } from "react";
import { Box, Button, Input, VStack, Text, Select, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const toast = useToast();


  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        toast({
          title: "Registration successful",
          description: "Welcome! You're now logged in.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
       else {
        const data = await res.json();
        setError(data.error || "Failed to register.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <Box p={5} maxW="400px" mx="auto">
      <VStack spacing={4}>
        <Text fontSize="xl">Register</Text>
        <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="partner">Partner</option>
        </Select>
        {error && <Text color="red.500">{error}</Text>}
        <Button colorScheme="green" onClick={handleRegister}>Sign Up</Button>
      </VStack>
    </Box>
  );
}
