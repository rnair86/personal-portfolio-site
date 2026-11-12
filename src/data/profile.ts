export const profile = {
  name: "Rohit Nair",
  monogram: "RN",
  title: "Software Engineer",
  headline:
    "Software Engineer | Scalable backend services, cloud infrastructure, AWS | C#, Kotlin, Terraform, Java, Go | Payment processing, EMV, UL certification",
  location: "Floral Park, New York",
  tagline:
    "Building resilient systems where failure isn't an option — cloud infrastructure, payments, and mission-critical backends.",
  email: "rohitmohanihm@gmail.com",
  phone: "347-497-0384",
  linkedin: "https://www.linkedin.com/in/rnair8",
  github: "https://github.com/rnair86",
  summary: [
    "For over a decade, I've built software for industries where failure isn't an option. I find deep satisfaction in designing and maintaining the complex applications in healthcare, public safety, and payment processing that people rely on every day.",
    "I'm an engineer who enjoys modernizing systems and tackling complex challenges head-on. While I have deep expertise across the .NET framework, I'm also a quick learner who has used Kotlin to port legacy services and picked up Go and Python for various projects. My recent focus has been on building resilient cloud infrastructure, leading efforts to migrate on-premise services to AWS.",
    "I use Terraform to provision and manage cloud resources, helping build scalable systems from the ground up. My approach is rooted in persistence and collaboration: I enjoy diving into a difficult problem, working with my team to find the right solution, and seeing it through to completion. That commitment to hard work and integrity is core to how I operate, especially when handling critical on-call incidents or securing sensitive data.",
  ],
  seeking:
    "I am actively seeking a senior software engineer role where I can contribute to building scalable, cloud-native solutions. I'm always open to connecting with engineering leaders and fellow developers who are passionate about solving meaningful challenges.",
  topSkills: [
    "Cloud Infrastructure",
    "AWS",
    "Terraform",
    "Kubernetes (EKS)",
    "C# / ASP.NET Core",
    "Kotlin / Spring Boot",
    "Microservices",
    "Kafka & RabbitMQ",
    "CI/CD Automation",
    "Payment Systems",
    "EMV / UL Certification",
    "Go",
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Malayalam", level: "Native" },
    { name: "Hindi", level: "Limited Working" },
    { name: "Tamil", level: "Elementary" },
  ],
  education: [
    {
      school: "CUNY New York City College of Technology",
      degree: "Bachelor of Technology, Computer Systems Technology",
      years: "2008 — 2013",
    },
    {
      school: "Institute of Hotel Management and Catering Technology",
      degree: "Bachelor of Science, Hospitality Administration",
      years: "2005 — 2007",
    },
  ],
  earlierRoles: [
    "Electronic Service Associate at Walmart, Westbury, NY (Jun 2010 — Mar 2011) — customer guidance, POS operation, asset protection.",
  ],
} as const;

export type Experience = {
  company: string;
  role: string;
  period: string;
  duration: string;
  location: string;
  highlights: string[];
  current?: boolean;
};

