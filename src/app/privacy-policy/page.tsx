import { type Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Interview Prep collects, uses, stores, and protects your information.",
};

const sections = [
  {
    heading: "Information We Collect",
    paragraphs: [
      "We collect information you provide directly when you create an account, update your profile, or use Interview Prep. This can include your name, email address, account credentials, and the interview responses or messages you submit while using the service.",
      "We may also collect technical information needed to operate the product, such as session data, device and browser details, usage logs, and basic analytics about how features are accessed and used.",
    ],
  },
  {
    heading: "How We Use Information",
    paragraphs: [
      "We use your information to provide the service, authenticate your account, personalize your interview experience, generate AI interview sessions and feedback, maintain security, and improve product performance.",
      "We may also use information to communicate important service updates, respond to support requests, investigate abuse, and comply with legal obligations.",
    ],
  },
  {
    heading: "How Information Is Shared",
    paragraphs: [
      "We do not sell your personal information. We may share information with service providers that help us run the platform, such as hosting, authentication, analytics, database, and AI infrastructure providers, but only to the extent needed to operate the service.",
      "We may also disclose information when required by law, to enforce our terms, to protect users and the service, or as part of a merger, acquisition, financing, or similar business transaction.",
    ],
  },
  {
    heading: "Data Retention",
    paragraphs: [
      "We retain information for as long as it is reasonably necessary to provide the service, maintain account functionality, resolve disputes, enforce agreements, and meet legal or operational requirements.",
      "Retention periods can vary depending on the type of data, the sensitivity of the information, and whether continued storage is needed for security, auditing, or legitimate business purposes.",
    ],
  },
  {
    heading: "Your Choices",
    paragraphs: [
      "You may be able to review or update certain account information from within the app. You can also stop using the service at any time.",
      "If you need help with access, correction, or deletion requests, please use the contact or support channel made available through the product or site where Interview Prep is offered.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational measures to protect information, but no method of transmission or storage is completely secure. You are responsible for maintaining the confidentiality of your account credentials.",
    ],
  },
  {
    heading: "Children's Privacy",
    paragraphs: [
      "Interview Prep is not intended for children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided information through the service, please contact us so appropriate action can be taken.",
    ],
  },
  {
    heading: "Changes To This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we do, we will revise the effective date on this page and apply the updated policy from the date it is posted unless a different date is stated.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This page explains how Interview Prep handles personal information and product usage data when you access the service."
      lastUpdated="March 23, 2026"
      sections={sections}
    />
  );
}
