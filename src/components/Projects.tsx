'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Project {
  name: string;
  description: string;
  githubUrl: string;
  preview: string; // GIF/image URL
  technologies: string[];
  year: number;
}

const projects: Project[] = [
  {
    name: "Bet Buddy (WIP)",
    description: "Currently building a sports betting sidekick. Bet Buddy will track your bets across multiple sportsbooks and be a contextual memory engine for decision hygiene tips.",
    githubUrl: "https://github.com/Jamie-Levinson/bet-buddy",
    preview: "/project_gifs/betbuddy.gif",
    technologies: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Prisma",
      "shadcn/ui"
    ],
    year: 2025
  },
  {
    name: "This Site!",
    description: "A modern, responsive portfolio built with Next.js, TypeScript, and Tailwind CSS. Features a draggable theme toggle with smooth View Transitions API animations, dark mode support, and a clean minimalist design.",
    githubUrl: "https://github.com/Jamie-Levinson/jamielevinson.com",
    preview: "/project_gifs/portfolio.gif",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Framer Motion"
    ],
    year: 2025
  },
  {
    name: "Stickies++",
    description: "A desktop notes application built with Kotlin, JavaFX, and Gradle. Features customizable note creation, multi-window workspace management, and lightweight web service + persistence layers.",
    githubUrl: "https://github.com/Jamie-Levinson/Straights",
    preview: "/project_gifs/stickies++.gif",
    technologies: [
      "Kotlin",
      "JavaFX",
      "Gradle",
      "GitLab"
    ],
    year: 2023
  },
  {
    name: "Straights",
    description: "An interactive text-based card game written in C++ using object-oriented design principles. A 4-player game where players compete to accumulate the fewest points.",
    githubUrl: "https://github.com/Jamie-Levinson/Straights",
    preview: "/project_gifs/straights.gif",
    technologies: [
      "C++",
      "MakeFile"
    ],
    year: 2022
  }
];

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToProject = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section id="projects" className="min-h-screen flex items-center px-4 sm:px-6 py-16 md:py-20 relative overflow-hidden">
      {/* Background decoration - hidden on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10 hidden md:block" />

      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center md:flex-row md:justify-between md:items-end mb-8 md:mb-12">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-foreground mb-2 md:mb-4"
            >
              Projects
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-secondary text-base md:text-lg"
            >
              Some things I&apos;ve built
            </motion.p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prevProject}
              className="p-2.5 md:p-3 rounded-full border border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={nextProject}
              className="p-2.5 md:p-3 rounded-full border border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
              aria-label="Next project"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div 
              animate={{ x: `-${currentIndex * 100}%` }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} // Smooth easeOutCubic-ish curve
              className="flex"
              style={{ willChange: 'transform' }} // Optimization hint
            >
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-1 md:px-2"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 lg:gap-12 bg-background/50 backdrop-blur-sm border border-border rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 shadow-sm hover:shadow-xl transition-shadow duration-500">
                    {/* Project Preview */}
                    <div className="relative group rounded-xl md:rounded-2xl overflow-hidden border border-border/50 bg-secondary/5 aspect-video lg:aspect-auto flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent z-10" />
                      <Image
                        src={project.preview}
                        alt={`${project.name} preview`}
                        width={600}
                        height={400}
                        className="w-full h-full object-contain p-2 md:p-4 group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>

                    {/* Project Info */}
                    <div className="flex flex-col justify-center space-y-4 md:space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                            {project.name}
                          </h3>
                          <span className="text-xs md:text-sm font-mono text-secondary border border-border px-2 py-0.5 md:py-1 rounded flex-shrink-0">
                            {project.year}
                          </span>
                        </div>
                        
                        <p className="text-secondary text-sm md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-5 md:mb-8">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium border border-border rounded-full bg-secondary/5 text-secondary"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-3 md:pt-4 border-t border-border">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity text-sm md:text-base"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span>View Code</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => goToProject(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-foreground'
                    : 'w-2 bg-border hover:bg-secondary'
                }`}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
