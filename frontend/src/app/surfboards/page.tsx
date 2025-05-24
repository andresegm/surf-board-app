"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Grid,
    Card,
    CardBody,
    Image,
    Stack,
    Divider,
    Badge,
    ButtonGroup,
    Button,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Link from "next/link";

interface Surfboard {
    id: number;
    title: string;
    condition: string;
    description?: string;
    owner_id: number;
    price_per_day?: number;
    sale_price?: number;
    image_url?: string;
    dimensions?: string;
    location?: string;
    for_rent?: boolean;
    for_sale?: boolean;
}

export default function SurfboardsPage() {
    const [surfboards, setSurfboards] = useState<Surfboard[]>([]);
    const [filteredBoards, setFilteredBoards] = useState<Surfboard[]>([]);
    const [hydrated, setHydrated] = useState(false);
    const { user } = useAuth();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriteria, setFilterCriteria] = useState({
        for_rent: false,
        for_sale: false,
        condition: '',
        location: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        setHydrated(true);
        fetchSurfboards();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [surfboards, searchTerm, filterCriteria]);

    const fetchSurfboards = async () => {
        try {
            const res = await fetch("http://localhost:5050/surfboards", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch surfboards");
            }

            const data: Surfboard[] = await res.json();
            setSurfboards(data);
            setFilteredBoards(data);
        } catch (error) {
            console.error("Error fetching surfboards:", error);
            toast({
                title: "Error",
                description: "Could not load surfboards",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRentRequest = async (boardId: number) => {
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please login to rent a surfboard",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // In a real implementation, this would open a date picker modal
        // and then send the rental request to the backend
        toast({
            title: "Rental Request",
            description: "Feature coming soon!",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const applyFilters = () => {
        let filtered = [...surfboards];

        // Text search
        if (searchTerm) {
            filtered = filtered.filter(board =>
                board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (board.location && board.location.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Type filters
        if (filterCriteria.for_rent) {
            filtered = filtered.filter(board => board.for_rent);
        }

        if (filterCriteria.for_sale) {
            filtered = filtered.filter(board => board.for_sale);
        }

        // Condition filter
        if (filterCriteria.condition) {
            filtered = filtered.filter(board => board.condition === filterCriteria.condition);
        }

        // Location filter
        if (filterCriteria.location) {
            filtered = filtered.filter(board =>
                board.location && board.location.toLowerCase().includes(filterCriteria.location.toLowerCase())
            );
        }

        // Price range
        if (filterCriteria.minPrice) {
            const minPrice = parseFloat(filterCriteria.minPrice);
            filtered = filtered.filter(board =>
                (board.price_per_day && board.price_per_day >= minPrice) ||
                (board.sale_price && board.sale_price >= minPrice)
            );
        }

        if (filterCriteria.maxPrice) {
            const maxPrice = parseFloat(filterCriteria.maxPrice);
            filtered = filtered.filter(board =>
                (board.price_per_day && board.price_per_day <= maxPrice) ||
                (board.sale_price && board.sale_price <= maxPrice)
            );
        }

        setFilteredBoards(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterCriteria({
            for_rent: false,
            for_sale: false,
            condition: '',
            location: '',
            minPrice: '',
            maxPrice: ''
        });
    };

    const handleFilterChange = (name: string, value: string | boolean) => {
        setFilterCriteria({
            ...filterCriteria,
            [name]: value
        });
    };

    if (!hydrated) {
        return null;
    }

    return (
        <Box p={5}>
            <Heading mb={4}>Browse Surfboards</Heading>

            {/* Search and Filter Bar */}
            <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
                mb={6}
                gap={4}
            >
                <InputGroup maxW={{ base: "full", md: "400px" }}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search boards"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <HStack>
                    <Button colorScheme="blue" variant="outline" onClick={onOpen}>
                        Filters
                    </Button>
                    <Select
                        placeholder="Sort by"
                        maxW="200px"
                        onChange={(e) => {
                            const value = e.target.value;
                            let sorted = [...filteredBoards];

                            if (value === 'price_asc') {
                                sorted.sort((a, b) => (a.price_per_day || 9999) - (b.price_per_day || 9999));
                            } else if (value === 'price_desc') {
                                sorted.sort((a, b) => (b.price_per_day || 0) - (a.price_per_day || 0));
                            } else if (value === 'newest') {
                                // In a real app, you'd sort by created_at date
                                // This is a placeholder
                                sorted.sort((a, b) => b.id - a.id);
                            }

                            setFilteredBoards(sorted);
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </Select>
                </HStack>
            </Flex>

            {/* Results count */}
            <Text mb={4} color="gray.600">
                Showing {filteredBoards.length} of {surfboards.length} surfboards
            </Text>

            {/* Surfboard Grid */}
            {filteredBoards.length > 0 ? (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                        xl: "repeat(4, 1fr)"
                    }}
                    gap={6}
                >
                    {filteredBoards.map((board) => (
                        <Card key={board.id} maxW="sm" overflow="hidden" boxShadow="md" borderRadius="lg">
                            <Link href={`/surfboards/${board.id}`}>
                                <Image
                                    src={board.image_url || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
                                    alt={board.title}
                                    borderTopRadius="lg"
                                    objectFit="cover"
                                    height="200px"
                                    width="100%"
                                    transition="0.3s"
                                    _hover={{ transform: 'scale(1.03)' }}
                                />
                            </Link>
                            <CardBody>
                                <Stack spacing="3">
                                    <Heading size="md">{board.title}</Heading>
                                    {board.location && (
                                        <Text fontSize="sm" color="gray.500">
                                            {board.location}
                                        </Text>
                                    )}
                                    <HStack>
                                        <Badge colorScheme="blue">{board.condition}</Badge>
                                        {board.for_rent && <Badge colorScheme="green">For Rent</Badge>}
                                        {board.for_sale && <Badge colorScheme="purple">For Sale</Badge>}
                                    </HStack>
                                    <Text noOfLines={2} fontSize="sm">
                                        {board.description || "No description provided."}
                                    </Text>
                                    <Flex justify="space-between" align="center">
                                        {board.for_rent && board.price_per_day && (
                                            <Text color="blue.600" fontSize="lg" fontWeight="bold">
                                                ${board.price_per_day}/day
                                            </Text>
                                        )}
                                        {board.for_sale && board.sale_price && (
                                            <Text color="green.600" fontSize="lg" fontWeight="bold">
                                                ${board.sale_price}
                                            </Text>
                                        )}

                                        {board.for_rent && (
                                            <Button
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRentRequest(board.id);
                                                }}
                                            >
                                                Rent
                                            </Button>
                                        )}
                                    </Flex>
                                </Stack>
                            </CardBody>
                        </Card>
                    ))}
                </Grid>
            ) : (
                <Box textAlign="center" py={10}>
                    <Text fontSize="xl">No surfboards found matching your criteria</Text>
                    <Button mt={4} colorScheme="blue" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </Box>
            )}

            {/* Filter Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Filter Surfboards</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Text fontWeight="bold" mb={2}>Type</Text>
                                <HStack>
                                    <Button
                                        colorScheme={filterCriteria.for_rent ? "green" : "gray"}
                                        variant={filterCriteria.for_rent ? "solid" : "outline"}
                                        onClick={() => handleFilterChange("for_rent", !filterCriteria.for_rent)}
                                    >
                                        For Rent
                                    </Button>
                                    <Button
                                        colorScheme={filterCriteria.for_sale ? "purple" : "gray"}
                                        variant={filterCriteria.for_sale ? "solid" : "outline"}
                                        onClick={() => handleFilterChange("for_sale", !filterCriteria.for_sale)}
                                    >
                                        For Sale
                                    </Button>
                                </HStack>
                            </Box>

                            <Box>
                                <Text fontWeight="bold" mb={2}>Condition</Text>
                                <Select
                                    placeholder="Any condition"
                                    value={filterCriteria.condition}
                                    onChange={(e) => handleFilterChange("condition", e.target.value)}
                                >
                                    <option value="New">New</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Poor">Poor</option>
                                </Select>
                            </Box>

                            <Box>
                                <Text fontWeight="bold" mb={2}>Location</Text>
                                <Input
                                    placeholder="Enter location"
                                    value={filterCriteria.location}
                                    onChange={(e) => handleFilterChange("location", e.target.value)}
                                />
                            </Box>

                            <Box>
                                <Text fontWeight="bold" mb={2}>Price Range</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min $"
                                        type="number"
                                        value={filterCriteria.minPrice}
                                        onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                                    />
                                    <Text>to</Text>
                                    <Input
                                        placeholder="Max $"
                                        type="number"
                                        value={filterCriteria.maxPrice}
                                        onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                                    />
                                </HStack>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={clearFilters}>
                            Clear All
                        </Button>
                        <Button colorScheme="blue" onClick={onClose}>
                            Apply Filters
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
