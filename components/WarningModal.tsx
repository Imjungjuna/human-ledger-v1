"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CREEPY_STYLE } from "@/lib/utils";

export function WarningModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setGlitchActive(true);
      timers.push(setTimeout(() => setGlitchActive(false), 200));
    }, 500));

    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      timers.push(setTimeout(() => setGlitchActive(false), 200));
    }, 10000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(glitchInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      style={CREEPY_STYLE}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`relative w-full max-w-lg mx-4 p-6 sm:p-8 bg-black border-2 rounded-lg border-red-900 ${glitchActive ? "glitch-active" : ""}`}
      >
        <div className="space-y-4">
          <div
            className={`text-red-500 text-3xl sm:text-4xl font-semibold mb-6 text-center ${glitchActive ? "glitch-text" : ""}`}
            style={CREEPY_STYLE}
          >
            ⚠ 경고
          </div>
          <div
            className={`text-red-400 text-lg sm:text-xl space-y-4 leading-relaxed ${glitchActive ? "glitch-text" : ""}`}
            style={CREEPY_STYLE}
          >
            <p className="text-red-500 font-semibold">본 사이트는 귀하의 개인정보를 수집합니다.</p>
            <p>
              입력하신 모든 정보는 암시장에서 거래될 수 있으며, 귀하의 신체 부위 가격 평가에 사용됩니다.
            </p>
            <p>제공된 정보는 법적 보호를 받지 못하며, 제3자에게 판매될 수 있습니다.</p>
            <p className="text-red-500 font-semibold mt-6 text-center">정말로 계속 진행하시겠습니까?</p>
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-red-900 text-red-100 hover:bg-red-800 border-2 border-red-700 text-lg sm:text-xl font-semibold mt-6"
            style={CREEPY_STYLE}
          >
            확인
          </Button>
        </div>
      </motion.div>

      <style jsx>{`
        .glitch-active {
          animation: glitch-shake 0.2s;
        }
        .glitch-text {
          animation: glitch-text 0.2s;
        }
        @keyframes glitch-shake {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }
        @keyframes glitch-text {
          0%,
          100% {
            text-shadow: 0 0 0 red;
            transform: translate(0);
          }
          20% {
            text-shadow: -2px 2px 0 red, 2px -2px 0 #ff0000;
            transform: translate(2px, -2px);
          }
          40% {
            text-shadow: 2px -2px 0 red, -2px 2px 0 #ff0000;
            transform: translate(-2px, 2px);
          }
          60% {
            text-shadow: -2px -2px 0 red, 2px 2px 0 #ff0000;
            transform: translate(2px, 2px);
          }
          80% {
            text-shadow: 2px 2px 0 red, -2px -2px 0 #ff0000;
            transform: translate(-2px, -2px);
          }
        }
      `}</style>
    </div>
  );
}
