'use client';

import { Mail, Download, MessageCircle } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center px-4 sm:px-6 pt-24 pb-12 md:py-20 overflow-hidden relative">
      {/* Background gradients/blobs - hidden on mobile for performance */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 -z-10 animate-pulse hidden md:block" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-foreground/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 -z-10 hidden md:block" />

      <div className="max-w-6xl mx-auto w-full z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-12 lg:gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Content */}
          <div className="space-y-5 md:space-y-8 order-2 lg:order-1">
            {/* Name */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-tight">
                Jamie <br className="hidden md:block" />
                Levinson
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="space-y-6">
              <p className="text-base md:text-lg text-secondary leading-relaxed max-w-2xl">
                Recent <span className="text-foreground font-medium">UWaterloo</span> CS grad turned full-stack engineer. I&apos;ve shipped real products across fintech and modern web stacks, and now I&apos;m building the world&apos;s most advanced AI super connector.
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-secondary">Building @ <a href="https://boardy.ai" target="_blank" rel="noopener noreferrer" className="text-foreground font-bold hover:underline">Boardy</a></span>
              </div>
            </motion.div>

            {/* Education & Interests */}
            <motion.div variants={itemVariants} className="space-y-4 md:space-y-6 pt-1 md:pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-secondary mb-1.5 md:mb-2 font-semibold">Education</h3>
                  <p className="text-foreground text-sm">Bachelor of Computer Science (Co-op), University of Waterloo</p>
                  <p className="text-secondary text-xs mt-1">Sep 2020 — May 2025</p>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-secondary mb-1.5 md:mb-2 font-semibold">Interests</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {['Travel', 'Gaming', 'Sports', 'Tech', 'Music'].map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 md:py-1 text-xs border border-border rounded bg-background/50 text-secondary"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 md:gap-4 pt-3 md:pt-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#contact"
                className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors text-sm md:text-base"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Me</span>
              </motion.a>

              <div className="flex gap-2">
                <motion.a
                  whileHover={{ y: -2 }}
                  href="mailto:jamie@levinson.ca"
                  className="p-2.5 md:p-3 border border-border rounded-lg hover:border-foreground transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href="https://linkedin.com/in/jamielevinson1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 md:p-3 border border-border rounded-lg hover:border-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>
                
                <motion.a
                  whileHover={{ y: -2 }}
                  href="https://github.com/Jamie-Levinson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 md:p-3 border border-border rounded-lg hover:border-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href="/JamieLevinsonResume.pdf"
                  download="JamieLevinsonResume.pdf"
                  className="p-2.5 md:p-3 border border-border rounded-lg hover:border-foreground transition-colors"
                  aria-label="Download Resume"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Photo */}
          <motion.div 
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            variants={itemVariants}
          >
            <motion.div 
              className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 perspective-1000"
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Decorative elements - hidden on mobile */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent rounded-[1.5rem] md:rounded-[2rem] transform rotate-6 translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-4 -z-10 hidden sm:block"
                animate={{ 
                  rotate: [6, 8, 6],
                  translateY: [4, 8, 4] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              <div className="absolute inset-0 border-2 border-foreground/10 rounded-[1.5rem] md:rounded-[2rem] transform -rotate-3 -translate-x-1 -translate-y-1 md:-translate-x-2 md:-translate-y-2 -z-10 hidden sm:block" />
              
              <div className="w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-border bg-background shadow-xl md:shadow-2xl relative z-10 group cursor-pointer">
                <Image
                  src="/profile_pic.jpg"
                  alt="Jamie Levinson"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                
                {/* Overlay shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
