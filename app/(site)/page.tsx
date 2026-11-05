import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { SpecialtiesRail } from "@/components/landing/SpecialtiesRail";
import { Orientador } from "@/components/landing/Orientador";
import { Process } from "@/components/landing/Process";
import { Preloader } from "@/components/landing/Preloader";
import { ContactSection, Faq, GENERAL_FAQS, Intro, ReviewsSection, Team, WhyUs } from "@/components/landing/Sections";
import { getApprovedReviews, getLawyers, getSettings, getSpecialties } from "@/lib/data";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const [settings, specialties, lawyers, reviews] = await Promise.all([
    getSettings(),
    getSpecialties(),
    getLawyers(),
    getApprovedReviews(),
  ]);
  const wa = whatsappUrl(settings.whatsapp_number, settings.whatsapp_message);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: settings.firm_name,
    areaServed: "CO",
    address: settings.address ? { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city, addressCountry: "CO" } : undefined,
    email: settings.contact_email || undefined,
    telephone: settings.contact_phone || undefined,
    knowsAbout: specialties.map((s) => s.name),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GENERAL_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <Preloader firmName={settings.firm_name} />
      <Hero advisorHref={wa ?? "/contacto"} advisorExternal={!!wa} />
      <Intro settings={settings} specialtiesCount={specialties.length} />
      <Marquee items={specialties.map((s) => ({ slug: s.slug, name: s.name }))} />
      <SpecialtiesRail specialties={specialties} />
      <Orientador specialties={specialties} />
      <Team lawyers={lawyers} />
      <WhyUs />
      <Process />
      <ReviewsSection reviews={reviews.slice(0, 3)} />
      <Faq />
      <ContactSection settings={settings} specialties={specialties} waHref={wa} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
