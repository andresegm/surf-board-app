"use client";

import { Box, HStack, Button, Text, Link } from "@chakra-ui/react";
import { useAuth } from "../authContext";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <Box p={4} borderBottom="1px solid #ddd">
            <HStack justify="space-between">
                <Link href="/" fontSize="xl" fontWeight="bold">Surfing Board App</Link>
                <HStack spacing={4}>
                    <Link href="/">Home</Link>
                    {user ? (
                        <>
                            <Link href="/dashboard">Dashboard</Link>
                            <Text>Welcome, {user.name}</Text>
                            <Button size="sm" colorScheme="red" onClick={logout}>Logout</Button>
                        </>
                    ) : (
                        <Link href="/login">Login</Link>
                    )}
                </HStack>
            </HStack>
        </Box>
    );
}
