"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./authContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <AuthProvider>{children}</AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}