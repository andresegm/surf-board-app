"use client";

import {
  Box,
  HStack,
  Button,
  Text,
  Link,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../authContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggleColorMode } = useColorMode();
  const bg = useColorModeValue("whiteAlpha.900", "gray.800");
  const color = useColorModeValue("blue.600", "blue.300");
  const toggleIcon = useColorModeValue(<MoonIcon />, <SunIcon />);

  return (
    <Box
      px={8}
      py={4}
      bg={bg}
      boxShadow="sm"
      position="sticky"
      top="0"
      zIndex="10"
      backdropFilter="blur(10px)"
    >
      <Flex justify="space-between" align="center">
        <Link href="/" fontSize="2xl" fontWeight="bold" color={color}>
          Surfing Board App
        </Link>

        <HStack spacing={6}>
          <Link href="/surfboards" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
            Browse
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                Dashboard
              </Link>
              <Text fontWeight="medium">Hi, {user.name.split(" ")[0]}</Text>
              <Button size="sm" colorScheme="red" variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" colorScheme="blue" variant="solid">
                Login
              </Button>
            </Link>
          )}
          <IconButton
            aria-label="Toggle color mode"
            icon={toggleIcon}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
        </HStack>
      </Flex>
    </Box>
  );
}
