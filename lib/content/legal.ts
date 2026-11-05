import type { SiteSettings } from "@/lib/types";

export interface LegalDoc {
  title: string;
  description: string;
  sections: { heading: string; body: string[] }[];
}

/**
 * Textos legales base para Colombia. Son un punto de partida y DEBEN ser revisados por un abogado
 * de la firma antes de publicar (datos del responsable, finalidades reales, canales).
 */
export function legalDocs(s: SiteSettings): Record<string, LegalDoc> {
  const responsable = `${s.firm_name}${s.address ? `, con domicilio en ${s.address}, ${s.city}` : `, ${s.city}`}`;
  const canal = [s.contact_email && `el correo ${s.contact_email}`, s.contact_phone && `el teléfono ${s.contact_phone}`, "el formulario de contacto del sitio"]
    .filter(Boolean)
    .join(", ");

  return {
    "tratamiento-datos": {
      title: "Política de tratamiento de datos personales",
      description: "Cómo recolectamos, usamos y protegemos tus datos personales conforme a la Ley 1581 de 2012.",
      sections: [
        {
          heading: "Responsable del tratamiento",
          body: [`El responsable del tratamiento de los datos personales es ${responsable}. Puedes comunicarte con nosotros a través de ${canal}.`],
        },
        {
          heading: "Marco legal",
          body: [
            "Esta política se expide en cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto Único Reglamentario 1074 de 2015) y demás normas que los modifiquen o complementen.",
          ],
        },
        {
          heading: "Datos que recolectamos",
          body: [
            "Datos de identificación y contacto (nombre, documento, correo, teléfono, ciudad), la información que nos suministras sobre tu caso y los datos de uso de la plataforma necesarios para su funcionamiento y seguridad.",
            "La información de los casos puede incluir datos sensibles. Su suministro es facultativo y solo se trata con tu autorización expresa y para las finalidades descritas.",
          ],
        },
        {
          heading: "Finalidades",
          body: [
            "Atender tus solicitudes de orientación y asesoría; asignar tu caso al profesional del área; contactarte por el medio que elijas; gestionar tu cuenta en la plataforma; publicar, solo con tu consentimiento y previa moderación, las reseñas que envíes; cumplir obligaciones legales y atender requerimientos de autoridades competentes.",
          ],
        },
        {
          heading: "Derechos del titular",
          body: [
            "Como titular puedes: conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización; ser informado sobre el uso dado a tus datos; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y solicitar la supresión de los datos cuando no exista un deber legal o contractual de conservarlos; y acceder gratuitamente a tus datos.",
          ],
        },
        {
          heading: "Consultas y reclamos",
          body: [
            `Puedes ejercer tus derechos a través de ${canal}. Las consultas se atenderán en un término máximo de diez (10) días hábiles y los reclamos en un término máximo de quince (15) días hábiles, prorrogables en los casos previstos por la ley.`,
          ],
        },
        {
          heading: "Seguridad y confidencialidad",
          body: [
            "Aplicamos medidas técnicas, humanas y administrativas para proteger tus datos: acceso restringido por roles, cifrado en tránsito y controles para que cada usuario solo acceda a sus propias solicitudes. La información de los casos está además protegida por el secreto profesional.",
          ],
        },
        {
          heading: "Vigencia",
          body: ["Esta política rige desde su publicación. Los datos se conservarán mientras sean necesarios para las finalidades descritas y para cumplir obligaciones legales."],
        },
      ],
    },
    privacidad: {
      title: "Aviso de privacidad",
      description: "Resumen de cómo tratamos tus datos personales.",
      sections: [
        {
          heading: "Aviso",
          body: [
            `${responsable} será responsable del tratamiento de los datos personales que suministres en este sitio y en la plataforma.`,
            "Tus datos serán usados para atender tus solicitudes de orientación y asesoría jurídica, contactarte, gestionar tu cuenta y, con tu consentimiento, publicar reseñas moderadas.",
            "Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos, y a revocar la autorización, en los términos de la Ley 1581 de 2012.",
            "Puedes consultar la política completa en la página Política de tratamiento de datos personales.",
          ],
        },
      ],
    },
    terminos: {
      title: "Términos y condiciones",
      description: "Condiciones de uso del sitio y de la plataforma.",
      sections: [
        {
          heading: "Información general, no asesoría individual",
          body: [
            "La información publicada en este sitio es de carácter general e informativo. No constituye asesoría jurídica individual ni sustituye el análisis de un abogado sobre un caso concreto.",
          ],
        },
        {
          heading: "Sin relación abogado-cliente automática",
          body: [
            "El registro en la plataforma, la selección de una especialidad, de un abogado o de una firma y el envío de una solicitud no constituyen contratación ni crean una relación abogado-cliente. Dicha relación solo surge cuando la firma acepta el caso y el usuario aprueba por escrito la propuesta de servicios y honorarios.",
          ],
        },
        {
          heading: "Sin garantía de resultados",
          body: [
            "Ni la firma ni sus abogados garantizan resultados en procesos judiciales, administrativos o ante cualquier autoridad. En particular, no se garantiza la eliminación de antecedentes, reportes o registros negativos; cualquier actuación al respecto está sujeta a la legislación aplicable y procede solo cuando la ley lo permite. Las decisiones sobre visas y trámites migratorios corresponden exclusivamente a la autoridad competente.",
          ],
        },
        {
          heading: "Cuenta de usuario",
          body: [
            "Eres responsable de la veracidad de la información que suministras y de la confidencialidad de tu contraseña. Podemos suspender cuentas usadas de forma fraudulenta o contraria a estos términos.",
          ],
        },
        {
          heading: "Reseñas",
          body: [
            "Las reseñas son opiniones de sus autores y se publican después de moderación. Podemos rechazar reseñas que contengan datos sensibles, información de terceros, lenguaje ofensivo o contenido ajeno a la experiencia con la firma.",
          ],
        },
        {
          heading: "Confidencialidad",
          body: [
            "La información de los casos se trata de forma confidencial, con acceso restringido al equipo jurídico asignado y a la administración de la firma, y está protegida por el secreto profesional.",
          ],
        },
        {
          heading: "Ley aplicable",
          body: ["Estos términos se rigen por las leyes de la República de Colombia."],
        },
      ],
    },
  };
}
