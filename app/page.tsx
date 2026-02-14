"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Noise component
function Noise({
  patternSize = 100,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 1,
  patternAlpha = 50,
  intensity = 1,
}: {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  intensity?: number;
}) {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const canvasCssSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;

    const patternCtx = patternCanvas.getContext("2d");
    if (!patternCtx) return;
    const patternData = patternCtx.createImageData(patternSize, patternSize);
    const patternPixelDataLength = patternSize * patternSize * 4;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      let newCssWidth = window.innerWidth;
      let newCssHeight = window.innerHeight;

      if (canvas.parentElement) {
        const parentRect = canvas.parentElement.getBoundingClientRect();
        newCssWidth = parentRect.width;
        newCssHeight = parentRect.height;
      }

      canvasCssSizeRef.current = { width: newCssWidth, height: newCssHeight };

      canvas.width = newCssWidth * dpr;
      canvas.height = newCssHeight * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updatePattern = () => {
      for (let i = 0; i < patternPixelDataLength; i += 4) {
        const value = Math.random() * 255 * intensity;
        patternData.data[i] = value;
        patternData.data[i + 1] = value;
        patternData.data[i + 2] = value;
        patternData.data[i + 3] = patternAlpha;
      }
      patternCtx.putImageData(patternData, 0, 0);
    };

    const drawGrain = () => {
      const { width: cssWidth, height: cssHeight } = canvasCssSizeRef.current;
      if (cssWidth === 0 || cssHeight === 0) return;

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      ctx.save();

      const safePatternScaleX = Math.max(0.001, patternScaleX);
      const safePatternScaleY = Math.max(0.001, patternScaleY);
      ctx.scale(safePatternScaleX, safePatternScaleY);

      const fillPattern = ctx.createPattern(patternCanvas, "repeat");
      if (fillPattern) {
        ctx.fillStyle = fillPattern;
        ctx.fillRect(0, 0, cssWidth / safePatternScaleX, cssHeight / safePatternScaleY);
      }

      ctx.restore();
    };

    let animationFrameId: number;
    const loop = () => {
      if (canvasCssSizeRef.current.width > 0 && canvasCssSizeRef.current.height > 0) {
        if (frame % patternRefreshInterval === 0) {
          updatePattern();
          drawGrain();
        }
      }
      frame++;
      animationFrameId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    if (patternRefreshInterval > 0) {
      loop();
    } else {
      updatePattern();
      drawGrain();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha, intensity]);

  return <canvas className="absolute inset-0 w-full h-full pointer-events-none" ref={grainRef} />;
}

