export function calculateOrganPrices(formData: Record<string, string>) {
  const age = parseInt(formData.age) || 30;
  const smoking = formData.smoking === "yes";
  const drinking = formData.drinking === "yes";
  const missingReports = parseInt(formData.missingReports) || 0;

  let basePrice = 50000;

  const ageMultiplier =
    age < 25 ? 1.5 : age < 35 ? 1.2 : age < 45 ? 1.0 : age < 55 ? 0.8 : 0.6;

  let healthMultiplier = 1.0;
  if (!smoking && !drinking) healthMultiplier = 1.3;
  else if (!smoking || !drinking) healthMultiplier = 1.1;
  else healthMultiplier = 0.9;

  const riskMultiplier =
    missingReports === 0 ? 1.2 : missingReports < 3 ? 1.1 : 1.0;

  basePrice = Math.floor(basePrice * ageMultiplier * healthMultiplier * riskMultiplier);

  const organs = {
    heart: Math.floor(basePrice * 0.35),
    cornea: Math.floor(basePrice * 0.15),
    liver: Math.floor(basePrice * 0.25),
    kidney: Math.floor(basePrice * 0.12),
    lung: Math.floor(basePrice * 0.08),
    pancreas: Math.floor(basePrice * 0.05),
  };

  return { total: basePrice, organs };
}

export function generateBuyerProfile() {
  const names = ["Dr. 알렉산더 크로우", "Dr. 빅터 모로", "Dr. 하인리히 슈타인", "Dr. 미하일 로마노프"];
  const specialties = ["심장외과", "안과", "간이식외과"];
  const locations = ["필리핀 마닐라", "태국 방콕", "멕시코 티후아나", "터키 이스탄불"];
  const hospitals = [
    "마닐라 프라이빗 메디컬 센터",
    "방콕 인터내셔널 클리닉",
    "티후아나 메디컬 파운데이션",
    "이스탄불 트랜스플랜트 센터",
  ];

  return {
    name: names[Math.floor(Math.random() * names.length)],
    specialty: specialties[Math.floor(Math.random() * specialties.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
    experience: Math.floor(Math.random() * 20) + 15,
    successRate: Math.floor(Math.random() * 10) + 85,
    budget: Math.floor(Math.random() * 50000) + 100000,
  };
}

export function generateRegistrationCode() {
  const prefix = "PRF";
  const middle = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${prefix}-${middle}-${suffix}`;
}
