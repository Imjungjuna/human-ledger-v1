"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Noise } from "@/components/Noise";
import { LetterGlitch } from "@/components/LetterGlitch";
import { WarningModal } from "@/components/WarningModal";
import { useMetadataCollector } from "@/hooks/useMetadataCollector";
import { generateCardTransform, CREEPY_STYLE } from "@/lib/utils";

const CreepyMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showWarning, setShowWarning] = useState(true);
  const [systemLog, setSystemLog] = useState<string[]>([]);
  const [fieldTransforms, setFieldTransforms] = useState<Record<string, string>>({});
  const [cardTransform, setCardTransform] = useState<string>("");

  const handleLog = useCallback((message: string, type?: "warning") => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setSystemLog((prev) => [...prev, logMessage].slice(-5));
    if (type === "warning") {
      console.error("%c" + logMessage, "color: red; font-weight: bold;");
    } else {
      console.log(logMessage);
    }
  }, []);

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

  useEffect(() => {
    setCardTransform(generateCardTransform());

    const fieldIds = [
      "age", "bloodType", "height", "weight",
      "smoking", "drinking", "housingType", "missingReports", "lastFamilyContact",
    ];
    const transforms: Record<string, string> = {};
    fieldIds.forEach((id) => {
      const rotate = Math.random() * 4 - 2;
      const translateX = Math.random() * 6 - 3;
      const translateY = Math.random() * 6 - 3;
      transforms[id] = `rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`;
    });
    setFieldTransforms(transforms);
  }, []);

  const handleNext = () => {
    if (currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 500);
    } else if (currentStep === 2) {
      setTimeout(() => {
        sessionStorage.setItem("humanLedgerFormData", JSON.stringify(formData));
        if (metadata) {
          sessionStorage.setItem("humanLedgerMetadata", JSON.stringify(metadata));
        }
        router.push("/result");
      }, 500);
    }
  };

  const handleBack = () => {
    setTimeout(() => setCurrentStep(1), 300);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <WarningModal isOpen={showWarning} onClose={() => setShowWarning(false)} />
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
        <LetterGlitch />
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
            style={{ transform: cardTransform || "none" }}
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="border-b-2 border-red-900/50">
                <CardTitle
                  className="text-red-600 text-3xl sm:text-4xl tracking-wider font-semibold"
                  style={CREEPY_STYLE}
                >
                  대상자 등록 프로토콜
                </CardTitle>
                <div
                  className="text-red-500/70 text-lg sm:text-xl mt-2 font-semibold"
                  style={CREEPY_STYLE}
                >
                  2단계 중 {currentStep}단계 | 완료율: {currentStep === 1 ? "50%" : "100%"}
                </div>
              </CardHeader>

              <CardContent
                className="p-3 sm:p-6 min-h-[300px] sm:min-h-[400px]"
                             >
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
                          <div className="space-y-2" style={{ transform: fieldTransforms.age || "none" }}>
                            <Label
                              htmlFor="age"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              몇 살이신가요?
                            </Label>
                            <Input
                              id="age"
                              type="number"
                              min={1}
                              max={120}
                              value={formData.age}
                              onChange={(e) => handleInputChange("age", e.target.value)}
                              className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                              placeholder="나이를 입력하세요..."
                            />
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.bloodType || "none" }}>
                            <Label
                              htmlFor="bloodType"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              혈액형이 무엇인가요?
                            </Label>
                            <Select
                              value={formData.bloodType}
                              onValueChange={(value) => handleInputChange("bloodType", value)}
                            >
                              <SelectTrigger
                                id="bloodType"
                                className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                                style={CREEPY_STYLE}
                              >
                                <SelectValue placeholder="선택하세요..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-red-900" style={CREEPY_STYLE}>
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                                  <SelectItem key={type} value={type} className="text-red-500 text-xl font-semibold">
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.height || "none" }}>
                            <Label
                              htmlFor="height"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              키가 얼마나 되시나요? (단위: CM)
                            </Label>
                            <Input
                              id="height"
                              type="number"
                              min={50}
                              max={300}
                              value={formData.height}
                              onChange={(e) => handleInputChange("height", e.target.value)}
                              className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                              placeholder="키를 입력하세요..."
                            />
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.weight || "none" }}>
                            <Label
                              htmlFor="weight"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              몸무게가 얼마나 되시나요? (단위: KG)
                            </Label>
                            <Input
                              id="weight"
                              type="number"
                              min={10}
                              max={500}
                              value={formData.weight}
                              onChange={(e) => handleInputChange("weight", e.target.value)}
                              className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                              placeholder="몸무게를 입력하세요..."
                            />
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.smoking || "none" }}>
                            <Label
                              htmlFor="smoking"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              평상시에 흡연을 하시나요?
                            </Label>
                            <Select
                              value={formData.smoking}
                              onValueChange={(value) => handleInputChange("smoking", value)}
                            >
                              <SelectTrigger
                                id="smoking"
                                className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                                style={CREEPY_STYLE}
                              >
                                <SelectValue placeholder="선택하세요..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-red-900" style={CREEPY_STYLE}>
                                <SelectItem value="yes" className="text-red-500 text-xl font-semibold">예</SelectItem>
                                <SelectItem value="no" className="text-red-500 text-xl font-semibold">아니오</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.drinking || "none" }}>
                            <Label
                              htmlFor="drinking"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              평상시에 음주를 하시나요?
                            </Label>
                            <Select
                              value={formData.drinking}
                              onValueChange={(value) => handleInputChange("drinking", value)}
                            >
                              <SelectTrigger
                                id="drinking"
                                className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                                style={CREEPY_STYLE}
                              >
                                <SelectValue placeholder="선택하세요..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-red-900" style={CREEPY_STYLE}>
                                <SelectItem value="yes" className="text-red-500 text-xl font-semibold">예</SelectItem>
                                <SelectItem value="no" className="text-red-500 text-xl font-semibold">아니오</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                          <div className="space-y-2" style={{ transform: fieldTransforms.housingType || "none" }}>
                            <Label
                              htmlFor="housingType"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              어떤 형태의 주거지에 거주하고 계신가요?
                            </Label>
                            <Select
                              value={formData.housingType}
                              onValueChange={(value) => handleInputChange("housingType", value)}
                            >
                              <SelectTrigger
                                id="housingType"
                                className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                                style={CREEPY_STYLE}
                              >
                                <SelectValue placeholder="선택하세요..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-red-900" style={CREEPY_STYLE}>
                                <SelectItem value="alone" className="text-red-500 text-xl font-semibold">자취</SelectItem>
                                <SelectItem value="family" className="text-red-500 text-xl font-semibold">가족단위 주거</SelectItem>
                                <SelectItem value="partner" className="text-red-500 text-xl font-semibold">애인과 동거</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.missingReports || "none" }}>
                            <Label
                              htmlFor="missingReports"
                              className="text-red-500 blur-[0.3px] text-xl sm:text-2xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              만약 실종된다면 몇 명이 신고할 것 같으신가요?
                            </Label>
                            <Input
                              id="missingReports"
                              type="number"
                              min={0}
                              max={999}
                              value={formData.missingReports}
                              onChange={(e) => handleInputChange("missingReports", e.target.value)}
                              className="bg-black/50 border-red-900 text-red-500 focus:border-red-600 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                              placeholder="숫자를 입력하세요..."
                            />
                          </div>

                          <div className="space-y-2" style={{ transform: fieldTransforms.lastFamilyContact || "none" }}>
                            <Label
                              htmlFor="lastFamilyContact"
                              className="text-red-500 blur-[0.3px] text-xl font-semibold"
                              style={CREEPY_STYLE}
                            >
                              마지막으로 가족과 연락한 시점이 언제인가요?
                            </Label>
                            <Select
                              value={formData.lastFamilyContact}
                              onValueChange={(value) => handleInputChange("lastFamilyContact", value)}
                            >
                              <SelectTrigger
                                id="lastFamilyContact"
                                className="bg-black/50 border-red-900 text-red-500 blur-[0.3px] text-xl font-semibold"
                                style={CREEPY_STYLE}
                              >
                                <SelectValue placeholder="선택하세요..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-red-900" style={CREEPY_STYLE}>
                                <SelectItem value="1hour" className="text-red-500 text-xl font-semibold">1시간 이내</SelectItem>
                                <SelectItem value="3hours" className="text-red-500 text-xl font-semibold">3시간 이내</SelectItem>
                                <SelectItem value="1day" className="text-red-500 text-xl font-semibold">하루 미만</SelectItem>
                                <SelectItem value="3days" className="text-red-500 text-xl font-semibold">3일 이상</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div
                  className="border-t-2 border-red-900/50 flex justify-between p-3 sm:p-6 mt-6"
                                 >
                  <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="bg-black/50 border-red-900 text-red-500 hover:bg-red-900/20 disabled:opacity-30 text-lg sm:text-xl font-semibold"
                    style={CREEPY_STYLE}
                  >
                    &lt;&lt; 이전
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-red-900 text-red-100 hover:bg-red-800 border-2 border-red-700 text-lg sm:text-xl"
                    style={CREEPY_STYLE}
                  >
                    {currentStep === 2 ? "제출 >>" : "다음 >>"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <style jsx global>{`
          @keyframes glitch {
            0% { text-shadow: 2px 2px #ff0000, -2px -2px #8b0000; }
            25% { text-shadow: -2px 2px #ff0000, 2px -2px #8b0000; }
            50% { text-shadow: 2px -2px #ff0000, -2px 2px #8b0000; }
            75% { text-shadow: -2px -2px #ff0000, 2px 2px #8b0000; }
            100% { text-shadow: 2px 2px #ff0000, -2px -2px #8b0000; }
          }
          .glitch-text { animation: glitch 2s infinite; }
        `}</style>
      </div>
    </>
  );
};

export default CreepyMultiStepForm;
