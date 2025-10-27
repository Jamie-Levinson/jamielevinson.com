'use client';

import { Mail, Github, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-12 px-6 border-t border-blue-gray-200 dark:border-blue-gray-600 bg-white dark:bg-blue-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Contact
            </h2>
            <p className="text-secondary">
              Let's connect and discuss opportunities
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary" />
                <a
                  href="mailto:jamie.levinson@uwaterloo.ca"
                  className="text-foreground hover:text-accent"
                >
                  jamie.levinson@uwaterloo.ca
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Github className="w-4 h-4 text-secondary" />
                <a
                  href="https://github.com/jamielevinson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-accent"
                >
                  github.com/jamielevinson
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 text-secondary text-xs">📱</span>
                <a
                  href="tel:647-530-3009"
                  className="text-foreground hover:text-accent"
                >
                  647-530-3009
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Send a message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="px-3 py-2 border border-blue-gray-300 dark:border-blue-gray-500 rounded bg-white dark:bg-blue-gray-800 text-foreground placeholder-secondary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-3 py-2 border border-blue-gray-300 dark:border-blue-gray-500 rounded bg-white dark:bg-blue-gray-800 text-foreground placeholder-secondary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-3 py-2 border border-blue-gray-300 dark:border-blue-gray-500 rounded bg-white dark:bg-blue-gray-800 text-foreground placeholder-secondary focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <textarea
                  rows={4}
                  placeholder="Message"
                  className="w-full px-3 py-2 border border-blue-gray-300 dark:border-blue-gray-500 rounded bg-white dark:bg-blue-gray-800 text-foreground placeholder-secondary focus:outline-none focus:ring-1 focus:ring-accent"
                ></textarea>
                <button
                  type="submit"
                  className="px-4 py-2 bg-foreground text-background rounded hover:bg-secondary"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}