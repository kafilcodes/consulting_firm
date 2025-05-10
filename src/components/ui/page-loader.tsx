'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const loaderVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center transition-all",
  {
    variants: {
      variant: {
        default: "bg-white",
        subtle: "bg-white/90 backdrop-blur-sm",
        light: "bg-gray-50",
        blur: "bg-white/50 backdrop-blur-md",
        gradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
        transparent: "bg-transparent"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PageLoaderProps extends VariantProps<typeof loaderVariants> {
  text?: string
  logo?: boolean
  className?: string
}

// SVG animation variants
const svgVariants = {
  hidden: { rotate: -5, opacity: 0 },
  visible: { 
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

const pathVariants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: { 
    opacity: 1, 
    pathLength: 1,
    transition: { 
      duration: 1.5, 
      ease: "easeInOut"
    }
  }
}

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  })
}

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.5, duration: 0.5 }
  }
}

export function PageLoader({ 
  variant, 
  text = "Loading, please wait...", 
  logo = false,
  className 
}: PageLoaderProps) {
  return (
    <motion.div
      className={cn(loaderVariants({ variant, className }))}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center justify-center">
        {logo ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={svgVariants}
            className="mb-6"
          >
            {/* Placeholder for logo SVG animation */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              <motion.path
                d="M40 10 L70 60 L10 60 Z"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                variants={pathVariants}
              />
              <motion.circle 
                cx="40" 
                cy="32" 
                r="6" 
                fill="#4f46e5" 
                variants={circleVariants}
                custom={0}
              />
            </svg>
          </motion.div>
        ) : (
          <div className="relative w-20 h-20 mb-6">
            <motion.div 
              className="w-20 h-20 border-4 border-blue-200 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div 
              className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >
              <div className="w-14 h-14 bg-blue-50 rounded-full" />
            </motion.div>
          </div>
        )}
        
        {text && (
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <p className="text-gray-700 font-medium">{text}</p>
            <div className="mt-2 flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ 
                    y: ["0%", "-50%", "0%"],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Alternative loader styles
export function CircularLoader({ className }: { className?: string }) {
  return (
    <motion.div 
      className={cn("relative w-12 h-12", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-0 w-full h-full border-4 border-transparent rounded-full"
          style={{ 
            borderTopColor: '#3b82f6',
            transform: `rotate(${i * 45}deg)`
          }}
          animate={{ rotate: [i * 45, i * 45 + 360] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear", 
            delay: i * 0.2
          }}
        />
      ))}
    </motion.div>
  )
}

// Dot loader
export function DotLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-2", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Pulse loader
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="absolute -inset-1 rounded-full bg-blue-400 opacity-20"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="relative w-8 h-8 bg-blue-600 rounded-full"
        animate={{ 
          scale: [0.9, 1, 0.9],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
} 