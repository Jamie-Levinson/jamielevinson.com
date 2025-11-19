'use client';

import { FileText } from 'lucide-react';
import Image from 'next/image';

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string;
  logo?: string;
  url?: string;
  technologies: string[];
}

const experiences: ExperienceItem[] = [
  {
    title: "Full-Stack Software Engineer",
    company: "Loop Financial",
    period: "Sep – Dec 2023 and Jun – Dec 2024",
    description: "Core contributor to a major overhaul of Loop's high-volume credit-card program, the system Canadian businesses rely on for multi-currency spending and global banking. Shipped full-stack features across the platform and helped modernize authorization logic powering thousands of daily transactions.",
    logo: '/company_logos/loop_financial_logo.png',
    url: 'https://www.bankonloop.com/en-ca',
    technologies: [
      "Ruby on Rails",
      "TypeScript",
      "React",
      "GraphQL",
      "CircleCI"
    ]
  },
  {
    title: "Java Developer Co-op",
    company: "Paramount Commerce",
    period: "May – Aug 2022 and Jun – Aug 2023",
    description: "Built REST APIs across microservices and maintained database schema to support Paramount's real-time, bank-integrated payment rails used by merchants across North America. Strengthened backend reliability through extensive testing and service improvements.",
    logo: '/company_logos/paramount_commerce_logo.jpg',
    url: 'https://www.paramountcommerce.com/',
    technologies: [
      "Python",
      "REST API",
      "Spring Boot",
      "Postgres"
    ]
  },
  {
    title: "Data Engineer Intern",
    company: "Thoughtwire",
    period: "May 2021 — Aug 2021",
    description: "Crafted realistic, large-scale data sets to simulate ThoughtWire's digital-twin platform for hospitals and enterprise environments. Developed dashboards that delivered actionable insights about people, processes, and physical spaces for clients and stakeholders.",
    logo: '/company_logos/thoughtwire_logo.png',
    url: 'https://www.thoughtwire.com/',
    technologies: [
      "PowerBI",
      "SQL",
      "Excel"
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="min-h-screen flex items-center px-6 py-20 border-t border-border">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          Work Experience
        </h2>

        {/* Resume Link */}
        <a
          href="/JamieLevinsonResume.pdf"
          download="JamieLevinsonResume.pdf"
          className="inline-flex items-center gap-2 text-sm text-secondary hover:text-foreground transition-colors mb-12 group"
        >
          <FileText className="w-4 h-4" />
          <span className="underline decoration-border group-hover:decoration-foreground">
            Dive deeper with my resume
          </span>
        </a>

        {/* Timeline */}
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <div key={index} className="flex gap-6 items-start">
              {/* Logo Circle */}
              {exp.logo ? (
                <a
                  href={exp.url || '#'}
                  target={exp.url ? "_blank" : undefined}
                  rel={exp.url ? "noopener noreferrer" : undefined}
                  className="flex-shrink-0 w-20 h-20 rounded-full border-2 border-border hover:border-foreground hover:scale-110 transition-all duration-200 flex items-center justify-center cursor-pointer overflow-hidden bg-background"
                >
                  <Image
                    src={exp.logo}
                    alt={`${exp.company} logo`}
                    width={72}
                    height={72}
                    className="rounded-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex-shrink-0 w-20 h-20 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <span className="text-2xl font-bold text-foreground">
                    {exp.company.charAt(0)}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1">
                  <h3 className="font-bold text-foreground">{exp.title}</h3>
                  <span className="text-xs text-secondary">{exp.period}</span>
                </div>
                <p className="text-sm text-secondary">{exp.company}</p>
                <p className="text-sm text-foreground leading-relaxed pt-1">
                  {exp.description}
                </p>
                {/* Technology Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] border border-border rounded bg-background/50 text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
