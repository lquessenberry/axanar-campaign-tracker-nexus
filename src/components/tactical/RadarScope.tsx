"use client"

import { motion } from "framer-motion"
import { GlassPanel } from "./GlassPanel"

export const DaystromRadarScope = ({ contacts = 3 }) => {
  return (
    <GlassPanel className="relative h-96 bg-background/90 overflow-hidden" alertLevel="red">
      <div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,transparent_40%,hsl(var(--primary))_100%)]"
      />

      {/* Sweeping radar arm */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(var(--primary)) 15deg, transparent 30deg)",
        }}
      />

      {/* Enemy blips */}
      {[...Array(contacts)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
          className="absolute w-4 h-4 bg-destructive rounded-full shadow-[0_0_20px_hsl(var(--destructive))]"
          style={{
            top: `${30 + Math.random() * 40}%`,
            left: `${30 + Math.random() * 40}%`,
          }}
        />
      ))}

      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="font-mono text-primary text-2xl tracking-widest animate-pulse uppercase">
          BLIND FIRE · ATOMIC WARHEADS ARMED
        </p>
      </div>
    </GlassPanel>
  )
}
