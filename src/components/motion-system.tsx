"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { Pause, Play, ArrowUpRight } from "lucide-react";

const MotionContext = createContext(true);
export function useMotionEnabled() {
  return useContext(MotionContext);
}

export function MotionStage({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const enabled = !prefersReduced && !paused;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <MotionContext.Provider value={enabled}>
      <MotionConfig reducedMotion={enabled ? "never" : "always"}>
        <div data-motion={enabled ? "on" : "off"}>
          {enabled && (
            <motion.div
              className="reading-progress"
              style={{ scaleX: progress }}
              aria-hidden="true"
            />
          )}
          {children}
          <button
            className="motion-control"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused || !!prefersReduced}
            disabled={!!prefersReduced}
            aria-label={enabled ? "Pausar animaciones" : "Activar animaciones"}
            title={
              prefersReduced
                ? "Movimiento reducido activado en tu dispositivo"
                : enabled
                  ? "Pausar animaciones"
                  : "Activar animaciones"
            }
          >
            {enabled ? <Pause size={13} /> : <Play size={13} />}
            <span>{enabled ? "Pausar movimiento" : "Movimiento reducido"}</span>
          </button>
        </div>
      </MotionConfig>
    </MotionContext.Provider>
  );
}

export function Reveal({
  children,
  id,
  className,
  delay = 0,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  delay?: number;
}) {
  const enabled = useMotionEnabled();
  return (
    <motion.section
      id={id}
      className={className}
      initial={enabled ? { opacity: 0, y: 48 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      animate={!enabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: "some", margin: "0px 0px -70px 0px" }}
      transition={{
        duration: enabled ? 0.85 : 0,
        delay: enabled ? delay : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.section>
  );
}

export function RevealBlock({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const enabled = useMotionEnabled();
  return (
    <motion.div
      initial={enabled ? { opacity: 0, y: 32 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      animate={!enabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: "some", margin: "0px 0px -55px 0px" }}
      transition={{
        duration: enabled ? 0.75 : 0,
        delay: enabled ? delay : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function Manifesto() {
  return (
    <div
      className="manifesto-strip manifesto-moving"
      aria-label="Escuchar. Comprender. Crear. Conectar."
    >
      <div className="manifesto-track" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div className="manifesto-group" key={i}>
            <span>ESCUCHAR.</span>
            <ArrowUpRight />
            <span>COMPRENDER.</span>
            <ArrowUpRight />
            <span>CREAR.</span>
            <ArrowUpRight />
            <span>CONECTAR.</span>
            <ArrowUpRight />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StaggerItem({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const enabled = useMotionEnabled();
  return (
    <motion.article
      initial={enabled ? { opacity: 0, y: 28 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      animate={!enabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: enabled ? 0.6 : 0,
        delay: enabled ? index * 0.1 : 0,
      }}
      whileHover={enabled ? { y: -5 } : undefined}
    >
      {children}
    </motion.article>
  );
}
