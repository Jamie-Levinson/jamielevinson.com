'use client';

import { useState } from 'react';
import { Github, ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
  name: string;
  description: string;
  githubUrl: string;
  preview: string; // GIF/image URL
  technologies: string[];
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
      "React",
      "Supabase",
      "Prisma",
      "shadcn/ui"
    ]
  },
  {
    name: "This Site!",
    description: "A modern, responsive portfolio built with Next.js, TypeScript, and Tailwind CSS. Features a draggable theme toggle with smooth View Transitions API animations, dark mode support, and a clean minimalist design.",
    githubUrl: "https://github.com/Jamie-Levinson/jamielevinson.com",
    preview: "/project_gifs/portfolio.gif",
    technologies: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "shadcn/ui"
    ]
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
    ]
  },
  {
    name: "Straights",
    description: "An interactive text-based card game written in C++ using object-oriented design principles. A 4-player game where players compete to accumulate the fewest points.",
    githubUrl: "https://github.com/Jamie-Levinson/Straights",
    preview: "/project_gifs/straights.gif",
    technologies: [
      "C++",
      "MakeFile"
    ]
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
    <section id="projects" className="min-h-screen flex items-center px-6 py-12 md:py-16 border-t border-border">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Projects
          </h2>
          <p className="text-base text-secondary">
            Some things I&apos;ve been building lately
          </p>
        </div>

        {/* Project Card Carousel */}
        <div className="relative">
          <div className="overflow-hidden px-2 py-2">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <div className="bg-background border border-border rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-shadow duration-200 max-w-xl mx-auto">
                    {/* Project Preview */}
                    <div className="relative w-full h-64 bg-border/20 overflow-hidden flex items-center justify-center border-b-2 border-border p-2 rounded-t-lg">
                      <div className="w-full h-full rounded-md bg-background/80 p-1 flex items-center justify-center">
                        <img
                          src={project.preview}
                          alt={`${project.name} preview`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1.5">
                          {project.name}
                        </h3>
                        <p className="text-xs text-secondary leading-relaxed mb-3">
                          {project.description}
                        </p>
                        {/* Technology Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-[10px] border border-border rounded bg-background/50 text-secondary"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-border hover:border-foreground hover:bg-accent/10 transition-all duration-200 text-xs text-foreground"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>View on GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {projects.length > 1 && (
            <>
              <button
                onClick={prevProject}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full border border-border bg-background hover:bg-accent/10 flex items-center justify-center transition-colors duration-200 z-10"
                aria-label="Previous project"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={nextProject}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full border border-border bg-background hover:bg-accent/10 flex items-center justify-center transition-colors duration-200 z-10"
                aria-label="Next project"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </>
          )}

          {/* Project Indicators */}
          {projects.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToProject(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ease-out ${
                    index === currentIndex
                      ? 'bg-foreground w-8'
                      : 'bg-border hover:bg-secondary'
                  }`}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

