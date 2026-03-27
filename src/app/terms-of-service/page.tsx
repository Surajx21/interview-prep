import { type Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the rules, responsibilities, and limitations that apply when using Interview Prep.",
};

const sections = [
  {
    heading: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using Interview Prep, you agree to these Terms of Service. If you do not agree to these terms, do not use the service.",
      "If you use the service on behalf of an organization, you represent that you have authority to bind that organization to these terms.",
    ],
  },
  {
    heading: "Eligibility and Accounts",
    paragraphs: [
      "You are responsible for providing accurate account information and for maintaining the security of your account. You may not share your account in a way that compromises service security or violates applicable law.",
      "You must use the service only in compliance with applicable laws, regulations, and these terms.",
    ],
  },
  {
    heading: "Permitted Use",
    paragraphs: [
      "Interview Prep is provided to help users practice interviews, review feedback, and improve job-readiness skills. You may use the service only for lawful and authorized purposes.",
      "You may not misuse the service, interfere with its operation, probe or bypass security measures, scrape data at scale, reverse engineer protected parts of the platform except where the law clearly permits it, or use the product to generate unlawful, abusive, or deceptive content.",
    ],
  },
  {
    heading: "AI-Generated Content",
    paragraphs: [
      "The service may generate interview questions, responses, scoring, and feedback using automated systems. AI-generated output may be incomplete, inaccurate, or unsuitable for your specific circumstances and should be reviewed with appropriate judgment.",
      "You remain responsible for how you use any output produced through the service.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "The service, including its software, branding, design, and other original materials, is owned by Interview Prep or its licensors and is protected by applicable intellectual property laws.",
      "Except as expressly allowed by these terms, you may not copy, distribute, modify, create derivative works from, sell, or exploit the service or its content without prior authorization.",
    ],
  },
  {
    heading: "Suspension and Termination",
    paragraphs: [
      "We may suspend or terminate access to the service if we believe you have violated these terms, created risk for users or the platform, or if suspension is otherwise necessary for security, legal compliance, or operational reasons.",
      "You may stop using the service at any time.",
    ],
  },
  {
    heading: "Disclaimers and Limitation of Liability",
    paragraphs: [
      "The service is provided on an as-is and as-available basis to the fullest extent permitted by law. We do not guarantee uninterrupted availability, error-free operation, or that the service will meet every specific need or outcome.",
      "To the fullest extent permitted by law, Interview Prep and its affiliates, licensors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of data, profits, goodwill, or business opportunities arising from or related to use of the service.",
    ],
  },
  {
    heading: "Changes To These Terms",
    paragraphs: [
      "We may update these Terms of Service from time to time. Continued use of the service after updated terms are posted means the updated terms apply from their effective date unless otherwise stated.",
    ],
  },
] as const;

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms govern access to and use of Interview Prep, including the responsibilities and restrictions that apply to every account."
      lastUpdated="March 23, 2026"
      sections={sections}
    />
  );
}
