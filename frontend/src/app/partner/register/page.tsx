"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Heading,
    Text,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Grid,
    GridItem,
    useToast,
    Divider,
    Card,
    CardBody,
    Icon,
    Flex,
    List,
    ListItem,
    ListIcon
} from "@chakra-ui/react";
import { CheckCircleIcon, InfoIcon, StarIcon } from "@chakra-ui/icons";
import { useAuth } from "../../authContext";

export default function PartnerRegistrationPage() {
    const router = useRouter();
    const toast = useToast();
    const { user } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        address: "",
        contact_email: "",
        contact_phone: "",
        commission_rate: 15,
        max_capacity: 10
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleNumberChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please login to register as a partner",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Validation
        if (!formData.name || !formData.location || !formData.address || !formData.contact_email) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("http://localhost:5050/partners/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to register as partner");
            }

            toast({
                title: "Registration Successful",
                description: "Your partner application has been submitted for review",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Redirect to dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <Box p={6} textAlign="center">
                <Alert
                    status="warning"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    p={6}
                    borderRadius="lg"
                >
                    <AlertIcon boxSize="40px" mr={0} />
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                        Authentication Required
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                        You need to be logged in to register as a storage partner.
                    </AlertDescription>
                    <Button mt={4} colorScheme="blue" onClick={() => router.push('/login')}>
                        Login
                    </Button>
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={6} maxW="1200px" mx="auto">
            <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={8}>
                <GridItem>
                    <Heading mb={2}>Become a Storage Partner</Heading>
                    <Text mb={6} color="gray.600">
                        Join our network of storage partners and earn commission on surfboard rentals and sales.
                    </Text>

                    <form onSubmit={handleSubmit}>
                        <VStack spacing={6} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Business Name</FormLabel>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your business name"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Tell us about your business"
                                    rows={4}
                                />
                            </FormControl>

                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Location</FormLabel>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Country"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Full Address</FormLabel>
                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Full address"
                                    />
                                </FormControl>
                            </Grid>

                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Contact Email</FormLabel>
                                    <Input
                                        name="contact_email"
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        placeholder="Business email"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <Input
                                        name="contact_phone"
                                        value={formData.contact_phone}
                                        onChange={handleChange}
                                        placeholder="Business phone"
                                    />
                                </FormControl>
                            </Grid>

                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                <FormControl isRequired>
                                    <FormLabel>Commission Rate (%)</FormLabel>
                                    <NumberInput
                                        min={5}
                                        max={30}
                                        value={formData.commission_rate}
                                        onChange={(valueString) => handleNumberChange("commission_rate", valueString)}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <Text fontSize="sm" color="gray.500" mt={1}>
                                        The percentage you'll receive from rentals and sales
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Maximum Capacity</FormLabel>
                                    <NumberInput
                                        min={1}
                                        max={100}
                                        value={formData.max_capacity}
                                        onChange={(valueString) => handleNumberChange("max_capacity", valueString)}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <Text fontSize="sm" color="gray.500" mt={1}>
                                        How many surfboards you can store
                                    </Text>
                                </FormControl>
                            </Grid>

                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                Your application will be reviewed by our team. This process typically takes 1-2 business days.
                            </Alert>

                            <Button
                                type="submit"
                                colorScheme="green"
                                size="lg"
                                isLoading={isSubmitting}
                                loadingText="Submitting"
                            >
                                Submit Application
                            </Button>
                        </VStack>
                    </form>
                </GridItem>

                <GridItem>
                    <Card borderRadius="lg" boxShadow="md" height="fit-content" position="sticky" top="20px">
                        <CardBody>
                            <Heading size="md" mb={4}>Benefits of Being a Partner</Heading>

                            <List spacing={3} mb={6}>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Earn commission on rentals and sales
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Drive new customers to your business
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Manage inventory and transactions online
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Set your own commission rates
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Get priority listing in search results
                                </ListItem>
                            </List>

                            <Divider my={4} />

                            <Heading size="sm" mb={3}>How It Works</Heading>
                            <VStack align="start" spacing={4}>
                                <Flex>
                                    <Box minW="30px" mr={2} textAlign="center">
                                        <Icon as={InfoIcon} w={6} h={6} color="blue.500" />
                                    </Box>
                                    <Text>
                                        <strong>Accept Storage Requests:</strong> Approve or decline surfboard storage requests from travelers.
                                    </Text>
                                </Flex>

                                <Flex>
                                    <Box minW="30px" mr={2} textAlign="center">
                                        <Icon as={InfoIcon} w={6} h={6} color="blue.500" />
                                    </Box>
                                    <Text>
                                        <strong>Manage Boards:</strong> Keep track of all boards in your storage facility.
                                    </Text>
                                </Flex>

                                <Flex>
                                    <Box minW="30px" mr={2} textAlign="center">
                                        <Icon as={InfoIcon} w={6} h={6} color="blue.500" />
                                    </Box>
                                    <Text>
                                        <strong>Facilitate Rentals and Sales:</strong> Assist in the exchange of boards between owners and renters/buyers.
                                    </Text>
                                </Flex>

                                <Flex>
                                    <Box minW="30px" mr={2} textAlign="center">
                                        <Icon as={InfoIcon} w={6} h={6} color="blue.500" />
                                    </Box>
                                    <Text>
                                        <strong>Get Paid:</strong> Receive your commission automatically through our payment system.
                                    </Text>
                                </Flex>
                            </VStack>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </Box>
    );
} 