// Letter Glitch Component
const LetterGlitch = ({
  glitchColors = ["#ff0000", "#8b0000", "#dc143c"],
  glitchSpeed = 50,
}: {
  glitchColors?: string[];
  glitchSpeed?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const lettersAndSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-=_+[]{}<>,0123456789".split("");

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
  };

  const drawLetters = () => {
    const canvas = canvasRef.current;
    const ctx = context.current;
    if (!canvas || !ctx || letters.current.length === 0) return;

    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    for (let i = 0; i < letters.current.length; i++) {
      const letterData = letters.current[i];
      const x = (i % grid.current.columns) * charWidth;
      const y = Math.floor(i / grid.current.columns) * charHeight;
      ctx.fillStyle = letterData.color;
      ctx.fillText(letterData.char, x, y);
    }
  };

  const resizeCanvasAndDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");

    const updateLettersLocal = () => {
      if (!letters.current || letters.current.length === 0) return;
      const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.current.length);
        if (!letters.current[index]) continue;
        letters.current[index].char = getRandomChar();
        letters.current[index].targetColor = getRandomColor();
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      }
    };

    const animate = () => {
      const now = Date.now();
      if (now - lastGlitchTime.current >= glitchSpeed) {
        updateLettersLocal();
        drawLetters();
        lastGlitchTime.current = now;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvasAndDraw();
    animationRef.current = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        resizeCanvasAndDraw();
        animationRef.current = requestAnimationFrame(animate);
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [glitchSpeed]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden opacity-20">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

// Warning Modal Component
const WarningModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // 0.5초 후 첫 글리치
    const firstGlitch = setTimeout(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 500);

    // 10초마다 글리치 반복
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 10000);

    return () => {
      clearTimeout(firstGlitch);
      clearInterval(glitchInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`relative w-full max-w-lg mx-4 p-6 sm:p-8 bg-black border-2 rounded-lg border-red-900 ${glitchActive ? 'glitch-active' : ''}`}
        style={{ imageRendering: 'pixelated' }}
      >
        <div className="space-y-4">
          <div className={`text-red-500 text-3xl sm:text-4xl font-semibold mb-6 text-center ${glitchActive ? 'glitch-text' : ''}`} style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
            ⚠ 경고
          </div>
          <div className={`text-red-400 text-lg sm:text-xl space-y-4 leading-relaxed ${glitchActive ? 'glitch-text' : ''}`} style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
            <p className="text-red-500 font-semibold">
              본 사이트는 귀하의 개인정보를 수집합니다.
            </p>
            <p>
              입력하신 모든 정보는 암시장에서 거래될 수 있으며, 
              귀하의 신체 부위 가격 평가에 사용됩니다.
            </p>
            <p>
              제공된 정보는 법적 보호를 받지 못하며, 
              제3자에게 판매될 수 있습니다.
            </p>
            <p className="text-red-500 font-semibold mt-6 text-center">
              정말로 계속 진행하시겠습니까?
            </p>
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-red-900 text-red-100 hover:bg-red-800 border-2 border-red-700 text-lg sm:text-xl font-semibold mt-6"
            style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
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
          0%, 100% {
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
          0%, 100% {
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
};

// Metadata Collector Hook
const useMetadataCollector = (onLog?: (message: string, type?: 'warning') => void) => {
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    const collectMetadata = async () => {
      const data: any = {};

      // User Agent 정보
      if (typeof navigator !== 'undefined') {
        data.userAgent = navigator.userAgent;
        
        // OS 정보 추출
        const osMatch = navigator.userAgent.match(/(Windows|Mac|Linux|Android|iOS|iPhone|iPad)/i);
        data.os = osMatch ? osMatch[1] : 'Unknown';
        
        // 브라우저 정보 추출
        const browserMatch = navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)/i);
        data.browser = browserMatch ? browserMatch[1] : 'Unknown';
        
        // 기기 메모리 정보
        if ('deviceMemory' in navigator) {
          data.deviceMemory = (navigator as any).deviceMemory || 'Unknown';
        } else {
          data.deviceMemory = 'Not available';
        }

        // 배터리 정보
        if ('getBattery' in navigator) {
          try {
            const battery = await (navigator as any).getBattery();
            data.battery = {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              chargingTime: battery.chargingTime !== Infinity ? battery.chargingTime : null,
              dischargingTime: battery.dischargingTime !== Infinity ? battery.dischargingTime : null,
            };
          } catch (error) {
            data.battery = { error: 'Failed to get battery info' };
          }
        } else {
          data.battery = { error: 'Battery API not supported' };
        }

        // 화면 정보
        if (typeof window !== 'undefined') {
          data.screen = {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
          };
        }

        // 언어 정보
        data.language = navigator.language;
        data.languages = navigator.languages;

        // 타임존
        data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        data.timezoneOffset = new Date().getTimezoneOffset();

        // IP 주소 및 위치 정보 수집 (서버 사이드)
        try {
          const ipResponse = await fetch('/api/trace', {
            method: 'GET',
          });
          const locationData = await ipResponse.json();
          data.ip = locationData.ip || 'Unknown';
          data.region = locationData.region || 'Unknown';
          data.city = locationData.city || 'Unknown';
          data.isp = locationData.isp || 'Unknown';
        } catch (error) {
          data.ip = 'Failed to collect';
          data.region = 'Unknown';
          data.city = 'Unknown';
          data.isp = 'Unknown';
        }

        // GPS 위치 수집
        if ('geolocation' in navigator) {
          // 위치 권한 요청 전 로그
          if (onLog) {
            onLog('[SYSTEM] 피험자 정밀 위치 역추적 승인 대기 중...');
          }
          console.log('[SYSTEM] 피험자 정밀 위치 역추적 승인 대기 중...');

          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve(pos),
                (err) => reject(err),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            });

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            data.gps = {
              latitude,
              longitude,
              accuracy,
            };

            // 역지오코딩 API 호출
            try {
              const reverseGeoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`
              );
              const reverseGeoData = await reverseGeoResponse.json();
              
              const address = reverseGeoData.locality 
                ? `${reverseGeoData.principalSubdivision || ''} ${reverseGeoData.locality || ''} ${reverseGeoData.localityInfo?.administrative?.[0]?.name || ''}`.trim()
                : reverseGeoData.formatted || 'Unknown';

              data.gps.address = address;
              data.gps.city = reverseGeoData.locality || 'Unknown';
              data.gps.administrativeArea = reverseGeoData.principalSubdivision || 'Unknown';
              data.gps.country = reverseGeoData.countryName || 'Unknown';

              // 터미널 출력
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📍 GPS 위치 정보 수집 완료');
              console.log(`위도: ${latitude}`);
              console.log(`경도: ${longitude}`);
              console.log(`정확도: ${accuracy}m`);
              console.log(`주소: ${address}`);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            } catch (reverseError) {
              console.error('역지오코딩 실패:', reverseError);
              data.gps.address = 'Failed to reverse geocode';
            }
          } catch (geoError: any) {
            // 위치 권한 거부 또는 기타 오류
            if (geoError.code === 1) {
              // PERMISSION_DENIED
              const warningMsg = '[WARNING] 피험자 위치 은폐 시도 감지. IP 기반 광역 추적 모드로 전환.';
              if (onLog) {
                onLog(warningMsg, 'warning');
              }
              console.error('%c' + warningMsg, 'color: red; font-weight: bold;');
            } else {
              console.error('GPS 위치 수집 실패:', geoError);
            }
            data.gps = { error: 'Location access denied or failed' };
          }
        } else {
          data.gps = { error: 'Geolocation not supported' };
        }
      }

      setMetadata(data);
    };

    collectMetadata();
  }, [onLog]);

  return metadata;
};

// Main Component
const CreepyMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showWarning, setShowWarning] = useState(true);
  const [systemLog, setSystemLog] = useState<string[]>([]);

  const handleLog = (message: string, type?: 'warning') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setSystemLog((prev) => [...prev, logMessage].slice(-5));
    
    if (type === 'warning') {
      console.error('%c' + logMessage, 'color: red; font-weight: bold;');
    } else {
      console.log(logMessage);
    }
  };

  const metadata = useMetadataCollector(handleLog);

  const [formData, setFormData] = useState({
    age: "",
    bloodType: "",
    height: "",
    weight: "",
    smoking: "",
    drinking: "",
    housingType: "",
    missingReports: "",
    lastFamilyContact: "",
  });

  const router = useRouter();

  const handleNext = () => {
    if (currentStep === 1) {
      setTimeout(() => {
        setCurrentStep(2);
      }, 500);
    } else if (currentStep === 2) {
      setTimeout(() => {
        // 설문 데이터와 메타데이터를 쿼리 파라미터로 전달
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        
        // 메타데이터를 JSON으로 인코딩하여 전달
        if (metadata) {
          params.append('metadata', JSON.stringify(metadata));
        }
        
        router.push(`/result?${params.toString()}`);
      }, 500);
    }
  };

  const handleBack = () => {
    setTimeout(() => {
      setCurrentStep(1);
    }, 300);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <WarningModal isOpen={showWarning} onClose={() => setShowWarning(false)} />
      <div className="relative w-full min-h-screen bg-black" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* 배경 이미지 */}
      <Image 
        src="/background.png"
        alt="배경"
        fill
        sizes="100vw"
        quality={100}
        style={{
          objectFit: 'cover',
          filter: 'blur(4px) brightness(0.7)',
          opacity: 0.6,
        }}
      />
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 w-full h-full bg-black/50" />
      
      <Noise
        patternSize={100}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={2}
        patternAlpha={30}
        intensity={0.8}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-2 sm:p-4 pb-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
          style={{
            transform: `rotate(${Math.random() * 2 - 1}deg) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
            imageRendering: 'pixelated',
          }}
        >
          <Card className="bg-transparent border-0 shadow-none" style={{ imageRendering: 'pixelated' }}>
            <CardHeader className="border-b-2 border-red-900/50">
              <CardTitle className="text-red-600 text-3xl sm:text-4xl tracking-wider font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                대상자 등록 프로토콜
              </CardTitle>
              <div className="text-red-500/70 text-lg sm:text-xl mt-2 font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                2단계 중 {currentStep}단계 | 완료율: {currentStep === 1 ? "50%" : "100%"}
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6 min-h-[300px] sm:min-h-[400px]" style={{ imageRendering: 'pixelated' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="age" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            몇 살이신가요?
                          </Label>
                          <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                            style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            placeholder="나이를 입력하세요..."
                          />
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="bloodType" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            혈액형이 무엇인가요?
                          </Label>
                          <Select
                            value={formData.bloodType}
                            onValueChange={(value) => handleInputChange("bloodType", value)}
                          >
                            <SelectTrigger
                              id="bloodType"
                              className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            >
                              <SelectValue placeholder="선택하세요..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-red-900" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                              <SelectItem value="A+" className="text-red-500 text-xl font-semibold">
                                A+
                              </SelectItem>
                              <SelectItem value="A-" className="text-red-500 text-xl font-semibold">
                                A-
                              </SelectItem>
                              <SelectItem value="B+" className="text-red-500 text-lg">
                                B+
                              </SelectItem>
                              <SelectItem value="B-" className="text-red-500 text-lg">
                                B-
                              </SelectItem>
                              <SelectItem value="AB+" className="text-red-500 text-lg">
                                AB+
                              </SelectItem>
                              <SelectItem value="AB-" className="text-red-500 text-lg">
                                AB-
                              </SelectItem>
                              <SelectItem value="O+" className="text-red-500 text-lg">
                                O+
                              </SelectItem>
                              <SelectItem value="O-" className="text-red-500 text-lg">
                                O-
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="height" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            키가 얼마나 되시나요? (단위: CM)
                          </Label>
                          <Input
                            id="height"
                            type="number"
                            value={formData.height}
                            onChange={(e) => handleInputChange("height", e.target.value)}
                            className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                            style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            placeholder="키를 입력하세요..."
                          />
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="weight" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            몸무게가 얼마나 되시나요? (단위: KG)
                          </Label>
                          <Input
                            id="weight"
                            type="number"
                            value={formData.weight}
                            onChange={(e) => handleInputChange("weight", e.target.value)}
                            className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                            style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            placeholder="몸무게를 입력하세요..."
                          />
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="smoking" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            평상시에 흡연을 하시나요?
                          </Label>
                          <Select
                            value={formData.smoking}
                            onValueChange={(value) => handleInputChange("smoking", value)}
                          >
                            <SelectTrigger
                              id="smoking"
                              className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            >
                              <SelectValue placeholder="선택하세요..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-red-900" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                              <SelectItem value="yes" className="text-red-500 text-xl font-semibold">
                                예
                              </SelectItem>
                              <SelectItem value="no" className="text-red-500 text-xl font-semibold">
                                아니오
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="drinking" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            평상시에 음주를 하시나요?
                          </Label>
                          <Select
                            value={formData.drinking}
                            onValueChange={(value) => handleInputChange("drinking", value)}
                          >
                            <SelectTrigger
                              id="drinking"
                              className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            >
                              <SelectValue placeholder="선택하세요..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-red-900" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                              <SelectItem value="yes" className="text-red-500 text-xl font-semibold">
                                예
                              </SelectItem>
                              <SelectItem value="no" className="text-red-500 text-xl font-semibold">
                                아니오
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="housingType" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            어떤 형태의 주거지에 거주하고 계신가요?
                          </Label>
                          <Select
                            value={formData.housingType}
                            onValueChange={(value) => handleInputChange("housingType", value)}
                          >
                            <SelectTrigger
                              id="housingType"
                              className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            >
                              <SelectValue placeholder="선택하세요..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-red-900" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                              <SelectItem value="alone" className="text-red-500 text-xl font-semibold">
                                자취
                              </SelectItem>
                              <SelectItem value="family" className="text-red-500 text-xl font-semibold">
                                가족단위 주거
                              </SelectItem>
                              <SelectItem value="partner" className="text-red-500 text-xl font-semibold">
                                애인과 동거
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="missingReports" className="text-red-500 blur-[0.3px] text-xl sm:text-2xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            만약 실종된다면 몇 명이 신고할 것 같으신가요?
                          </Label>
                          <Input
                            id="missingReports"
                            type="number"
                            value={formData.missingReports}
                            onChange={(e) => handleInputChange("missingReports", e.target.value)}
                            className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                            style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            placeholder="숫자를 입력하세요..."
                          />
                        </div>

                        <div className="space-y-2" style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)` }}>
                          <Label htmlFor="lastFamilyContact" className="text-red-500 blur-[0.3px] text-xl font-semibold" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                            마지막으로 가족과 연락한 시점이 언제인가요?
                          </Label>
                          <Select
                            value={formData.lastFamilyContact}
                            onValueChange={(value) => handleInputChange("lastFamilyContact", value)}
                          >
                            <SelectTrigger
                              id="lastFamilyContact"
                              className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                            >
                              <SelectValue placeholder="선택하세요..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-red-900" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                              <SelectItem value="1hour" className="text-red-500 text-xl font-semibold">
                                1시간 이내
                              </SelectItem>
                              <SelectItem value="3hours" className="text-red-500 text-xl font-semibold">
                                3시간 이내
                              </SelectItem>
                              <SelectItem value="1day" className="text-red-500 text-xl font-semibold">
                                하루 미만
                              </SelectItem>
                              <SelectItem value="3days" className="text-red-500 text-xl font-semibold">
                                3일 이상
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* 버튼 영역 */}
              <div className="border-t-2 border-red-900/50 flex justify-between p-3 sm:p-6 mt-6" style={{ imageRendering: 'pixelated' }}>
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="bg-black/50 border-red-900 text-red-500 hover:bg-red-900/20 disabled:opacity-30 text-lg sm:text-xl font-semibold"
                  style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                >
                  &lt;&lt; 이전
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-red-900 text-red-100 hover:bg-red-800 border-2 border-red-700 text-lg sm:text-xl"
                  style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                >
                  {currentStep === 2 ? "제출 &gt;&gt;" : "다음 &gt;&gt;"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes glitch {
          0% {
            text-shadow: 2px 2px #ff0000, -2px -2px #8b0000;
          }
          25% {
            text-shadow: -2px 2px #ff0000, 2px -2px #8b0000;
          }
          50% {
            text-shadow: 2px -2px #ff0000, -2px 2px #8b0000;
          }
          75% {
            text-shadow: -2px -2px #ff0000, 2px 2px #8b0000;
          }
          100% {
            text-shadow: 2px 2px #ff0000, -2px -2px #8b0000;
          }
        }
        .glitch-text {
          animation: glitch 2s infinite;
        }
      `}</style>
      </div>
    </>
  );
};

export default CreepyMultiStepForm;