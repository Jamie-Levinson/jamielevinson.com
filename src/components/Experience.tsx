'use client';

import { FileText } from 'lucide-react';

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string;
}

const experiences: ExperienceItem[] = [
  {
    title: "Full-Stack Developer Co-op",
    company: "Loop Financial",
    period: "Sep 2023 - Dec 2023, Jun 2024 - Aug 2024",
    description: "Built and shipped core banking features using Rails, GraphQL, React, and TypeScript. Owned full development cycle from implementation through comprehensive testing with Cypress and RSpec, while collaborating with senior developers through code reviews."
  },
  {
    title: "Java Developer Co-op",
    company: "Paramount Commerce",
    period: "May 2022 - Aug 2022, Jun 2023 - Aug 2023",
    description: "Developed REST APIs with Java and Spring Boot to power payment processing microservices. Managed database schemas with Liquibase and PostgreSQL, ensuring reliability through comprehensive unit and integration testing."
  },
  {
    title: "Data Engineer Intern",
    company: "Thoughtwire",
    period: "May 2021 - Aug 2021",
    description: "Transformed complex healthcare data into actionable insights through interactive PowerBI dashboards. Collaborated with cross-functional teams in an agile environment to deliver data solutions for enterprise clients."
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
            <div key={index} className="flex gap-6 items-center">
              {/* Logo Circle */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add company website links
                  console.log(`Clicked ${exp.company} logo`);
                }}
                className="flex-shrink-0 w-20 h-20 rounded-full border-2 border-foreground bg-background hover:bg-foreground hover:text-background hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer"
              >
                <span className="text-2xl font-bold">
                  {exp.company.charAt(0)}
                </span>
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
