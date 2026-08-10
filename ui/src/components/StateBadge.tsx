import { Badge } from "@chakra-ui/react";
import type { ModuleState } from "../types";

const stateConfig: Record<ModuleState, { label: string; colorScheme: string }> = {
  PENDING: { label: "Pendiente", colorScheme: "yellow" },
  IN_PROGRESS: { label: "En curso", colorScheme: "blue" },
  COMPLETED: { label: "Completado", colorScheme: "green" },
};

function StateBadge({ state }: { state: ModuleState }) {
  const config = stateConfig[state];
  return (
    <Badge colorScheme={config.colorScheme} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
      {config.label}
    </Badge>
  );
}

export default StateBadge;
