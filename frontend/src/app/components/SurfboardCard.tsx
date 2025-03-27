import { Box, Text, HStack, Button } from "@chakra-ui/react";
import Link from "next/link";

interface SurfboardProps {
  id: number;
  title: string;
  condition: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export default function SurfboardCard({
  id,
  title,
  condition,
  onEdit,
  onDelete,
  isOwner,
}: SurfboardProps) {
  return (
    <Link href={`/surfboards/${id}`}>
      <Box
        p={4}
        border="1px solid #ddd"
        borderRadius="md"
        mb={3}
        transition="background 0.2s"
        _hover={{
          bg: "blue.100", // or 'blue.50' for a hint of color
          cursor: "pointer",
        }}
      >
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
    </Link>
  );
}

