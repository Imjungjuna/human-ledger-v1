"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Noise } from "@/components/Noise";
import {
  calculateOrganPrices,
  generateBuyerProfile,
  generateRegistrationCode,
} from "@/lib/organPricing";
import { generateCardTransform, CREEPY_STYLE } from "@/lib/utils";
import type { CollectedMetadata, GpsInfo } from "@/types/metadata";

type Prices = ReturnType<typeof calculateOrganPrices>;
type Buyer = ReturnType<typeof generateBuyerProfile>;

export default function ResultPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Prices | null>(null);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [metadata, setMetadata] = useState<CollectedMetadata | null>(null);
  const [cardTransform, setCardTransform] = useState<string>("");
  const registrationCode = useRef(generateRegistrationCode());

  useEffect(() => {
    const storedFormData = sessionStorage.getItem("humanLedgerFormData");
    if (!storedFormData) {
      router.replace("/");
      return;
    }

    let data: Record<string, string>;
    try {
      data = JSON.parse(storedFormData);
    } catch {
      router.replace("/");
      return;
    }
    setFormData(data);
    setPrices(calculateOrganPrices(data));
    setBuyer(generateBuyerProfile());

    const storedMetadata = sessionStorage.getItem("humanLedgerMetadata");
    if (storedMetadata) {
      try {
        setMetadata(JSON.parse(storedMetadata));
      } catch {
        // ignore malformed metadata
      }
    }

    setCardTransform(generateCardTransform());
  }, [router]);

  if (!prices || !buyer) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-red-500" style={CREEPY_STYLE}>
          데이터 로딩 중...
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("ko-KR").format(price);

  const status = "검수 완료";
  const availability = "제한적";
  const lastUpdate = new Date().toISOString().split("T")[0];

  const age = parseInt(formData.age || "30");
  const smoking = formData.smoking === "yes";
  const drinking = formData.drinking === "yes";
  const missingReports = parseInt(formData.missingReports || "0");

  let internalValue = "상";
  if (age > 40 || smoking || drinking) internalValue = "중";
  if (age > 50 || (smoking && drinking)) internalValue = "하";

  let distributionTier = "Tier 1";
  if (age > 35 || smoking || drinking) distributionTier = "Tier 2";
  if (age > 45 || missingReports > 3) distributionTier = "Tier 3";

  let matchingPriority = "우선 추천";
  if (age > 30 || smoking || drinking) matchingPriority = "제한적 추천";
  if (age > 40 || missingReports > 3) matchingPriority = "보류";

  let fulfillmentRate = 100;
  if (age > 30) fulfillmentRate -= 5;
  if (smoking) fulfillmentRate -= 7;
  if (drinking) fulfillmentRate -= 5;
  if (missingReports > 0) fulfillmentRate -= 5;
  fulfillmentRate = Math.max(70, fulfillmentRate);

  const leftVision = (0.8 + Math.random() * 0.4).toFixed(1);
  const rightVision = (0.8 + Math.random() * 0.4).toFixed(1);

  const organNames: Record<string, string> = {
    heart: "심장",
    cornea: "각막 (쌍)",
    liver: "간",
    kidney: "신장 (쌍)",
    lung: "폐 (쌍)",
    pancreas: "췌장",
  };

  const metaData = metadata;
  const gps = metaData?.gps && !('error' in metaData.gps) ? metaData.gps as GpsInfo : null;

  return (
    <div
      className="relative w-full min-h-screen bg-black"
      style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
    >
      <Image
        src="/background.png"
        alt="배경"
        fill
        priority
        sizes="100vw"
        quality={75}
        style={{
          objectFit: "cover",
          filter: "blur(4px) brightness(0.7)",
          opacity: 0.6,
        }}
      />
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
          style={{ transform: cardTransform || "none" }}
        >
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="border-b-0">
              <CardTitle
                className="text-red-600 text-3xl sm:text-4xl tracking-wider mb-4"
                style={CREEPY_STYLE}
              >
                상품 정보
              </CardTitle>

              <div className="space-y-2 mb-4">
                {[
                  ["등록 코드:", registrationCode.current],
                  ["상태:", status],
                  ["가용성:", availability],
                  ["최근 업데이트:", lastUpdate],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-red-400 text-sm sm:text-base" style={CREEPY_STYLE}>{label}</span>
                    <span className="text-red-500 text-base sm:text-lg font-mono break-all" style={CREEPY_STYLE}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4">
                {["검수 리포트 보기", "조건부 예약 요청", "관심 목록 추가"].map((label, i) => (
                  <Button
                    key={label}
                    variant={i === 0 ? "default" : "outline"}
                    className={
                      i === 0
                        ? "bg-red-900 text-red-100 hover:bg-red-800 border-2 border-red-700 text-sm sm:text-base w-full sm:w-auto"
                        : "bg-black/50 border-red-900 text-red-500 hover:bg-red-900/20 text-sm sm:text-base w-full sm:w-auto"
                    }
                    style={CREEPY_STYLE}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* 상품 상세 정보 */}
              <div className="border-0 p-3 sm:p-4 bg-black/30">
                <div className="text-red-500 text-lg sm:text-xl mb-3 sm:mb-4" style={CREEPY_STYLE}>
                  상품 상세 정보
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {[
                    ["신장", `${formData.height || "170"} cm`],
                    ["체중", `${formData.weight || "70"} kg`],
                    ["혈액형", formData.bloodType || "-"],
                    ["시력", `좌 ${leftVision} / 우 ${rightVision}`],
                    ["외과적 개입 이력", "경미 (1회)"],
                    ["흡연", smoking ? "있음" : "없음"],
                    ["음주", drinking ? "월 1–2회" : "없음"],
                  ].map(([label, value]) => (
                    <React.Fragment key={label}>
                      <div className="text-red-400 text-sm sm:text-base" style={CREEPY_STYLE}>{label}</div>
                      <div className="text-red-500 text-sm sm:text-base" style={CREEPY_STYLE}>{value}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 내부 평가 */}
              <div className="border-0 p-3 sm:p-4 bg-black/30">
                <div className="text-red-500 text-lg sm:text-xl mb-3 sm:mb-4" style={CREEPY_STYLE}>
                  내부 평가
                </div>
                <div className="space-y-2">
                  {[
                    ["내부 평가 가치:", internalValue],
                    ["유통 등급:", distributionTier],
                    ["매칭 우선순위:", matchingPriority],
                    ["내부 기준 충족률:", `${fulfillmentRate}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-red-400 text-sm sm:text-base" style={CREEPY_STYLE}>{label}</span>
                      <span className="text-red-500 text-sm sm:text-base" style={CREEPY_STYLE}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 총 가치 */}
              <div className="border-0 p-3 sm:p-4 bg-black/30">
                <div className="text-red-400 text-base sm:text-lg mb-2" style={CREEPY_STYLE}>
                  총 상품 가치
                </div>
                <div
                  className="text-red-500 text-3xl sm:text-4xl md:text-5xl font-bold break-words"
                  style={CREEPY_STYLE}
                >
                  {formatPrice(prices.total)}만원
                </div>
              </div>

              {/* 장기별 가격 */}
              <div>
                <div className="text-red-500 text-xl mb-4" style={CREEPY_STYLE}>
                  부품별 분해 가격
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(prices.organs).map(([organ, price]) => (
                    <div key={organ} className="border-0 p-3 bg-black/20">
                      <div className="text-red-400 text-base" style={CREEPY_STYLE}>
                        {organNames[organ]}
                      </div>
                      <div className="text-red-500 text-2xl font-bold" style={CREEPY_STYLE}>
                        {formatPrice(price)}만원
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 구매자 프로필 */}
              <div className="border-2 border-red-900/50 p-4 bg-black/30">
                <div className="text-red-500 text-xl mb-4" style={CREEPY_STYLE}>
                  최고가 구매자 프로필
                </div>
                <div className="space-y-2">
                  {[
                    ["의사명:", buyer.name],
                    ["전문분야:", buyer.specialty],
                    ["경력:", `${buyer.experience}년`],
                    ["성공률:", `${buyer.successRate}%`],
                    ["최대 예산:", `${formatPrice(buyer.budget)}만원`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-red-400" style={CREEPY_STYLE}>{label}</span>
                      <span className="text-red-500 text-lg" style={CREEPY_STYLE}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수술 예정지 */}
              <div className="border-2 border-red-900/50 p-4 bg-black/30">
                <div className="text-red-500 text-xl mb-4" style={CREEPY_STYLE}>
                  수술 예정지
                </div>
                <div className="space-y-2">
                  <div className="text-red-400 text-lg" style={CREEPY_STYLE}>{buyer.hospital}</div>
                  <div className="text-red-500/80 text-base" style={CREEPY_STYLE}>{buyer.location}</div>
                  <div className="text-red-500/60 text-sm mt-3" style={CREEPY_STYLE}>
                    예상 수술일: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              </div>

              {/* 상품 상태 평가 */}
              <div className="border-2 border-red-900/50 p-4 bg-black/30">
                <div className="text-red-500 text-xl mb-4" style={CREEPY_STYLE}>
                  상품 상태 평가
                </div>
                <div className="space-y-2 text-sm" style={CREEPY_STYLE}>
                  <div className="text-red-400">
                    • 연령: {formData.age}세 - {age < 30 ? "최적" : age < 40 ? "양호" : "보통"} 등급
                  </div>
                  <div className="text-red-400">
                    • 건강 상태: {smoking || drinking ? "주의 필요" : "우수"}
                  </div>
                  <div className="text-red-400">
                    • 신체 조건: {formData.height}cm / {formData.weight}kg -{" "}
                    {parseInt(formData.height || "170") > 175 ? "우수" : "보통"}
                  </div>
                  <div className="text-red-400">
                    • 추적 위험도: {missingReports === 0 ? "낮음" : missingReports < 3 ? "보통" : "높음"}
                  </div>
                </div>
              </div>

              {/* 수집된 기기 정보 */}
              {metaData && (
                <div className="border-0 p-3 sm:p-4 bg-black/30">
                  <div className="text-red-500 text-lg sm:text-xl mb-3 sm:mb-4" style={CREEPY_STYLE}>
                    수집된 기기 정보
                  </div>
                  <div className="space-y-2 text-sm sm:text-base" style={CREEPY_STYLE}>
                    {[
                      ["IP 주소:", String(metaData.ip ?? "수집 실패")],
                      ["운영체제:", String(metaData.os ?? "Unknown")],
                      ["브라우저:", String(metaData.browser ?? "Unknown")],
                      ["기기 메모리:", metaData.deviceMemory ? `${metaData.deviceMemory}GB` : "Not available"],
                      ["언어:", String(metaData.language ?? "Unknown")],
                      ["타임존:", String(metaData.timezone ?? "Unknown")],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-red-400">{label}</span>
                        <span className="text-red-500 font-mono">{value}</span>
                      </div>
                    ))}

                    {metaData.battery && !('error' in metaData.battery) && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-red-400">배터리 잔량:</span>
                          <span className="text-red-500">{metaData.battery.level}%</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-red-400">충전 중:</span>
                          <span className="text-red-500">
                            {metaData.battery.charging ? "예" : "아니오"}
                          </span>
                        </div>
                      </>
                    )}

                    {metaData.screen && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-red-400">화면 해상도:</span>
                        <span className="text-red-500">
                          {metaData.screen.width} x {metaData.screen.height}
                        </span>
                      </div>
                    )}

                    {gps && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 mt-3 pt-3 border-t border-red-900/30">
                          <span className="text-red-400 font-semibold">GPS 위치:</span>
                          <span className="text-red-500"></span>
                        </div>
                        {[
                          ["위도:", gps.latitude?.toFixed(6)],
                          ["경도:", gps.longitude?.toFixed(6)],
                          ["정확도:", `${gps.accuracy?.toFixed(0)}m`],
                          ["주소:", gps.address],
                          ["도시:", gps.city],
                          ["행정구역:", gps.administrativeArea],
                        ]
                          .filter(([, v]) => v)
                          .map(([label, value]) => (
                            <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                              <span className="text-red-400">{label}</span>
                              <span className="text-red-500 font-mono">{value}</span>
                            </div>
                          ))}
                      </>
                    )}

                    {gps?.nearestPlace && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 mt-3 pt-3 border-t border-red-900/30">
                        <span className="text-red-400 font-semibold">가장 가까운 장소:</span>
                        <span className="text-red-500 font-semibold">{gps.nearestPlace}</span>
                      </div>
                    )}

                    {metaData.gps && ('error' in metaData.gps) && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 mt-3 pt-3 border-t border-red-900/30">
                        <span className="text-red-400">GPS 위치:</span>
                        <span className="text-red-500/60">수집 실패</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 주의사항 */}
              <div className="border-0 p-3 bg-black/20">
                <div className="text-red-500/60 text-xs" style={CREEPY_STYLE}>
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
