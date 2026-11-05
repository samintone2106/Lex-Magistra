import type { Specialty } from "@/lib/types";

/**
 * Contenido base de las especialidades. Fuente única para:
 * - el seed de la base de datos (scripts/gen-seed.ts)
 * - el respaldo estático si Supabase no está configurado.
 * En producción, el contenido vivo se edita desde /admin/especialidades.
 */
export const SPECIALTIES_SEED: Omit<Specialty, "id">[] = [
  {
    slug: "derecho-de-transito",
    name: "Derecho de tránsito",
    short_name: "Tránsito",
    icon: "car",
    sort_order: 1,
    is_active: true,
    summary:
      "Comparendos, impugnación de infracciones, accidentes y defensa ante los organismos de tránsito.",
    description:
      "Acompañamos a conductores, propietarios y empresas de transporte frente a las autoridades de tránsito. Revisamos cada comparendo y cada actuación administrativa para verificar que se haya respetado el debido proceso, la notificación en término y la validez de la prueba, incluida la proveniente de cámaras de fotodetección. Cuando hay un accidente, orientamos sobre responsabilidades, seguros y reclamaciones, y representamos al cliente en las audiencias que correspondan.",
    problems: [
      "Comparendos impuestos sin notificación oportuna o con fallas en la prueba.",
      "Fotomultas que llegan al propietario sin identificar al conductor.",
      "Accidentes con daños materiales o lesiones y discusión sobre responsabilidad.",
      "Suspensión o cancelación de la licencia de conducción.",
      "Cobros coactivos y embargos derivados de multas antiguas.",
    ],
    services: [
      "Comparendos y multas.",
      "Impugnación de infracciones.",
      "Accidentes de tránsito.",
      "Defensa en procedimientos administrativos.",
      "Recuperación de derechos relacionados con licencias de conducción.",
    ],
    faqs: [
      {
        q: "¿Puedo impugnar una fotomulta?",
        a: "Sí, cuando hay razones de hecho o de derecho, por ejemplo fallas en la notificación o en la identificación del infractor. Revisamos el caso concreto y le decimos con franqueza si la impugnación tiene fundamento.",
      },
      {
        q: "¿Cuánto tiempo tengo para actuar frente a un comparendo?",
        a: "Los términos son cortos y dependen de la etapa del proceso. Lo recomendable es consultarnos apenas reciba la notificación para no perder oportunidades de defensa.",
      },
      {
        q: "¿Qué hago después de un accidente de tránsito?",
        a: "Conserve las pruebas (fotografías, datos de testigos, informe policial), reporte a su aseguradora y busque asesoría antes de firmar acuerdos o conciliaciones.",
      },
    ],
  },
  {
    slug: "derecho-penal",
    name: "Derecho penal",
    short_name: "Penal",
    icon: "gavel",
    sort_order: 2,
    is_active: true,
    summary:
      "Defensa penal, representación de víctimas y estrategia en cada etapa del proceso.",
    description:
      "Asumimos la defensa técnica de personas investigadas y la representación de víctimas dentro del sistema penal acusatorio colombiano. Analizamos el caso desde el primer contacto, construimos una estrategia de defensa sustentada en la prueba y acompañamos al cliente en audiencias, entrevistas y diligencias, explicándole en lenguaje claro qué sucede en cada etapa.",
    problems: [
      "Citaciones a interrogatorio o a audiencia de imputación.",
      "Capturas y solicitudes de medida de aseguramiento.",
      "Denuncias que la persona considera infundadas.",
      "Víctimas que necesitan ser reconocidas y reparadas dentro del proceso.",
      "Preacuerdos, principios de oportunidad y mecanismos de terminación anticipada.",
    ],
    services: [
      "Defensa penal.",
      "Asesoría en procesos judiciales.",
      "Representación y acompañamiento.",
      "Análisis de casos y estrategias de defensa.",
    ],
    faqs: [
      {
        q: "Me citaron a la Fiscalía, ¿debo ir con abogado?",
        a: "Es lo recomendable. Antes de cualquier diligencia conviene conocer su calidad dentro del proceso y sus derechos, incluido el de guardar silencio.",
      },
      {
        q: "¿Representan también a víctimas?",
        a: "Sí. La víctima tiene derecho a la verdad, la justicia y la reparación, y puede intervenir activamente en el proceso con apoderado.",
      },
      {
        q: "¿Pueden garantizar el resultado del proceso?",
        a: "No. Ningún abogado puede garantizar un resultado judicial. Nos comprometemos con una defensa diligente, técnica y transparente.",
      },
    ],
  },
  {
    slug: "derecho-economico-y-financiero",
    name: "Derecho económico y financiero",
    short_name: "Económico y financiero",
    icon: "landmark",
    sort_order: 3,
    is_active: true,
    summary:
      "Obligaciones, deudas, conflictos con entidades financieras y protección del patrimonio.",
    description:
      "Asesoramos a personas y empresas en conflictos de contenido económico: obligaciones incumplidas, cobros, reestructuración de deudas, reclamaciones ante entidades financieras y protección de bienes. Revisamos contratos, títulos valores y estados de cuenta para identificar cobros indebidos y proponer rutas de negociación, conciliación o reclamación judicial según convenga.",
    problems: [
      "Cobros que no corresponden a lo pactado o con intereses excesivos.",
      "Procesos ejecutivos, embargos y riesgo sobre bienes.",
      "Deudas difíciles de pagar que requieren reorganización.",
      "Reclamaciones ante bancos, aseguradoras y otras entidades vigiladas.",
      "Socios o contratantes que incumplen obligaciones económicas.",
    ],
    services: [
      "Asesoría financiera legal.",
      "Conflictos económicos.",
      "Obligaciones y deudas.",
      "Protección de intereses patrimoniales.",
    ],
    faqs: [
      {
        q: "¿Pueden ayudarme a negociar con el banco?",
        a: "Sí. Revisamos la obligación, identificamos posibles cobros indebidos y acompañamos la negociación o la reclamación formal ante la entidad o el defensor del consumidor financiero.",
      },
      {
        q: "Me embargaron, ¿qué puedo hacer?",
        a: "Depende del tipo de proceso y del bien. Existen bienes inembargables y defensas posibles; conviene revisar el expediente cuanto antes.",
      },
    ],
  },
  {
    slug: "derecho-digital-y-tecnologico",
    name: "Derecho digital y tecnológico",
    short_name: "Digital y tecnológico",
    icon: "shield",
    sort_order: 4,
    is_active: true,
    summary:
      "Delitos informáticos, protección de datos, suplantación de identidad y fraudes digitales.",
    description:
      "Atendemos los conflictos que nacen en internet y en el uso de tecnologías: delitos informáticos, suplantación de identidad, fraudes en compras o transferencias, filtración de datos personales y vulneración de derechos en redes sociales. Orientamos sobre la preservación de evidencia digital, las denuncias y reclamaciones ante las autoridades y plataformas, y las acciones para proteger los datos personales conforme a la Ley 1581 de 2012.",
    problems: [
      "Suplantación de identidad en redes sociales, bancos o servicios en línea.",
      "Fraudes en compras, transferencias o inversiones por internet.",
      "Uso indebido o filtración de datos personales.",
      "Acceso abusivo a cuentas o sistemas informáticos.",
      "Publicaciones que vulneran la intimidad o la honra.",
    ],
    services: [
      "Delitos informáticos.",
      "Protección de datos personales.",
      "Suplantación de identidad.",
      "Fraudes digitales.",
      "Vulneración de derechos en internet.",
    ],
    faqs: [
      {
        q: "Fui víctima de un fraude por internet, ¿qué hago primero?",
        a: "Bloquee los productos afectados, conserve capturas, correos y comprobantes, y busque asesoría para presentar la denuncia y las reclamaciones correspondientes.",
      },
      {
        q: "¿Cómo pruebo algo que ocurrió en redes sociales?",
        a: "La evidencia digital debe preservarse de forma adecuada para que sea útil. Le orientamos sobre cómo conservarla sin alterarla.",
      },
    ],
  },
  {
    slug: "derecho-migratorio-y-visas",
    name: "Derecho migratorio y asesoría de visas",
    short_name: "Migratorio y visas",
    icon: "plane",
    sort_order: 5,
    is_active: true,
    summary:
      "Orientación en solicitudes de visa, documentación y procesos migratorios.",
    description:
      "Orientamos a personas que desean viajar, residir o regularizar su situación migratoria. Revisamos requisitos, preparamos la documentación de soporte y acompañamos las solicitudes y los recursos ante las autoridades competentes. La decisión sobre una visa corresponde siempre a la autoridad consular o migratoria; nuestro trabajo es que la solicitud se presente completa, coherente y en término.",
    problems: [
      "Dudas sobre el tipo de visa adecuado para cada propósito.",
      "Solicitudes negadas que pueden revisarse o presentarse de nuevo.",
      "Documentación incompleta, vencida o sin apostilla.",
      "Extranjeros que necesitan regularizar su permanencia en Colombia.",
      "Procesos de reunificación familiar.",
    ],
    services: [
      "Orientación sobre solicitudes de visa.",
      "Asesoría en documentación.",
      "Procesos migratorios.",
      "Acompañamiento en solicitudes y recursos.",
    ],
    faqs: [
      {
        q: "¿Ustedes aprueban la visa?",
        a: "No. La decisión es exclusiva de la autoridad consular o migratoria. Le ayudamos a preparar y presentar una solicitud completa y bien sustentada.",
      },
      {
        q: "Me negaron la visa, ¿puedo volver a aplicar?",
        a: "En muchos casos sí. Revisamos los motivos de la negativa para corregir lo que sea posible antes de una nueva solicitud.",
      },
    ],
  },
  {
    slug: "proteccion-del-buen-nombre",
    name: "Protección del buen nombre y reputación",
    short_name: "Buen nombre",
    icon: "badge-check",
    sort_order: 6,
    is_active: true,
    summary:
      "Rectificación de información falsa, reclamaciones y orientación sobre registros negativos.",
    description:
      "Protegemos el derecho fundamental al buen nombre y a la honra frente a publicaciones falsas o perjudiciales y frente a registros desactualizados. Presentamos solicitudes de rectificación, reclamaciones ante centrales de información y, cuando procede, acciones de tutela. Orientamos sobre la actualización, corrección o eliminación de historiales negativos únicamente en los casos en que la ley lo permite; no ofrecemos ni garantizamos la eliminación de antecedentes o registros que deban conservarse legalmente.",
    problems: [
      "Publicaciones falsas o injuriosas en medios o redes sociales.",
      "Reportes negativos en centrales de riesgo con datos inexactos o desactualizados.",
      "Información que permanece publicada más allá del tiempo legal.",
      "Dudas sobre antecedentes y registros que afectan oportunidades laborales.",
      "Necesidad de solicitar rectificación a un medio o a una plataforma.",
    ],
    services: [
      "Protección del buen nombre.",
      "Rectificación de información falsa.",
      "Reclamaciones por información perjudicial.",
      "Asesoría sobre antecedentes y registros negativos.",
      "Orientación sobre la eliminación, actualización o corrección de historiales negativos cuando legalmente proceda.",
    ],
    faqs: [
      {
        q: "¿Pueden borrar mi reporte negativo?",
        a: "Solo cuando la ley lo permite, por ejemplo si el dato es inexacto, no fue notificado o ya cumplió el término de permanencia. Revisamos su caso y le decimos con claridad si procede.",
      },
      {
        q: "¿Qué hago si publicaron algo falso sobre mí?",
        a: "El primer paso suele ser una solicitud formal de rectificación. Si no hay respuesta, pueden proceder otras acciones, incluida la tutela.",
      },
    ],
  },
];
