'use client';

import { FileText, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
    title: "Software Engineer",
    company: "Boardy",
    period: "Nov 2025 — Present",
    description: "Currently building the future of professional networking at a fast-paced startup. Boardy uses intelligent matching and conversational AI to connect the right people (founders with investors, talent with opportunities), cutting through the noise that makes traditional networking painful.",
    logo: '/company_logos/boardy_logo.png',
    url: 'https://boardy.ai',
    technologies: [
      "TypeScript",
      "AI/ML",
      "React",
      "Nest.js"
    ]
  },
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
    <section id="experience" className="min-h-screen flex items-center px-4 sm:px-6 py-16 md:py-20 relative">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-10 md:mb-16 gap-3 md:gap-0"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Work Experience
          </h2>
          
          <a
            href="/JamieLevinsonResume.pdf"
            download="JamieLevinsonResume.pdf"
            className="group flex items-center gap-2 text-xs md:text-sm font-medium text-secondary hover:text-foreground"
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="border-b border-border group-hover:border-foreground">
              Dive deeper with my resume
            </span>
          </a>
        </motion.div>

        <div className="relative">
          {/* Dotted Timeline - positioned to center through logos */}
          <div 
            className="absolute left-[31px] top-8 bottom-8 w-px hidden md:block"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 6px, transparent 6px, transparent 12px)'
            }}
          />

          <div className="space-y-4 md:space-y-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 group"
              >
                {/* Logo/Marker */}
                <div className="hidden md:flex flex-col items-center relative z-10">
                  {exp.logo ? (
                    <a
                      href={exp.url || '#'}
                      target={exp.url ? "_blank" : undefined}
                      rel={exp.url ? "noopener noreferrer" : undefined}
                      className="w-16 h-16 rounded-full border-2 border-border bg-background flex items-center justify-center shadow-sm hover:shadow-lg hover:border-foreground hover:scale-110 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={exp.logo}
                          alt={`${exp.company} logo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </a>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-border bg-background flex items-center justify-center shadow-sm">
                      <span className="text-lg font-bold">{exp.company[0]}</span>
                    </div>
                  )}
                </div>

                {/* Content Card */}
                <div className="relative p-4 md:p-6 rounded-xl md:rounded-2xl border border-border bg-background/50 hover:bg-background hover:border-foreground/20 transition-all duration-300 group-hover:shadow-lg">
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                      <div className="flex items-start gap-3">
                        {/* Mobile Logo */}
                        {exp.logo && (
                          <a
                            href={exp.url || '#'}
                            target={exp.url ? "_blank" : undefined}
                            rel={exp.url ? "noopener noreferrer" : undefined}
                            className="md:hidden w-10 h-10 rounded-full border border-border bg-background flex-shrink-0 overflow-hidden"
                          >
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                              <Image
                                src={exp.logo}
                                alt={`${exp.company} logo`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </a>
                        )}
                        <div>
                          <h3 className="text-base md:text-xl font-bold text-foreground flex items-center gap-2">
                            {exp.title}
                            {exp.url && (
                              <a 
                                href={exp.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-foreground"
                              >
                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </a>
                            )}
                          </h3>
                          <p className="text-foreground/80 font-medium text-sm md:text-base">{exp.company}</p>
                        </div>
                      </div>
                      <span className="text-[10px] md:text-xs font-medium text-secondary bg-secondary/5 px-2 py-0.5 rounded-full w-fit">
                        {exp.period}
                      </span>
                    </div>
                  </div>

                  <p className="text-secondary leading-relaxed mb-3 md:mb-4 text-xs md:text-sm">
                    {exp.description}
                  </p>

                  <div className="flex flex-wrap gap-1 md:gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-[10px] md:text-xs font-medium border border-border rounded-full bg-secondary/5 text-secondary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
