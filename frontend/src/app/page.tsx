"use client";

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Center,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Image,
  Stack,
  Icon,
  Container,
  Badge,
  Avatar,
  Grid,
  GridItem,
  useColorModeValue,
  Divider
} from "@chakra-ui/react";
import { useAuth } from "./authContext";
import { useRouter } from "next/navigation";
import { FaExchangeAlt, FaStore, FaMoneyBillWave, FaMapMarkedAlt, FaShippingFast, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";

interface Testimonial {
  name: string;
  location: string;
  text: string;
  image: string;
  rating: number;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const bgOverlay = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(0, 0, 0, 0.7)');
  const cardBg = useColorModeValue('white', 'gray.800');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const [featuredBoards, setFeaturedBoards] = useState([]);

  const testimonials: Testimonial[] = [
    {
      name: "Mike Johnson",
      location: "Hawaii, USA",
      text: "I was traveling to Bali and didn't want to bring my board. Found an amazing board for rent and the local storage partner made pickup a breeze!",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      rating: 5
    },
    {
      name: "Sarah Miller",
      location: "Sydney, Australia",
      text: "Made $400 renting out my board while I was away for two weeks. The storage partner took care of everything, and I didn't have to worry about a thing.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      rating: 5
    },
    {
      name: "Carlos Rodriguez",
      location: "Costa Rica",
      text: "As a surf shop owner, becoming a storage partner has brought me additional revenue and new customers. The platform is so easy to use!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      rating: 4
    }
  ];

  const fetchFeaturedBoards = async () => {
    try {
      const res = await fetch("http://localhost:5050/surfboards?featured=true", {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        // Just take the first 3 in a real implementation you might have a "featured" flag
        setFeaturedBoards(data.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching featured boards:", error);
    }
  };

  useEffect(() => {
    fetchFeaturedBoards();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        w="100%"
        h={{ base: "80vh", md: "90vh" }}
        bgImage="url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
        bgSize="cover"
        bgPosition="center"
        position="relative"
      >
        {/* Overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="rgba(0, 0, 0, 0.5)"
        />

        {/* Hero Content */}
        <Flex
          position="relative"
          zIndex="1"
          height="100%"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Container maxW="container.xl">
            <Grid templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }} gap={8}>
              <GridItem>
                <VStack
                  spacing={6}
                  align="flex-start"
                  maxW="700px"
                >
                  <Heading
                    size="2xl"
                    color="white"
                    lineHeight="1.2"
                    fontWeight="extrabold"
                  >
                    Your Surfboard Solution for Travelers
                  </Heading>
                  <Text fontSize="xl" color="white" fontWeight="medium">
                    Find, rent, sell, and store surfboards anywhere in the world.
                    The perfect platform for surfers who are always on the move.
                  </Text>

                  <HStack spacing={4} pt={4}>
                    <Button
                      size="lg"
                      colorScheme="blue"
                      onClick={() => router.push("/surfboards")}
                      px={8}
                    >
                      Browse Boards
                    </Button>

                    {!user ? (
                      <Button
                        size="lg"
                        colorScheme="whiteAlpha"
                        onClick={() => router.push("/register")}
                      >
                        Sign Up Free
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        colorScheme="whiteAlpha"
                        onClick={() => router.push("/dashboard")}
                      >
                        My Dashboard
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </GridItem>

              <GridItem display={{ base: "none", lg: "block" }}>
                <Card bg={bgOverlay} backdropFilter="blur(10px)" borderRadius="xl" overflow="hidden" boxShadow="xl">
                  <CardBody p={6}>
                    <VStack spacing={4} align="flex-start">
                      <Heading size="md" color={accentColor}>How It Works</Heading>

                      <HStack spacing={4} width="100%" py={2}>
                        <Flex
                          bg={accentColor}
                          color="white"
                          borderRadius="full"
                          width="40px"
                          height="40px"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          1
                        </Flex>
                        <Box>
                          <Text fontWeight="bold">Find a Board</Text>
                          <Text fontSize="sm">Browse boards available for rent or purchase near your destination</Text>
                        </Box>
                      </HStack>

                      <HStack spacing={4} width="100%" py={2}>
                        <Flex
                          bg={accentColor}
                          color="white"
                          borderRadius="full"
                          width="40px"
                          height="40px"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          2
                        </Flex>
                        <Box>
                          <Text fontWeight="bold">Rent or Buy</Text>
                          <Text fontSize="sm">Book your rental dates or purchase a board directly through our secure platform</Text>
                        </Box>
                      </HStack>

                      <HStack spacing={4} width="100%" py={2}>
                        <Flex
                          bg={accentColor}
                          color="white"
                          borderRadius="full"
                          width="40px"
                          height="40px"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          3
                        </Flex>
                        <Box>
                          <Text fontWeight="bold">Surf & Store</Text>
                          <Text fontSize="sm">When you're done, return the board or store your own with a verified partner</Text>
                        </Box>
                      </HStack>

                      <HStack spacing={4} width="100%" py={2}>
                        <Flex
                          bg={accentColor}
                          color="white"
                          borderRadius="full"
                          width="40px"
                          height="40px"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          4
                        </Flex>
                        <Box>
                          <Text fontWeight="bold">Earn Passive Income</Text>
                          <Text fontSize="sm">List your board for rent or sale while it's stored and earn money</Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </Container>
        </Flex>
      </Box>

      {/* Benefits Section */}
      <Box py={16} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={2} textAlign="center" maxW="700px">
              <Heading size="xl">Why Choose Our Platform?</Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                We solve common problems for traveling surfers and create opportunities for everyone involved
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} width="100%">
              <Card height="100%" boxShadow="md" borderRadius="lg" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="flex-start">
                    <Flex
                      bg="blue.50"
                      color="blue.600"
                      borderRadius="md"
                      p={3}
                    >
                      <Icon as={FaExchangeAlt} boxSize={6} />
                    </Flex>
                    <Heading size="md">Rent or Buy Anywhere</Heading>
                    <Text>Find quality boards in your destination without the hassle of transport or premium shop prices</Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card height="100%" boxShadow="md" borderRadius="lg" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="flex-start">
                    <Flex
                      bg="green.50"
                      color="green.600"
                      borderRadius="md"
                      p={3}
                    >
                      <Icon as={FaStore} boxSize={6} />
                    </Flex>
                    <Heading size="md">Safe Storage Solutions</Heading>
                    <Text>Store your board with verified partners when you're not using it, instead of selling at a loss</Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card height="100%" boxShadow="md" borderRadius="lg" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="flex-start">
                    <Flex
                      bg="purple.50"
                      color="purple.600"
                      borderRadius="md"
                      p={3}
                    >
                      <Icon as={FaMoneyBillWave} boxSize={6} />
                    </Flex>
                    <Heading size="md">Earn Passive Income</Heading>
                    <Text>Make money from your stored boards through rentals and sales, all handled securely</Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card height="100%" boxShadow="md" borderRadius="lg" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="flex-start">
                    <Flex
                      bg="orange.50"
                      color="orange.600"
                      borderRadius="md"
                      p={3}
                    >
                      <Icon as={FaMapMarkedAlt} boxSize={6} />
                    </Flex>
                    <Heading size="md">Global Network</Heading>
                    <Text>Connect with surfers and partners worldwide, making it easy to find boards wherever you travel</Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card height="100%" boxShadow="md" borderRadius="lg" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="flex-start">
                    <Flex
                      bg="red.50"
                      color="red.600"
                      borderRadius="md"
                      p={3}
                    >
                      <Icon as={FaShippingFast} boxSize={6} />
                    </Flex>
                    <Heading size="md">Convenient Exchange</Heading>
                    <Text>Our storage partners facilitate easy pickup and drop-off, making the process seamless</Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card height="100%" boxShadow="md" borderRadius="lg" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="flex-start">
                    <Flex
                      bg="teal.50"
                      color="teal.600"
                      borderRadius="md"
                      p={3}
                    >
                      <Icon as={FaStar} boxSize={6} />
                    </Flex>
                    <Heading size="md">Verified Quality</Heading>
                    <Text>All boards and storage partners are reviewed and rated, ensuring reliable service and equipment</Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonial Section */}
      <Box py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={2} textAlign="center" maxW="700px">
              <Heading size="xl">What Our Users Say</Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                Join thousands of surfers who have already transformed their travel experience
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {testimonials.map((testimonial, index) => (
                <Card key={index} boxShadow="md" borderRadius="lg" overflow="hidden">
                  <CardBody p={6}>
                    <VStack spacing={4} align="flex-start">
                      <HStack spacing={4}>
                        <Avatar src={testimonial.image} name={testimonial.name} size="md" />
                        <Box>
                          <Text fontWeight="bold">{testimonial.name}</Text>
                          <Text fontSize="sm" color="gray.500">{testimonial.location}</Text>
                        </Box>
                      </HStack>

                      <Text fontSize="md">"{testimonial.text}"</Text>

                      <HStack>
                        {Array(5).fill('').map((_, i) => (
                          <Icon
                            key={i}
                            as={FaStar}
                            color={i < testimonial.rating ? "yellow.400" : "gray.300"}
                          />
                        ))}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        py={16}
        bg={useColorModeValue('blue.50', 'blue.900')}
        borderRadius="lg"
        mx={{ base: 4, md: 8 }}
        my={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">Ready to Transform Your Surfing Experience?</Heading>
            <Text fontSize="lg" maxW="700px">
              Whether you're looking to rent a board for your next trip, store your board with a partner,
              or become a storage partner yourself, we've got you covered.
            </Text>

            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="blue"
                onClick={() => router.push(user ? "/dashboard" : "/register")}
                px={8}
              >
                {user ? "Go to Dashboard" : "Join Now"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                colorScheme="blue"
                onClick={() => router.push("/surfboards")}
              >
                Browse Boards
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
