'use client';

import { Mail, Phone, Github, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="min-h-screen flex items-center px-6 py-20 border-t border-border">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16">
          Contact
        </h2>

        <div className="space-y-10">
          <p className="text-base text-foreground leading-relaxed">
            I'm currently seeking opportunities in software engineering. 
            Feel free to reach out if you'd like to connect.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="mailto:jamie.levinson@uwaterloo.ca"
              className="group flex items-center gap-4 p-4 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center group-hover:bg-secondary transition-colors">
                <Mail className="w-6 h-6 text-background" />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium">Email</p>
                <p className="text-sm text-foreground font-medium">jamie.levinson@uwaterloo.ca</p>
              </div>
            </a>

            <a
              href="tel:647-530-3009"
              className="group flex items-center gap-4 p-4 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center group-hover:bg-secondary transition-colors">
                <Phone className="w-6 h-6 text-background" />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium">Phone</p>
                <p className="text-sm text-foreground font-medium">647-530-3009</p>
              </div>
            </a>

            <a
              href="https://github.com/Jamie-Levinson"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center group-hover:bg-secondary transition-colors">
                <Github className="w-6 h-6 text-background" />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium">GitHub</p>
                <p className="text-sm text-foreground font-medium">github.com/Jamie-Levinson</p>
              </div>
            </a>

            <a
              href="https://linkedin.com/in/jamielevinson"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 border border-border hover:border-2 hover:border-foreground hover:scale-105 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center group-hover:bg-secondary transition-colors">
                <Linkedin className="w-6 h-6 text-background" />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium">LinkedIn</p>
                <p className="text-sm text-foreground font-medium">linkedin.com/in/jamielevinson</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}