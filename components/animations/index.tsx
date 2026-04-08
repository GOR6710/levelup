"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

// Fade In animation wrapper
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
  direction = "up",
}: FadeInProps) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for children animations
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger item to be used inside StaggerContainer
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale animation on hover
interface ScaleOnHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnHover({
  children,
  className = "",
  scale = 1.02,
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glow effect on hover
interface GlowOnHoverProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowOnHover({
  children,
  className = "",
  glowColor = "rgba(0, 212, 255, 0.4)",
}: GlowOnHoverProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}`,
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Number counter animation
interface CounterAnimationProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function CounterAnimation({
  value,
  duration = 1,
  className = "",
  suffix = "",
  prefix = "",
}: CounterAnimationProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for notifications/badges
interface PulseBadgeProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function PulseBadge({
  children,
  className = "",
  color = "#00d4ff",
}: PulseBadgeProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <motion.span
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Shimmer loading effect
interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className = "" }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ["-200%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Confetti explosion effect (simplified)
interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiEffect({ trigger, onComplete }: ConfettiProps) {
  const colors = ["#00d4ff", "#00ff88", "#a855f7", "#ffaa00", "#ff4444"];
  const particles = Array.from({ length: 20 });

  return (
    <AnimatePresence>
      {trigger && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {particles.map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0,
                rotate: Math.random() * 720,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1 + Math.random(),
                ease: "easeOut",
              }}
              onAnimationComplete={i === 0 ? onComplete : undefined}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Typing animation for text
interface TypeWriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypeWriter({
  text,
  delay = 0,
  speed = 0.03,
  className = "",
  onComplete,
}: TypeWriterProps) {
  const characters = text.split("");

  return (
    <motion.span className={className}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.1,
            delay: delay + i * speed,
            ease: "easeOut",
          }}
          onAnimationComplete={i === characters.length - 1 ? onComplete : undefined}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  duration?: number;
}

export function AnimatedProgress({
  value,
  max = 100,
  className = "",
  barClassName = "",
  duration = 1,
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`relative overflow-hidden rounded-full bg-muted ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
      {/* Shimmer effect on progress bar */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
