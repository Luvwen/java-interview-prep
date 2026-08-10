import type { ModuleState } from "../types";

const stateLabels: Record<ModuleState, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completado",
};

function StateBadge({ state }: { state: ModuleState }) {
  return (
    <span className={`badge badge-${state.toLowerCase()}`}>
      {stateLabels[state]}
    </span>
  );
}

export default StateBadge;
