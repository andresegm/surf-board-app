"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  Image,
  Badge,
  Button,
  Divider,
  HStack,
  VStack,
  Grid,
  GridItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  Avatar,
  IconButton
} from "@chakra-ui/react";
import { ChevronLeftIcon, CalendarIcon, InfoIcon, StarIcon } from "@chakra-ui/icons";
import { useAuth } from "../../authContext";

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
  storage_partner_name?: string;
  storage_partner_location?: string;
}

export default function SurfboardDetailPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [surfboard, setSurfboard] = useState<Surfboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [rentalDates, setRentalDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`http://localhost:5050/surfboards/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch surfboard");
        }

        const data = await res.json();
        setSurfboard(data);

        // In a real app, you might fetch owner info in a separate call
        // or have it included in the board data
        setOwnerEmail("surfer@example.com"); // Simulated owner email
      } catch (err) {
        console.error("Error fetching board:", err);
        toast({
          title: "Error",
          description: "Failed to load surfboard details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id, toast]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRentalDates({
      ...rentalDates,
      [name]: value
    });

    // Calculate total price if both dates are set
    if (name === 'endDate' && rentalDates.startDate && value) {
      calculateTotalPrice(rentalDates.startDate, value);
    } else if (name === 'startDate' && value && rentalDates.endDate) {
      calculateTotalPrice(value, rentalDates.endDate);
    }
  };

  const calculateTotalPrice = (start: string, end: string) => {
    if (!surfboard?.price_per_day) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Calculate days difference
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 1) {
      setTotalPrice(0);
      return;
    }

    setTotalPrice(daysDiff * surfboard.price_per_day);
  };

  const handleRentalSubmit = async () => {
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

    if (!rentalDates.startDate || !rentalDates.endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5050/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          surfboard_id: surfboard?.id,
          start_date: rentalDates.startDate,
          end_date: rentalDates.endDate
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create rental request");
      }

      toast({
        title: "Success",
        description: "Rental request submitted! The owner will review your request.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePurchaseRequest = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to purchase a surfboard",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // This would be replaced with actual purchase flow
    // involving Stripe or other payment processor
    toast({
      title: "Purchase Request",
      description: "Purchase feature coming soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) return (
    <Flex justify="center" align="center" height="50vh">
      <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
    </Flex>
  );

  if (!surfboard) return (
    <Box p={6} textAlign="center">
      <Heading mb={4}>Board Not Found</Heading>
      <Text mb={6}>The surfboard you're looking for doesn't exist or has been removed.</Text>
      <Button colorScheme="blue" onClick={() => router.push('/surfboards')}>
        Browse Other Boards
      </Button>
    </Box>
  );

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Button
        leftIcon={<ChevronLeftIcon />}
        variant="ghost"
        mb={6}
        onClick={() => router.back()}
      >
        Back to Results
      </Button>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
        {/* Left Column - Image */}
        <GridItem>
          <Image
            src={surfboard.image_url || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'}
            alt={surfboard.title}
            borderRadius="lg"
            objectFit="cover"
            width="100%"
            height={{ base: "300px", md: "400px" }}
          />
        </GridItem>

        {/* Right Column - Details */}
        <GridItem>
          <VStack align="start" spacing={4}>
            <Heading>{surfboard.title}</Heading>

            <HStack spacing={2}>
              <Badge colorScheme="blue">{surfboard.condition}</Badge>
              {surfboard.for_rent && <Badge colorScheme="green">For Rent</Badge>}
              {surfboard.for_sale && <Badge colorScheme="purple">For Sale</Badge>}
              {surfboard.is_stored && <Badge colorScheme="orange">Stored with Partner</Badge>}
            </HStack>

            <Text fontSize="lg">{surfboard.description || "No description provided."}</Text>

            {surfboard.dimensions && (
              <Text><strong>Dimensions:</strong> {surfboard.dimensions}</Text>
            )}

            {surfboard.location && (
              <Text><strong>Location:</strong> {surfboard.location}</Text>
            )}

            {surfboard.is_stored && surfboard.storage_partner_name && (
              <Box bg="orange.50" p={3} borderRadius="md" width="100%">
                <Text fontWeight="bold">Currently stored with:</Text>
                <Text>{surfboard.storage_partner_name} in {surfboard.storage_partner_location}</Text>
              </Box>
            )}

            {/* Pricing Section */}
            <Divider my={2} />

            <Flex width="100%" justify="space-between" align="center">
              {surfboard.for_rent && surfboard.price_per_day && (
                <Text color="blue.600" fontSize="2xl" fontWeight="bold">
                  ${surfboard.price_per_day}/day
                </Text>
              )}

              {surfboard.for_sale && surfboard.sale_price && (
                <Text color="green.600" fontSize="2xl" fontWeight="bold">
                  ${surfboard.sale_price}
                </Text>
              )}
            </Flex>

            {/* Action Buttons */}
            <HStack spacing={4} width="100%" mt={4}>
              {surfboard.for_rent && (
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<CalendarIcon />}
                  flexGrow={1}
                  onClick={onOpen}
                  isDisabled={surfboard.owner_id === user?.id}
                >
                  Rent This Board
                </Button>
              )}

              {surfboard.for_sale && (
                <Button
                  colorScheme="green"
                  size="lg"
                  flexGrow={1}
                  onClick={handlePurchaseRequest}
                  isDisabled={surfboard.owner_id === user?.id}
                >
                  Buy Now
                </Button>
              )}
            </HStack>

            {/* Owner Section */}
            {surfboard.owner_id === user?.id ? (
              <Alert status="info" mt={4} borderRadius="md">
                <AlertIcon />
                This is your own surfboard listing
              </Alert>
            ) : (
              <Box mt={4} p={4} borderWidth="1px" borderRadius="md" width="100%">
                <Flex align="center">
                  <Avatar size="md" mr={4} name="Surfer Owner" />
                  <Box>
                    <Text fontWeight="bold">Contact the owner</Text>
                    {ownerEmail && <Text>{ownerEmail}</Text>}
                  </Box>
                </Flex>
              </Box>
            )}
          </VStack>
        </GridItem>
      </Grid>

      {/* Rental Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rent This Surfboard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  name="startDate"
                  value={rentalDates.startDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  name="endDate"
                  value={rentalDates.endDate}
                  onChange={handleDateChange}
                  min={rentalDates.startDate || new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              {totalPrice > 0 && (
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold">Total Rental Cost:</Text>
                  <Text fontSize="2xl" color="blue.600">${totalPrice.toFixed(2)}</Text>
                  <Text fontSize="sm" color="gray.600">
                    ${surfboard.price_per_day}/day × {Math.ceil((new Date(rentalDates.endDate).getTime() - new Date(rentalDates.startDate).getTime()) / (1000 * 3600 * 24))} days
                  </Text>
                </Box>
              )}

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                Your payment will be processed once the owner approves your request.
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleRentalSubmit}
              isDisabled={!rentalDates.startDate || !rentalDates.endDate || totalPrice <= 0}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
