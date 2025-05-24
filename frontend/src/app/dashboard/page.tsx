"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import {
    Box,
    Heading,
    Text,
    VStack,
    Input,
    Button,
    Select,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    Flex,
    Badge,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    NumberInput,
    NumberInputField,
    Switch,
    Grid,
    GridItem,
    Card,
    CardBody,
    Stack,
    Image,
    Divider,
    CardFooter,
    ButtonGroup,
    useToast
} from "@chakra-ui/react";
import SurfboardCard from "../components/SurfboardCard";

interface Surfboard {
    id: number;
    title: string;
    condition: string;
    owner_id: number;
    description?: string;
    price_per_day?: number;
    sale_price?: number;
    image_url?: string;
    dimensions?: string;
    location?: string;
    for_rent?: boolean;
    for_sale?: boolean;
    is_stored?: boolean;
    storage_partner_id?: number;
}

interface Rental {
    id: number;
    surfboard_id: number;
    surfboard_title: string;
    surfboard_image?: string;
    start_date: string;
    end_date: string;
    status: string;
    total_amount: number;
    owner_id: number;
    renter_id: number;
}

interface Partner {
    id: number;
    name: string;
    location: string;
    address: string;
    is_verified: boolean;
}

const validConditions = ["New", "Excellent", "Good", "Fair", "Poor"];

