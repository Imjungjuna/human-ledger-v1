"use client";

import * as React from "react";
import { useRef, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// 가격 계산 함수
function calculateOrganPrices(formData: Record<string, string>) {
  const age = parseInt(formData.age) || 30;
  const height = parseInt(formData.height) || 170;
  const weight = parseInt(formData.weight) || 70;
  const smoking = formData.smoking === "yes";
  const drinking = formData.drinking === "yes";
  const missingReports = parseInt(formData.missingReports) || 0;

  // 기본 가격 (만원 단위)
  let basePrice = 50000; // 기본 5억원

  // 나이에 따른 가격 조정 (젊을수록 비쌈)
  const ageMultiplier = age < 25 ? 1.5 : age < 35 ? 1.2 : age < 45 ? 1.0 : age < 55 ? 0.8 : 0.6;
  
  // 건강 상태 조정
  let healthMultiplier = 1.0;
  if (!smoking && !drinking) healthMultiplier = 1.3;
  else if (!smoking || !drinking) healthMultiplier = 1.1;
  else healthMultiplier = 0.9;

  // 실종 신고자 수에 따른 조정 (신고자가 적을수록 비쌈)
  const riskMultiplier = missingReports === 0 ? 1.2 : missingReports < 3 ? 1.1 : 1.0;

  const totalMultiplier = ageMultiplier * healthMultiplier * riskMultiplier;
  basePrice = Math.floor(basePrice * totalMultiplier);

  // 장기별 가격 (만원 단위)
  const organs = {
    heart: Math.floor(basePrice * 0.35), // 심장: 35%
    cornea: Math.floor(basePrice * 0.15), // 각막: 15%
    liver: Math.floor(basePrice * 0.25), // 간: 25%
    kidney: Math.floor(basePrice * 0.12), // 신장: 12%
    lung: Math.floor(basePrice * 0.08), // 폐: 8%
    pancreas: Math.floor(basePrice * 0.05), // 췌장: 5%
  };

  return {
    total: basePrice,
    organs,
  };
}

// 구매자 프로필 생성
function generateBuyerProfile() {
  const names = ["Dr. 알렉산더 크로우", "Dr. 빅터 모로", "Dr. 하인리히 슈타인", "Dr. 미하일 로마노프"];
  const specialties = ["심장외과", "안과", "간이식외과"];
  const locations = ["필리핀 마닐라", "태국 방콕", "멕시코 티후아나", "터키 이스탄불"];
  const hospitals = [
    "마닐라 프라이빗 메디컬 센터",
    "방콕 인터내셔널 클리닉",
    "티후아나 메디컬 파운데이션",
    "이스탄불 트랜스플랜트 센터"
  ];

  const name = names[Math.floor(Math.random() * names.length)];
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];

  return {
    name,
    specialty,
    location,
    hospital,
    experience: Math.floor(Math.random() * 20) + 15,
    successRate: Math.floor(Math.random() * 10) + 85,
    budget: Math.floor(Math.random() * 50000) + 100000,
  };
}

function ResultContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);

  useEffect(() => {
    const data: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });
    setFormData(data);
    
    const calculatedPrices = calculateOrganPrices(data);
    setPrices(calculatedPrices);
    
    const buyerProfile = generateBuyerProfile();
    setBuyer(buyerProfile);
  }, [searchParams]);

  if (!prices || !buyer) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-red-500" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
          데이터 로딩 중...
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 등록 코드 생성
  const generateCode = () => {
    const prefix = 'PRF';
    const middle = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${prefix}-${middle}-${suffix}`;
  };

  const registrationCode = generateCode();
  const status = '검수 완료';
  const availability = '제한적';
  const lastUpdate = new Date().toISOString().split('T')[0];

  // 평가 등급 계산
  const age = parseInt(formData.age || '30');
  const height = parseInt(formData.height || '170');
  const weight = parseInt(formData.weight || '70');
  const smoking = formData.smoking === 'yes';
  const drinking = formData.drinking === 'yes';
  const missingReports = parseInt(formData.missingReports || '0');

  let internalValue = '상';
  if (age > 40 || smoking || drinking) internalValue = '중';
  if (age > 50 || (smoking && drinking)) internalValue = '하';

  let distributionTier = 'Tier 1';
  if (age > 35 || smoking || drinking) distributionTier = 'Tier 2';
  if (age > 45 || missingReports > 3) distributionTier = 'Tier 3';

  let matchingPriority = '우선 추천';
  if (age > 30 || smoking || drinking) matchingPriority = '제한적 추천';
  if (age > 40 || missingReports > 3) matchingPriority = '보류';

  let fulfillmentRate = 100;
  if (age > 30) fulfillmentRate -= 5;
  if (smoking) fulfillmentRate -= 7;
  if (drinking) fulfillmentRate -= 5;
  if (missingReports > 0) fulfillmentRate -= 5;
  fulfillmentRate = Math.max(70, fulfillmentRate);

  // 시력 랜덤 생성 (일반적으로 1.0 근처)
  const leftVision = (0.8 + Math.random() * 0.4).toFixed(1);
  const rightVision = (0.8 + Math.random() * 0.4).toFixed(1);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto">
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

      <div className="relative z-10 flex items-center justify-center min-h-screen p-2 sm:p-4 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
          style={{
            transform: `rotate(${Math.random() * 2 - 1}deg) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
            imageRendering: 'pixelated',
          }}
        >
          <Card className="bg-transparent border-0 shadow-none" style={{ imageRendering: 'pixelated' }}>
            <CardHeader className="border-b-0">
              <CardTitle className="text-red-600 text-3xl sm:text-4xl tracking-wider mb-4" style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}>
                상품 정보
              </CardTitle>
              
              {/* 등록 정보 */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>등록 코드:</span>
                  <span className="text-red-500 text-base sm:text-lg font-mono break-all" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{registrationCode}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>상태:</span>
                  <span className="text-red-500 text-base sm:text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{status}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>가용성:</span>
                  <span className="text-red-500 text-base sm:text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{availability}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>최근 업데이트:</span>
                  <span className="text-red-500 text-base sm:text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{lastUpdate}</span>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4">
                <Button
                  className="bg-red-900 text-red-100 hover:bg-red-800 border-2 border-red-700 text-sm sm:text-base w-full sm:w-auto"
                  style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                >
                  검수 리포트 보기
                </Button>
                <Button
                  variant="outline"
                  className="bg-black/50 border-red-900 text-red-500 hover:bg-red-900/20 text-sm sm:text-base w-full sm:w-auto"
                  style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                >
                  조건부 예약 요청
                </Button>
                <Button
                  variant="outline"
                  className="bg-black/50 border-red-900 text-red-500 hover:bg-red-900/20 text-sm sm:text-base w-full sm:w-auto"
                  style={{ imageRendering: 'pixelated', fontFamily: 'var(--font-geulseedang-goyo)' }}
                >
                  관심 목록 추가
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6" style={{ imageRendering: 'pixelated' }}>
              {/* 상품 정보 테이블 */}
              <div className="border-0 p-3 sm:p-4 bg-black/30">
                <div className="text-red-500 text-lg sm:text-xl mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  상품 상세 정보
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>신장</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{formData.height || '170'} cm</div>
                    
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>체중</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{formData.weight || '70'} kg</div>
                    
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>혈액형</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{formData.bloodType || '-'}</div>
                    
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>시력</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>좌 {leftVision} / 우 {rightVision}</div>
                    
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>외과적 개입 이력</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>경미 (1회)</div>
                    
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>흡연</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{formData.smoking === 'yes' ? '있음' : '없음'}</div>
                    
                    <div className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>음주</div>
                    <div className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                      {formData.drinking === 'yes' ? '월 1–2회' : '없음'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 평가 정보 */}
              <div className="border-0 p-3 sm:p-4 bg-black/30">
                <div className="text-red-500 text-lg sm:text-xl mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  내부 평가
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>내부 평가 가치:</span>
                    <span className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{internalValue}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>유통 등급:</span>
                    <span className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{distributionTier}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>매칭 우선순위:</span>
                    <span className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{matchingPriority}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-red-400 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>내부 기준 충족률:</span>
                    <span className="text-red-500 text-sm sm:text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{fulfillmentRate}%</span>
                  </div>
                </div>
              </div>

              {/* 총 가치 */}
              <div className="border-0 p-3 sm:p-4 bg-black/30">
                <div className="text-red-400 text-base sm:text-lg mb-2" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  총 상품 가치
                </div>
                <div className="text-red-500 text-3xl sm:text-4xl md:text-5xl font-bold break-words" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  {formatPrice(prices.total)}만원
                </div>
              </div>

              {/* 장기별 가격 */}
              <div>
                <div className="text-red-500 text-xl mb-4" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  부품별 분해 가격
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(prices.organs).map(([organ, price]: [string, any]) => {
                    const organNames: Record<string, string> = {
                      heart: '심장',
                      cornea: '각막 (쌍)',
                      liver: '간',
                      kidney: '신장 (쌍)',
                      lung: '폐 (쌍)',
                      pancreas: '췌장',
                    };
                    return (
                      <div key={organ} className="border-0 p-3 bg-black/20">
                        <div className="text-red-400 text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                          {organNames[organ]}
                        </div>
                        <div className="text-red-500 text-2xl font-bold" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                          {formatPrice(price)}만원
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 구매자 프로필 */}
              <div className="border-2 border-red-900/50 p-4 bg-black/30">
                <div className="text-red-500 text-xl mb-4" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  최고가 구매자 프로필
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-400" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>의사명:</span>
                    <span className="text-red-500 text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{buyer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>전문분야:</span>
                    <span className="text-red-500 text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{buyer.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>경력:</span>
                    <span className="text-red-500 text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{buyer.experience}년</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>성공률:</span>
                    <span className="text-red-500 text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{buyer.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>최대 예산:</span>
                    <span className="text-red-500 text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>{formatPrice(buyer.budget)}만원</span>
                  </div>
                </div>
              </div>

              {/* 수술 예정지 */}
              <div className="border-2 border-red-900/50 p-4 bg-black/30">
                <div className="text-red-500 text-xl mb-4" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  수술 예정지
                </div>
                <div className="space-y-2">
                  <div className="text-red-400 text-lg" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                    {buyer.hospital}
                  </div>
                  <div className="text-red-500/80 text-base" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                    {buyer.location}
                  </div>
                  <div className="text-red-500/60 text-sm mt-3" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                    예상 수술일: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>

              {/* 상품 상태 평가 */}
              <div className="border-2 border-red-900/50 p-4 bg-black/30">
                <div className="text-red-500 text-xl mb-4" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  상품 상태 평가
                </div>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  <div className="text-red-400">
                    • 연령: {formData.age}세 - {parseInt(formData.age || '30') < 30 ? '최적' : parseInt(formData.age || '30') < 40 ? '양호' : '보통'} 등급
                  </div>
                  <div className="text-red-400">
                    • 건강 상태: {formData.smoking === 'yes' || formData.drinking === 'yes' ? '주의 필요' : '우수'}
                  </div>
                  <div className="text-red-400">
                    • 신체 조건: {formData.height}cm / {formData.weight}kg - {parseInt(formData.height || '170') > 175 ? '우수' : '보통'}
                  </div>
                  <div className="text-red-400">
                    • 추적 위험도: {parseInt(formData.missingReports || '0') === 0 ? '낮음' : parseInt(formData.missingReports || '0') < 3 ? '보통' : '높음'}
                  </div>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="border-0 p-3 bg-black/20">
                <div className="text-red-500/60 text-xs" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
                  * 본 리포트는 상품의 시장 가치를 평가한 것으로, 실제 거래와는 무관합니다.
                  <br />
                  * 모든 거래는 국제법 및 현지 법률을 준수해야 합니다.
                  <br />
                  * 상품 상태는 운송 및 보관 과정에서 변동될 수 있습니다.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-red-500" style={{ fontFamily: 'var(--font-geulseedang-goyo)' }}>
          데이터 로딩 중...
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
