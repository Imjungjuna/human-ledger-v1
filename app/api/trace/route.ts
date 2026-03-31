import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MIN_REQUEST_INTERVAL_MS = RATE_LIMIT_WINDOW_MS / MAX_REQUESTS_PER_WINDOW;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();

  // Evict entries older than the window to keep the map bounded
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  for (const [key, timestamp] of rateLimitMap) {
    if (timestamp < cutoff) rateLimitMap.delete(key);
  }

  const lastRequest = rateLimitMap.get(ip) ?? 0;
  if (now - lastRequest < MIN_REQUEST_INTERVAL_MS) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  rateLimitMap.set(ip, now);

  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (latitude == null || longitude == null || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: '위도와 경도가 필요합니다.' },
        { status: 400 }
      );
    }

    const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY;

    if (!KAKAO_REST_KEY) {
      return NextResponse.json(
        { error: '카카오 API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 카카오 로컬 API - 카테고리로 장소 검색 (카페 또는 식당)
    // 한 번의 API 호출로 카페와 식당을 모두 검색
    const categoryGroupCode = 'CE7,FD6'; // CE7: 카페, FD6: 음식점
    const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${categoryGroupCode}&x=${longitude}&y=${latitude}&radius=500&size=15&sort=distance`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_KEY}`
      }
    });

    let nearestPlace = null;

    if (response.ok) {
      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        // 가장 가까운 장소 선택
        const place = data.documents[0];
        const distance = parseFloat(place.distance || '999999');

        nearestPlace = {
          name: place.place_name,
          address: place.address_name,
          roadAddress: place.road_address_name,
          distance: distance,
          category: place.category_name,
          phone: place.phone,
          x: place.x,
          y: place.y
        };
      }
    }

    // 검색 결과가 없으면 '지하 은신처' 반환
    const result = nearestPlace
      ? nearestPlace.name
      : '지하 은신처';

    return NextResponse.json({
      place: result,
      details: nearestPlace || null
    });
  } catch (error) {
    return NextResponse.json(
      {
        place: '지하 은신처',
        details: null,
        error: '검색 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