export default function Dashboard() {
    const { user } = useAuth();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // State for my surfboards
    const [mySurfboards, setMySurfboards] = useState<Surfboard[]>([]);
    const [editBoard, setEditBoard] = useState<Surfboard | null>(null);

    // State for rentals
    const [myRentals, setMyRentals] = useState<Rental[]>([]);
    const [rentalRole, setRentalRole] = useState<string>("all");

    // State for storage partners
    const [storagePartners, setStoragePartners] = useState<Partner[]>([]);
    const [myPartnerProfile, setMyPartnerProfile] = useState<Partner | null>(null);

    // Form state for new/edit surfboard
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        condition: "",
        dimensions: "",
        location: "",
        price_per_day: "",
        sale_price: "",
        image_url: "",
        for_rent: false,
        for_sale: false
    });

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        if (user) {
            fetchMySurfboards();
            fetchMyRentals();
            fetchStoragePartners();
            checkForPartnerProfile();
        }
    }, [user]);

    // SURFBOARD FUNCTIONS
    const fetchMySurfboards = async () => {
        try {
            const res = await fetch("http://localhost:5050/surfboards/my-boards", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch your surfboards");
            }

            const data = await res.json();
            setMySurfboards(data);
        } catch (error) {
            console.error("Error fetching surfboards:", error);
            toast({
                title: "Error",
                description: "Could not load your surfboards",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleOpenAddEditModal = (board?: Surfboard) => {
        if (board) {
            setEditBoard(board);
            setFormData({
                title: board.title,
                description: board.description || "",
                condition: board.condition,
                dimensions: board.dimensions || "",
                location: board.location || "",
                price_per_day: board.price_per_day?.toString() || "",
                sale_price: board.sale_price?.toString() || "",
                image_url: board.image_url || "",
                for_rent: !!board.for_rent,
                for_sale: !!board.for_sale
            });
        } else {
            setEditBoard(null);
            setFormData({
                title: "",
                description: "",
                condition: "",
                dimensions: "",
                location: "",
                price_per_day: "",
                sale_price: "",
                image_url: "",
                for_rent: false,
                for_sale: false
            });
        }
        onOpen();
    };

    const handleSubmitSurfboard = async () => {
        // Validation
        if (!formData.title || !formData.condition) {
            toast({
                title: "Error",
                description: "Title and condition are required",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const payload = {
                ...formData,
                price_per_day: formData.price_per_day ? parseFloat(formData.price_per_day) : null,
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null
            };

            if (editBoard) {
                // Update
                const res = await fetch(`http://localhost:5050/surfboards/${editBoard.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to update surfboard");

                toast({
                    title: "Success",
                    description: "Surfboard updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Create
                const res = await fetch("http://localhost:5050/surfboards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to create surfboard");

                toast({
                    title: "Success",
                    description: "Surfboard added successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }

            fetchMySurfboards();
            onClose();
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: "Operation failed",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeleteSurfboard = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this surfboard?")) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5050/surfboards/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (res.ok) {
                setMySurfboards(mySurfboards.filter((board) => board.id !== id));
                toast({
                    title: "Success",
                    description: "Surfboard deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete surfboard");
            }
        } catch (error: any) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: error.message || "Could not delete surfboard",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData({
            ...formData,
            [name]: checked
        });
    };

    // RENTALS FUNCTIONS
    const fetchMyRentals = async () => {
        try {
            const res = await fetch(`http://localhost:5050/rentals?role=${rentalRole}`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch rentals");
            }

            const data = await res.json();
            setMyRentals(data);
        } catch (error) {
            console.error("Error fetching rentals:", error);
            toast({
                title: "Error",
                description: "Could not load your rentals",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRentalAction = async (rentalId: number, action: string) => {
        try {
            const res = await fetch(`http://localhost:5050/rentals/${rentalId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: action }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || `Failed to ${action} rental`);
            }

            toast({
                title: "Success",
                description: `Rental ${action} successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            fetchMyRentals();
        } catch (error: any) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // STORAGE PARTNERS FUNCTIONS
    const fetchStoragePartners = async () => {
        try {
            const res = await fetch("http://localhost:5050/partners", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch storage partners");
            }

            const data = await res.json();
            setStoragePartners(data);
        } catch (error) {
            console.error("Error fetching storage partners:", error);
        }
    };

    const checkForPartnerProfile = async () => {
        try {
            // A real implementation would check if the current user has a partner profile
            // This is simplified for demo purposes
            // setMyPartnerProfile(null);
        } catch (error) {
            console.error("Error checking for partner profile:", error);
        }
    };

    const storeSurfboardWithPartner = async (boardId: number, partnerId: number) => {
        try {
            const res = await fetch(`http://localhost:5050/surfboards/${boardId}/store`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ storage_partner_id: partnerId }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to store surfboard");
            }

            toast({
                title: "Success",
                description: "Surfboard storage request submitted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            fetchMySurfboards();
        } catch (error: any) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (!hydrated) {
        return null;
    }

    return (
        <Box p={5}>
            <Heading mb={6}>My Dashboard</Heading>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab>My Boards</Tab>
                    <Tab>My Rentals</Tab>
                    <Tab>Storage</Tab>
                    {myPartnerProfile && <Tab>Partner Dashboard</Tab>}
                </TabList>

                <TabPanels>
                    {/* My Boards Panel */}
                    <TabPanel>
                        <Flex justify="space-between" align="center" mb={6}>
                            <Heading size="md">My Surfboards</Heading>
                            <Button colorScheme="blue" onClick={() => handleOpenAddEditModal()}>
                                Add New Surfboard
                            </Button>
                        </Flex>

                        {mySurfboards.length > 0 ? (
                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                                {mySurfboards.map((board) => (
                                    <Card key={board.id} maxW="sm" boxShadow="md" borderRadius="lg" overflow="hidden">
                                        <CardBody>
                                            <Image
                                                src={board.image_url || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
                                                alt={board.title}
                                                borderRadius="md"
                                                objectFit="cover"
                                                height="200px"
                                                width="100%"
                                            />
                                            <Stack mt="6" spacing="3">
                                                <Heading size="md">{board.title}</Heading>
                                                <Text noOfLines={2}>{board.description || "No description"}</Text>
                                                <HStack>
                                                    <Badge colorScheme="blue">{board.condition}</Badge>
                                                    {board.for_rent && <Badge colorScheme="green">For Rent</Badge>}
                                                    {board.for_sale && <Badge colorScheme="purple">For Sale</Badge>}
                                                    {board.is_stored && <Badge colorScheme="orange">Stored</Badge>}
                                                </HStack>
                                                {board.for_rent && (
                                                    <Text color="blue.600" fontSize="lg">
                                                        ${board.price_per_day}/day
                                                    </Text>
                                                )}
                                                {board.for_sale && (
                                                    <Text color="green.600" fontSize="lg">
                                                        ${board.sale_price}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </CardBody>
                                        <Divider />
                                        <CardFooter>
                                            <ButtonGroup spacing="2">
                                                <Button variant="solid" colorScheme="blue" onClick={() => handleOpenAddEditModal(board)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" colorScheme="red" onClick={() => handleDeleteSurfboard(board.id)}>
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </Grid>
                        ) : (
                            <Box textAlign="center" py={10} px={6}>
                                <Text fontSize="xl">You haven't added any surfboards yet.</Text>
                                <Button mt={4} colorScheme="blue" onClick={() => handleOpenAddEditModal()}>
                                    Add Your First Surfboard
                                </Button>
                            </Box>
                        )}
                    </TabPanel>

                    {/* My Rentals Panel */}
                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            <Flex justify="space-between" align="center">
                                <Heading size="md">My Rentals</Heading>
                                <Select
                                    maxW="200px"
                                    value={rentalRole}
                                    onChange={(e) => {
                                        setRentalRole(e.target.value);
                                        fetchMyRentals();
                                    }}
                                >
                                    <option value="all">All Rentals</option>
                                    <option value="renter">Where I'm Renting</option>
                                    <option value="owner">My Boards Rented Out</option>
                                </Select>
                            </Flex>

                            {myRentals.length > 0 ? (
                                <VStack spacing={4} align="stretch">
                                    {myRentals.map((rental) => (
                                        <Card key={rental.id} p={4} boxShadow="md">
                                            <Flex direction={{ base: "column", md: "row" }} justify="space-between">
                                                <Box>
                                                    <Heading size="sm">{rental.surfboard_title}</Heading>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                                                    </Text>
                                                    <Badge
                                                        colorScheme={
                                                            rental.status === 'approved' ? 'green' :
                                                                rental.status === 'pending' ? 'yellow' :
                                                                    rental.status === 'active' ? 'blue' :
                                                                        rental.status === 'completed' ? 'purple' : 'red'
                                                        }
                                                        mt={2}
                                                    >
                                                        {rental.status.toUpperCase()}
                                                    </Badge>
                                                </Box>
                                                <VStack align="flex-end">
                                                    <Text fontWeight="bold">${rental.total_amount.toFixed(2)}</Text>
                                                    {/* Conditional action buttons based on status and role */}
                                                    {rental.owner_id === user?.id ? (
                                                        <HStack mt={2}>
                                                            {rental.status === 'pending' && (
                                                                <>
                                                                    <Button size="sm" colorScheme="green" onClick={() => handleRentalAction(rental.id, 'approved')}>
                                                                        Approve
                                                                    </Button>
                                                                    <Button size="sm" colorScheme="red" onClick={() => handleRentalAction(rental.id, 'rejected')}>
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {rental.status === 'approved' && (
                                                                <Button size="sm" colorScheme="blue" onClick={() => handleRentalAction(rental.id, 'active')}>
                                                                    Mark as Active
                                                                </Button>
                                                            )}
                                                            {rental.status === 'active' && (
                                                                <Button size="sm" colorScheme="purple" onClick={() => handleRentalAction(rental.id, 'completed')}>
                                                                    Mark as Completed
                                                                </Button>
                                                            )}
                                                        </HStack>
                                                    ) : (
                                                        <HStack mt={2}>
                                                            {rental.status === 'pending' && (
                                                                <Button size="sm" colorScheme="red" onClick={() => handleRentalAction(rental.id, 'cancelled')}>
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </HStack>
                                                    )}
                                                </VStack>
                                            </Flex>
                                        </Card>
                                    ))}
                                </VStack>
                            ) : (
                                <Box textAlign="center" py={10} px={6}>
                                    <Text fontSize="xl">No rentals found.</Text>
                                    <Button mt={4} colorScheme="blue" as="a" href="/surfboards">
                                        Browse Surfboards
                                    </Button>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>

                    {/* Storage Panel */}
                    <TabPanel>
                        <Heading size="md" mb={6}>Storage Partners</Heading>

                        {storagePartners.length > 0 ? (
                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                                {storagePartners.map((partner) => (
                                    <Card key={partner.id} p={4} boxShadow="md">
                                        <Heading size="sm">{partner.name}</Heading>
                                        <Text mt={2}>{partner.location}</Text>
                                        <Text fontSize="sm" color="gray.600" mt={1}>{partner.address}</Text>

                                        <Button
                                            mt={4}
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => {
                                                // Simplified - in a real app this would open a modal to select which board to store
                                                if (mySurfboards.length > 0) {
                                                    storeSurfboardWithPartner(mySurfboards[0].id, partner.id);
                                                } else {
                                                    toast({
                                                        title: "Error",
                                                        description: "You need to add a surfboard first",
                                                        status: "warning",
                                                        duration: 3000,
                                                        isClosable: true,
                                                    });
                                                }
                                            }}
                                        >
                                            Store Board Here
                                        </Button>
                                    </Card>
                                ))}
                            </Grid>
                        ) : (
                            <Box textAlign="center" py={10} px={6}>
                                <Text fontSize="xl">No storage partners available in your area.</Text>
                            </Box>
                        )}

                        <Divider my={8} />

                        <Box>
                            <Heading size="md" mb={4}>Become a Storage Partner</Heading>
                            <Text mb={4}>
                                Do you have space to store surfboards? Become a partner and earn commission on rentals and sales!
                            </Text>
                            <Button colorScheme="green" as="a" href="/partner/register">
                                Register as Partner
                            </Button>
                        </Box>
                    </TabPanel>

                    {/* Partner Dashboard Panel (Conditional) */}
                    {myPartnerProfile && (
                        <TabPanel>
                            <Heading size="md" mb={6}>Partner Dashboard</Heading>
                            <Text>Partner dashboard would be shown here</Text>
                        </TabPanel>
                    )}
                </TabPanels>
            </Tabs>

            {/* Add/Edit Surfboard Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editBoard ? "Edit Surfboard" : "Add New Surfboard"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    placeholder="Surfboard title"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Describe your surfboard"
                                />
                            </FormControl>

                            <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                                <FormControl isRequired>
                                    <FormLabel>Condition</FormLabel>
                                    <Select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleFormChange}
                                        placeholder="Select condition"
                                    >
                                        {validConditions.map(cond => (
                                            <option key={cond} value={cond}>{cond}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Dimensions</FormLabel>
                                    <Input
                                        name="dimensions"
                                        value={formData.dimensions}
                                        onChange={handleFormChange}
                                        placeholder="e.g. 6'2 x 19 x 2.5"
                                    />
                                </FormControl>
                            </Grid>

                            <FormControl>
                                <FormLabel>Location</FormLabel>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleFormChange}
                                    placeholder="Where is the board located?"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Image URL</FormLabel>
                                <Input
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleFormChange}
                                    placeholder="Paste an image URL"
                                />
                            </FormControl>

                            <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                                <FormControl>
                                    <FormLabel>Rental Price (per day)</FormLabel>
                                    <NumberInput min={0}>
                                        <NumberInputField
                                            name="price_per_day"
                                            value={formData.price_per_day}
                                            onChange={handleFormChange}
                                            placeholder="$"
                                        />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Sale Price</FormLabel>
                                    <NumberInput min={0}>
                                        <NumberInputField
                                            name="sale_price"
                                            value={formData.sale_price}
                                            onChange={handleFormChange}
                                            placeholder="$"
                                        />
                                    </NumberInput>
                                </FormControl>
                            </Grid>

                            <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
                                <FormControl display="flex" alignItems="center">
                                    <FormLabel mb="0">Available for Rent</FormLabel>
                                    <Switch
                                        isChecked={formData.for_rent}
                                        onChange={(e) => handleSwitchChange("for_rent", e.target.checked)}
                                        colorScheme="green"
                                    />
                                </FormControl>

                                <FormControl display="flex" alignItems="center">
                                    <FormLabel mb="0">Available for Sale</FormLabel>
                                    <Switch
                                        isChecked={formData.for_sale}
                                        onChange={(e) => handleSwitchChange("for_sale", e.target.checked)}
                                        colorScheme="purple"
                                    />
                                </FormControl>
                            </Grid>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmitSurfboard}>
                            {editBoard ? "Update" : "Add"}
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
