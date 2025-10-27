'use client';

import { FileText } from 'lucide-react';
import Image from 'next/image';

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string;
  logo: string;
  url: string;
}

const experiences: ExperienceItem[] = [
  {
    title: "Full-Stack Developer Co-op",
    company: "Loop Financial",
    period: "Sep 2023 - Dec 2023, Jun 2024 - Aug 2024",
    description: "Built and shipped core banking features using Rails, GraphQL, React, and TypeScript. Owned full development cycle from implementation through comprehensive testing with Cypress and RSpec, while collaborating with senior developers through code reviews.",
    logo: '/loop_financial_logo.png',
    url: 'https://www.bankonloop.com/en-ca'
  },
  {
    title: "Java Developer Co-op",
    company: "Paramount Commerce",
    period: "May 2022 - Aug 2022, Jun 2023 - Aug 2023",
    description: "Developed REST APIs with Java and Spring Boot to power payment processing microservices. Managed database schemas with Liquibase and PostgreSQL, ensuring reliability through comprehensive unit and integration testing.",
    logo: '/paramount_commerce_logo.jpg',
    url: 'https://www.paramountcommerce.com/'
  },
  {
    title: "Data Engineer Intern",
    company: "Thoughtwire",
    period: "May 2021 - Aug 2021",
    description: "Transformed complex healthcare data into actionable insights through interactive PowerBI dashboards. Collaborated with cross-functional teams in an agile environment to deliver data solutions for enterprise clients.",
    logo: '/thoughtwire_logo.png',
    url: 'https://www.thoughtwire.com/'
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
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add resume download functionality
            console.log('Resume download clicked');
          }}
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
              <a
                href={exp.url}
                target="_blank"
                rel="noopener noreferrer"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
