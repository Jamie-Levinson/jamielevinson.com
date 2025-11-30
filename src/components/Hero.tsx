'use client';

import { Github, Linkedin, Mail, Download } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Name */}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Jamie Levinson
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-foreground leading-relaxed max-w-2xl">
              I&apos;m a recent CS grad from the University of Waterloo and a full-stack engineer with experience shipping real products across fintech and modern web stacks. Hit my line if you want to create something great together.
            </p>

            <p className="text-base md:text-lg text-foreground leading-relaxed max-w-2xl">
              Currently building @ <a href="https://boardy.ai" target="_blank" rel="noopener noreferrer" className="underline decoration-border hover:decoration-foreground transition-colors">Boardy</a>.
            </p>

            {/* Education & Interests */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary mb-1">Education</p>
                <p className="text-foreground">Honours Bachelor of Computer Science (Co-op), University of Waterloo (Sep 2020 — May 2025)</p>
              </div>

              <div>
                <p className="text-sm text-secondary mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {['Travel', 'Gaming', 'Sports', 'Technology', 'Fantasy Football'].map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 text-sm border border-border rounded-full text-foreground"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://linkedin.com/in/jamielevinson1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/Jamie-Levinson"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>

              <a
                href="mailto:jamie@levinson.ca"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>

              <a
                href="/JamieLevinsonResume.pdf"
                download="JamieLevinsonResume.pdf"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Resume</span>
              </a>
            </div>
          </div>

          {/* Right Column - Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-72 h-72 md:w-80 md:h-80 rounded-full border-4 border-foreground overflow-hidden bg-background shadow-lg flex-shrink-0">
              <Image
                src="/profile_pic.jpg"
                alt="Jamie Levinson"
                width={320}
                height={320}
                className="w-full h-full object-cover object-left"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