export const experiences: Experience[] = [
  {
    company: "Independent Professional Development",
    role: "Software Engineering",
    period: "Jan 2026 — Present",
    duration: "Ongoing",
    location: "Floral Park, New York",
    current: true,
    highlights: [
      "Building depth in languages beyond my day-to-day stack, including Go, Rust, Python, and TypeScript.",
      "Learning frameworks such as Quarkus, FastAPI, Gin, and Tokio.",
      "Using AI coding tools (Claude Code, Cursor, Copilot, Codex, Antigravity, and OpenCode) to plan, implement, test, review, and deploy personal projects and tools.",
    ],
  },
  {
    company: "Cardlytics",
    role: "Software Engineer III",
    period: "Mar 2023 — Oct 2025",
    duration: "2 yrs 8 mos",
    location: "New York (Remote)",
    highlights: [
      "Designed and implemented campaign features including annotated logos, banner images, ad reordering, and audience file imports via Amazon S3, improving campaign customization and resolving bottlenecks.",
      "Migrated core campaign build system components from ASP.NET to Spring Boot with Kotlin using Clean Architecture principles.",
      "Reduced AWS costs by ~40% by consolidating infrastructure, rightsizing compute resources, and migrating from MemoryDB to ElastiCache.",
      "Migrated CI/CD pipelines from TeamCity and Octopus to GitHub Actions, automating builds, package deployment, schema validation, and Helm-based EKS deployments.",
      "Implemented SOPS for secrets management and IRSA for secure EKS access to AWS resources, strengthening security posture.",
      "Secured the image publishing pipeline by moving assets to a private S3 bucket served via CloudFront with WAF protection.",
      "Administered Kafka topics, RabbitMQ queues, SQL databases, and Redis instances, monitoring system health with Datadog and Sumo Logic.",
      "Directed the team's globalization initiatives to unify technology stacks across regions, reducing complexity and operational costs.",
      "Participated in on-call rotations, resolving P1–P3 incidents to minimize service disruption.",
      "Developed SQL, Bash, and Python scripts and Go utilities for data repair, debugging, and reporting automation.",
      "Mentored and onboarded new hires and contractors, and coordinated cross-team work on multi-domain projects.",
    ],
  },
  {
    company: "Cardlytics",
    role: "Software Engineer II",
    period: "May 2021 — Mar 2023",
    duration: "1 yr 11 mos",
    location: "New York (Remote)",
    highlights: [
      "Maintained and enhanced ASP.NET and ASP.NET Core services for campaign publishing, along with the legacy Silverlight applications used for campaign publishing and lifecycle management.",
      "Transitioned publishing services from older ASP.NET and Silverlight Windows services to modern ASP.NET Core services running in Kubernetes.",
      "Developed Ad Delivery Manager, a workflow-driven publishing service built with Elsa Workflows, raising the campaign publish success rate to 99.9%.",
      "Led migration of services and infrastructure from on-premises to AWS using Terraform (EKS, RDS, MemoryDB, EC2), enhancing scalability and performance.",
      "Contributed to organization-wide Terraform modules, standardizing infrastructure deployment and compliance.",
      "Maintained Vue dashboards used to track campaign status and progress.",
    ],
  },
  {
    company: "Cores Logics Technologies",
    role: "Software Developer (Contract)",
    period: "Jun 2020 — Jan 2021",
    duration: "8 mos",
    location: "New York, NY",
    highlights: [
      "Designed Cores Terminal for PAX Android terminals using the BroadPOS Semi-Integration SDK in Java.",
      "Developed Cores Messaging, a real-time API built with ASP.NET Core and SignalR that optimized payment data transmission between cloud and terminals.",
      "Engineered Cores Service, a multi-platform Java controller running on Raspberry Pi devices that routes payment data between modern and legacy terminals.",
      "Diagnosed and resolved critical production issues.",
    ],
  },
  {
    company: "Merchant First",
    role: "Software Developer (EMV Terminals)",
    period: "Feb 2018 — Jun 2020",
    duration: "2 yrs 5 mos",
    location: "New York (Remote)",
    highlights: [
      "Designed and developed the FirstMile series of EMV-compliant, P2PE-secured payment applications for the PrismPay Gateway.",
      "Built FirstMile for Android in Kotlin and Java using device-specific SDKs/NDKs for PAX and Nexgo terminals, and for Miura devices in Java.",
      "Tested and validated FirstMile against EMVCo standards using the UL Brand Toolkit, and achieved UL certification.",
      "Completed EMV L3 certifications across card processors including First Data, TSYS, Chase, Vantiv, and WorldPay.",
      "Enhanced the PrismPay Gateway by fixing defects and integrating new C# components.",
      "Collaborated directly with the CEO and CTO on critical bugs and feature delivery, and presented technical solutions and progress reports to executives.",
    ],
  },
  {
    company: "Micro Merchant Systems, Inc.",
    role: "Software Developer",
    period: "Feb 2014 — Feb 2018",
    duration: "4 yrs 1 mo",
    location: "Syosset, NY",
    highlights: [
      "Developed and maintained the PrimeRx pharmacy management and PrimePOS point-of-sale applications in C# with SQL Server.",
      "Led design and delivery of Prime Installer, automating deployment and reducing setup time for client installations.",
      "Led PrimePOS development, including managing offshore developers in India, and led its transition to EMV payment processing.",
      "Integrated WorldPay into PrimePOS through FirstMile middleware, and extended payment modules to EMV transactions across gateways including XCharge, HPS, and PC Charge.",
      "Implemented tokenization in PrimePOS to protect sensitive payment data in line with PCI security standards.",
      "Designed and deployed PrimeEsc, a WPF (MVVM Light) electronic signature capture application for Ingenico devices, used to capture HIPAA-mandated patient consent.",
      "Resolved escalated customer issues using the Visual Studio debugger and SQL Server Profiler, and mentored the label-programming team.",
    ],
  },
  {
    company: "Tiburon",
    role: "Software Developer — Total Enforcement",
    period: "Aug 2013 — Jan 2014",
    duration: "6 mos",
    location: "Melville, NY",
    highlights: [
      "Developed and enhanced Total Enforcement, a public safety computer-aided dispatch and records management system used by law enforcement agencies nationwide.",
      "Designed and integrated new modules in C#, with a WPF (MVVM) UX layer and business logic and data persistence built on CSLA.NET and SQL Server.",
      "Passed an FBI background check and was certified to handle CJIS data.",
    ],
  },
  {
    company: "Micro Merchant Systems, Inc.",
    role: "Junior Programmer / QA Analyst",
    period: "Mar 2011 — Aug 2013",
    duration: "2 yrs 6 mos",
    location: "Syosset, NY",
    highlights: [
      "Developed and maintained JavaScript for printing Rx labels, receipts, health insurance claim forms, MAR sheets, and physician order forms.",
      "Redesigned NH Forms into a modular structure, improving deployment speed by up to 3×.",
      "Improved the company backup application and built an authentication service for it.",
      "Created a C# utility for Carepoints integration that scans, downloads, installs, and configures prerequisite software automatically.",
      "Supported the QA team by designing test scenarios, executing functional tests, and tracking defects in Jira.",
      "Resolved client computer hardware and printer issues.",
    ],
  },
];

export const portfolioPlaceholders = [
  {
    title: "Drive Plus Plus",
    category: "Driving School Managemnt",
    blurb:
      "Driving School management software Written in Quarkus.",
    status: "Coming soon",
  },
  {
    title: "Chanakya MCP",
    category: "MCP Server",
    blurb:
      "MCP that indexes local code and provide context to agents about other projects in your system .",
    status: "Coming soon",
  },
  {
    title: "Token Store",
    category: "Data Store",
    blurb:
      "Token storage locally .. more details coming soon.",
    status: "Coming soon",
  },
] as const;
