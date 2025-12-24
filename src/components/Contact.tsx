'use client';

import { Mail, ArrowUpRight } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    display: "jamie@levinson.ca",
    href: "mailto:jamie@levinson.ca",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    display: "Connect on LinkedIn",
    href: "https://linkedin.com/in/jamielevinson1",
  },
  {
    icon: FaGithub,
    label: "GitHub",
    display: "@Jamie-Levinson",
    href: "https://github.com/Jamie-Levinson",
  }
];

export default function Contact() {
  return (
    <section id="contact" className="min-h-[80vh] flex items-center px-4 sm:px-6 py-16 md:py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-8 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4"
          >
            Let&apos;s Connect
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-secondary"
          >
            I&apos;m always open to discussing new projects, creative ideas, or just chatting. Hit my line!
          </motion.p>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              target={method.href.startsWith('http') ? "_blank" : undefined}
              rel={method.href.startsWith('http') ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center justify-between p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl border border-border bg-background hover:bg-secondary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-300 flex-shrink-0">
                  <method.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-secondary mb-0.5 md:mb-1">
                    {method.label}
                  </p>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-foreground truncate">
                    {method.display}
                  </p>
                </div>
              </div>

              <div className="w-9 h-9 md:w-12 md:h-12 rounded-full border border-border flex items-center justify-center group-hover:border-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-300 flex-shrink-0 ml-2">
                <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-secondary">
            © {new Date().getFullYear()} Jamie Levinson. All rights reserved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
