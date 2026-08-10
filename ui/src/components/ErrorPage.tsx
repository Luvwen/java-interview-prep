interface ErrorPageProps {
  status: number;
  onBack: () => void;
}

const ERROR_INFO: Record<number, { title: string; description: string; icon: string }> = {
  400: {
    title: "Solicitud invalida",
    description:
      "Los parametros enviados no son correctos. Verifica la configuracion e intenta de nuevo.",
    icon: "400",
  },
  403: {
    title: "Acceso denegado",
    description:
      "No tenes permiso para acceder a este recurso. Si crees que es un error, revisa la configuracion del servidor.",
    icon: "403",
  },
  404: {
    title: "No encontrado",
    description:
      "El recurso que buscas no existe o fue movido. Verifica la URL o vuelve al inicio.",
    icon: "404",
  },
  500: {
    title: "Error del servidor",
    description:
      "Ocurrio un error inesperado del lado del servidor. Intenta de nuevo mas tarde.",
    icon: "500",
  },
};

const DEFAULT_INFO = {
  title: "Error inesperado",
  description: "Ocurrio un error. Intenta de nuevo.",
  icon: "!",
};

export default function ErrorPage({ status, onBack }: ErrorPageProps) {
  const info = ERROR_INFO[status] ?? { ...DEFAULT_INFO, icon: String(status) };

  return (
    <section className="error-page">
      <div className="error-page-card">
        <span className="error-page-code">{info.icon}</span>
        <h2 className="error-page-title">{info.title}</h2>
        <p className="error-page-description">{info.description}</p>
        <div className="error-page-actions">
          <button className="primary" onClick={onBack}>
            Volver
          </button>
        </div>
      </div>
    </section>
  );
}
