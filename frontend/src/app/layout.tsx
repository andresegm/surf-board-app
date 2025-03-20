"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./authContext";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <AuthProvider>
            <Navbar />  { }
            {children}
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}