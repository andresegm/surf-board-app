"use client";

import { Box, Text, HStack, Button } from "@chakra-ui/react";

interface SurfboardProps {
    id: number;
    title: string;
    condition: string;
    onEdit?: () => void;
    onDelete?: () => void;
    isOwner?: boolean;
}

export default function SurfboardCard({ id, title, condition, onEdit, onDelete, isOwner }: SurfboardProps) {
    return (
        <Box p={3} border="1px solid #ddd" borderRadius="md" mb={2}>
            <Text fontWeight="bold">{title}</Text>
            <Text>Condition: {condition}</Text>
            {isOwner && (
                <HStack mt={2}>
                    <Button colorScheme="yellow" size="sm" onClick={onEdit}>
                        Edit
                    </Button>
                    <Button colorScheme="red" size="sm" onClick={onDelete}>
                        Delete
                    </Button>
                </HStack>
            )}
        </Box>
    );
}
