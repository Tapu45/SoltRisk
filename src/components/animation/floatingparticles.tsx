"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FloatingParticlesProps {
  particleCount?: number;
  className?: string;
}

interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  animateX: number;
  animateY: number;
  duration: number;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  particleCount = 20,
  className = "",
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Generate particles only on client side
    const generateParticles = () => {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        initialX: Math.random() * window.innerWidth,
        initialY: Math.random() * window.innerHeight,
        animateX: Math.random() * window.innerWidth,
        animateY: Math.random() * window.innerHeight,
        duration: Math.random() * 15 + 10,
      }));
      setParticles(newParticles);
    };

    generateParticles();

    // Regenerate particles on window resize
    const handleResize = () => {
      generateParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [particleCount]);

  // Don't render anything on server side
  if (!isClient) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-30"
          initial={{
            x: particle.initialX,
            y: particle.initialY,
          }}
          animate={{
            x: particle.animateX,
            y: particle.animateY,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;