"use client";

import { useState, useEffect } from "react";
import { Box, Button, Input, VStack, Text } from "@chakra-ui/react";
import { useAuth } from "../authContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user, login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [hydrated, setHydrated] = useState(false);

    // Prevents server-side mismatch
    useEffect(() => {
        setHydrated(true);
        if (user) {
          router.replace("/dashboard");
        }
      }, [user]);
      

    if (!hydrated) {
        return null; // Render nothing until hydration is complete
    }

    const handleLogin = async () => {
        try {
            await login(email, password);
            router.push("/"); // Redirect to homepage after login
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <Box p={5} maxW="400px" mx="auto">
            <VStack spacing={4}>
                <Text fontSize="xl">Login</Text>
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <Text color="red.500">{error}</Text>}
                <Button colorScheme="blue" onClick={handleLogin}>Login</Button>
            </VStack>
        </Box>
    );
}
