import { Box, Heading, Text, Button, VStack, Flex } from "@chakra-ui/react";
import { colors } from "../colors";

interface ErrorPageProps {
  status: number;
  onBack: () => void;
}

const ERROR_INFO: Record<number, { title: string; description: string }> = {
  400: { title: "Solicitud invalida", description: "Los parametros enviados no son correctos. Verifica la configuracion e intenta de nuevo." },
  403: { title: "Acceso denegado", description: "No tenes permiso para acceder a este recurso. Si crees que es un error, revisa la configuracion del servidor." },
  404: { title: "No encontrado", description: "El recurso que buscas no existe o fue movido. Verifica la URL o vuelve al inicio." },
  500: { title: "Error del servidor", description: "Ocurrio un error inesperado del lado del servidor. Intenta de nuevo mas tarde." },
};

const DEFAULT_INFO = { title: "Error inesperado", description: "Ocurrio un error. Intenta de nuevo." };

export default function ErrorPage({ status, onBack }: ErrorPageProps) {
  const info = ERROR_INFO[status] ?? DEFAULT_INFO;

  return (
    <Flex justifyContent="center" alignItems="center" minH="40vh" p={8}>
      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="16px" p={12} textAlign="center" maxW="420px" w="100%">
        <VStack spacing={4}>
          <Heading size="3xl" color={colors.error} fontWeight={800} letterSpacing="-2px">
            {status}
          </Heading>
          <Heading size="lg">{info.title}</Heading>
          <Text color={colors.textMuted} lineHeight="1.6">{info.description}</Text>
          <Button colorScheme="blue" onClick={onBack} mt={4}>Volver</Button>
        </VStack>
      </Box>
    </Flex>
  );
}
