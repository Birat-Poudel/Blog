import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconKaggle from "@/assets/icons/IconKaggle.svg";
import IconMedium from "@/assets/icons/IconMedium.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/Birat-Poudel",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "Kaggle",
    href: "https://www.kaggle.com/biratpoudelrocks",
    linkTitle: `${SITE.title} on Kaggle`,
    icon: IconKaggle,
  },
  {
    name: "Medium",
    href: "https://medium.com/@poudel.birat25",
    linkTitle: `${SITE.title} on Medium`,
    icon: IconMedium,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/birat-poudel-6562ba16b/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "Mail",
    href: "mailto:poudel.birat25@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

interface ResearchProfile {
  name: string;
  href: string;
  linkTitle: string;
}

export const RESEARCH_PROFILES: ResearchProfile[] = [
  {
    name: "ORCID",
    href: "https://orcid.org/0009-0007-1104-5019",
    linkTitle: `${SITE.title} ORCID Profile`,
  },
  {
    name: "Google Scholar",
    href: "https://scholar.google.com/citations?user=TnsQurkAAAAJ&hl=en",
    linkTitle: `${SITE.title} on Google Scholar`,
  },
  {
    name: "Research Gate",
    href: "https://www.researchgate.net/profile/Birat-Poudel",
    linkTitle: `${SITE.title} on ResearchGate`,
  },
] as const;
