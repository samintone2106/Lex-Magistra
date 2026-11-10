/**
 * Contenido informativo ampliado de cada especialidad (por slug): qué incluye el servicio,
 * qué documentos conviene traer a la primera consulta y cómo suele avanzar un caso.
 * Es orientación general: los tiempos reales dependen de cada autoridad y de cada expediente.
 * Si una especialidad creada desde el panel no tiene entrada aquí, su página omite estas secciones.
 */
export interface SpecialtyStage {
  name: string;
  time: string;
  text: string;
}

export interface SpecialtyDetail {
  included: string[];
  documents: string[];
  stages: SpecialtyStage[];
  note: string;
}

const COMMON_FIRST = "Primera consulta";

export const SPECIALTY_DETAILS: Record<string, SpecialtyDetail> = {
  "derecho-de-transito": {
    included: [
      "Revisión del comparendo, la fotodetección o la resolución sancionatoria.",
      "Verificación de la notificación, los términos y la validez de la prueba.",
      "Redacción de descargos, recursos y solicitudes ante el organismo de tránsito.",
      "Acompañamiento en la audiencia pública y en la conciliación de accidentes.",
      "Orientación sobre acuerdos de pago, prescripción y cobro coactivo.",
    ],
    documents: [
      "Comparendo, fotomulta o notificación recibida.",
      "Documento de identidad y licencia de conducción.",
      "Licencia de tránsito (tarjeta de propiedad) del vehículo.",
      "Consulta actualizada del SIMIT o del RUNT.",
      "En accidentes: informe policial, fotografías, datos de testigos y póliza.",
    ],
    stages: [
      { name: COMMON_FIRST, time: "El mismo día", text: "Revisamos lo que recibiste y te decimos con franqueza si hay fundamento para defenderte." },
      { name: "Estudio del expediente", time: "Pocos días hábiles", text: "Solicitamos copias, revisamos la notificación y la prueba, y definimos la estrategia." },
      { name: "Actuación", time: "Según la etapa", text: "Presentamos descargos o recursos y asistimos a la audiencia ante la autoridad." },
      { name: "Decisión y seguimiento", time: "Variable", text: "Te explicamos la decisión y, si procede, los recursos o la ruta de pago que siguen." },
    ],
    note: "Los plazos para actuar frente a un comparendo son cortos y corren desde la notificación. Consúltanos apenas la recibas.",
  },
  "derecho-penal": {
    included: [
      "Análisis inicial de la situación jurídica y de la calidad dentro del proceso.",
      "Acompañamiento en entrevistas, interrogatorios y diligencias ante la Fiscalía.",
      "Defensa técnica en audiencias preliminares, de acusación y de juicio oral.",
      "Representación de víctimas para la verdad, la justicia y la reparación.",
      "Valoración de preacuerdos, principios de oportunidad y terminación anticipada.",
    ],
    documents: [
      "Citación, boleta, orden o notificación recibida.",
      "Número de noticia criminal (SPOA), si lo tienes.",
      "Denuncia o querella, si fue presentada.",
      "Documentos, mensajes, fotografías u otras pruebas relacionadas con los hechos.",
      "Datos de contacto de posibles testigos.",
    ],
    stages: [
      { name: COMMON_FIRST, time: "El mismo día", text: "Escuchamos los hechos completos y te explicamos tus derechos, incluido el de guardar silencio." },
      { name: "Indagación e investigación", time: "Meses, según el caso", text: "Revisamos los elementos de prueba y preparamos la defensa o la intervención como víctima." },
      { name: "Audiencias", time: "Según la agenda judicial", text: "Te acompañamos en cada audiencia y te explicamos antes qué va a ocurrir." },
      { name: "Juicio o terminación", time: "Variable", text: "Llevamos el caso a juicio o evaluamos contigo una terminación anticipada si conviene." },
    ],
    note: "El proceso penal colombiano sigue el sistema acusatorio de la Ley 906 de 2004. Ningún abogado puede garantizar el resultado de un proceso.",
  },
  "derecho-economico-y-financiero": {
    included: [
      "Revisión de contratos, pagarés, títulos valores y estados de cuenta.",
      "Identificación de cobros indebidos, intereses excesivos o cláusulas abusivas.",
      "Negociación y conciliación con acreedores y entidades financieras.",
      "Reclamaciones ante la entidad, el defensor del consumidor financiero o la autoridad competente.",
      "Defensa en procesos ejecutivos y frente a medidas de embargo.",
    ],
    documents: [
      "Contrato, pagaré o documento que soporta la obligación.",
      "Extractos y estados de cuenta recientes.",
      "Comunicaciones de cobro, requerimientos o demandas recibidas.",
      "Comprobantes de los pagos realizados.",
      "Si hay embargo: la notificación y los datos del juzgado.",
    ],
    stages: [
      { name: COMMON_FIRST, time: "El mismo día", text: "Entendemos la obligación, el monto en discusión y el riesgo sobre tus bienes." },
      { name: "Revisión de soportes", time: "Una a dos semanas", text: "Cruzamos lo pactado con lo cobrado y definimos si conviene negociar, reclamar o defenderse." },
      { name: "Negociación o reclamación", time: "Semanas", text: "Presentamos la propuesta o la reclamación formal y hacemos seguimiento a la respuesta." },
      { name: "Vía judicial, si hace falta", time: "Meses", text: "Si no hay acuerdo, te representamos en el proceso que corresponda." },
    ],
    note: "Algunos bienes y una parte del salario son inembargables según la ley. Revisar el expediente a tiempo amplía las opciones de defensa.",
  },
  "derecho-digital-y-tecnologico": {
    included: [
      "Orientación inmediata para contener el daño y bloquear productos o cuentas.",
      "Guía para preservar evidencia digital sin alterarla.",
      "Redacción de denuncias por delitos informáticos (Ley 1273 de 2009).",
      "Reclamaciones ante bancos, comercios y plataformas digitales.",
      "Solicitudes de protección de datos personales conforme a la Ley 1581 de 2012.",
    ],
    documents: [
      "Capturas de pantalla con fecha, hora y dirección web visibles.",
      "Correos, mensajes y enlaces relacionados, sin reenviarlos ni editarlos.",
      "Comprobantes de transferencias, compras o movimientos no reconocidos.",
      "Radicados de reclamaciones previas ante el banco o la plataforma.",
      "Documento de identidad y datos de las cuentas afectadas.",
    ],
    stages: [
      { name: COMMON_FIRST, time: "El mismo día", text: "Priorizamos lo urgente: bloquear, conservar la evidencia y no borrar nada." },
      { name: "Preservación de evidencia", time: "Primeros días", text: "Organizamos la evidencia para que sea útil ante la autoridad y la entidad." },
      { name: "Denuncia y reclamaciones", time: "Semanas", text: "Radicamos la denuncia y las reclamaciones, y hacemos seguimiento a cada una." },
      { name: "Seguimiento", time: "Variable", text: "Te mantenemos al tanto de las respuestas y de las acciones que siguen." },
    ],
    note: "En fraudes digitales cada hora cuenta: avisa a tu banco de inmediato y conserva la evidencia tal como la recibiste.",
  },
  "derecho-migratorio-y-visas": {
    included: [
      "Identificación del tipo de visa o permiso adecuado para tu propósito.",
      "Lista de requisitos y revisión de la documentación de soporte.",
      "Orientación sobre apostilla, traducción oficial y vigencia de documentos.",
      "Preparación coherente de la solicitud ante la autoridad competente.",
      "Análisis de negativas previas y acompañamiento en recursos.",
    ],
    documents: [
      "Pasaporte vigente y documento de identidad.",
      "Solicitudes, negativas o comunicaciones previas de la autoridad.",
      "Soportes del propósito del viaje o de la permanencia (laborales, académicos, familiares).",
      "Soportes económicos que se van a presentar.",
      "Documentos apostillados o traducidos, si ya los tienes.",
    ],
    stages: [
      { name: COMMON_FIRST, time: "El mismo día", text: "Entendemos tu propósito y te decimos qué tipo de solicitud corresponde." },
      { name: "Preparación de documentos", time: "Semanas", text: "Revisamos cada documento y lo que falte por apostillar, traducir o actualizar." },
      { name: "Radicación", time: "Según la autoridad", text: "Presentamos o te acompañamos a presentar la solicitud completa y en término." },
      { name: "Respuesta y recursos", time: "Según la autoridad", text: "Revisamos la decisión y, si fue negativa, las opciones para volver a presentarla." },
    ],
    note: "La decisión sobre una visa o un permiso corresponde siempre a la autoridad consular o migratoria.",
  },
  "proteccion-del-buen-nombre": {
    included: [
      "Análisis de la publicación o del reporte que afecta tu buen nombre.",
      "Solicitud formal de rectificación al medio, la persona o la plataforma.",
      "Reclamaciones ante centrales de información (habeas data, Ley 1266 de 2008).",
      "Acción de tutela cuando la rectificación o la reclamación no prosperan.",
      "Orientación clara sobre qué registros pueden corregirse y cuáles no.",
    ],
    documents: [
      "Enlaces y capturas de la publicación, con fecha visible.",
      "Reporte actualizado de la central de información, si es un dato financiero.",
      "Paz y salvos, acuerdos de pago o soportes que contradigan el dato.",
      "Reclamaciones o solicitudes enviadas antes y sus respuestas.",
      "Documento de identidad.",
    ],
    stages: [
      { name: COMMON_FIRST, time: "El mismo día", text: "Revisamos el dato o la publicación y te decimos si la ley permite corregirlo." },
      { name: "Solicitud de rectificación", time: "Pocos días", text: "Preparamos y enviamos la solicitud o la reclamación con sus soportes." },
      { name: "Respuesta", time: "Según la ley", text: "La entidad o la persona tienen un término para responder; hacemos seguimiento." },
      { name: "Tutela, si procede", time: "Unos diez días", text: "Si no hay respuesta o es insuficiente, presentamos la acción de tutela." },
    ],
    note: "No ofrecemos ni garantizamos la eliminación de antecedentes o registros que la ley ordena conservar.",
  },
};
