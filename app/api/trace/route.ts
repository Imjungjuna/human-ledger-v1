import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 로컬 테스트를 위해 외부 GeoIP API 사용 (ip-api.com)
    // 실제 배포 시에는 req.headers.get('x-forwarded-for')에서 추출한 IP를 사용하면 된다
    const res = await fetch('http://ip-api.com/json/');
    const locationData = await res.json();

    const ip = locationData.query;
    const region = locationData.regionName; // 경기도
    const city = locationData.city; // 성남시
    const isp = locationData.isp; // SK Broadband, KT 등

    // 터미널 출력
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 IP 기반 위치 정보 수집 완료');
    console.log(`IP 주소: ${ip}`);
    console.log(`지역: ${region}`);
    console.log(`도시: ${city}`);
    console.log(`ISP: ${isp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      ip,
      region,
      city,
      isp
    });
  } catch (error) {
    // x-forwarded-for 헤더에서 IP 주소 추출 (fallback)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : realIp 
      ? realIp 
      : 'unknown';

    console.error('IP 기반 위치 정보 수집 실패:', error);
    console.log(`Fallback IP: ${ip}`);

    return NextResponse.json({ 
      ip,
      region: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // x-forwarded-for 헤더에서 IP 주소 추출
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : realIp 
      ? realIp 
      : 'unknown';

    return NextResponse.json({ 
      success: true,
      ip,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to collect IP address' },
      { status: 500 }
    );
  }
}
