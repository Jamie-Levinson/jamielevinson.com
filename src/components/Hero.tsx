'use client';

import { Github, Linkedin, Mail, Download } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Name */}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Jamie Levinson
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-foreground leading-relaxed max-w-2xl">
              I'm a software engineer passionate about building robust, user-focused applications. 
              With experience across full-stack development, backend systems, and data engineering, 
              I enjoy solving complex problems and shipping quality code that makes an impact.
            </p>

            {/* Education & Interests */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary mb-1">Education</p>
                <p className="text-foreground">Bachelor of Computer Science, University of Waterloo (2020-2025)</p>
              </div>
              
              <div>
                <p className="text-sm text-secondary mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {['Gaming', 'Traveling', 'Fantasy Football', 'Sports', 'Coffee', 'Open Source'].map((interest) => (
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
                href="https://linkedin.com/in/jamielevinson"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              
              <a
                href="https://github.com/jamielevinson"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              
              <a
                href="mailto:jamie.levinson@uwaterloo.ca"
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
              
              <button
                onClick={() => {
                  // TODO: Add resume download functionality
                  console.log('Resume download clicked');
                }}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Resume</span>
              </button>
            </div>
          </div>

          {/* Right Column - Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-64 h-64 rounded-full border-4 border-foreground flex items-center justify-center bg-background shadow-lg">
              <span className="text-6xl font-bold text-foreground">JL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
