import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ClockLoader } from "react-spinners";
import BusinessDataView from './BusinessDataView';

/**
 * 회사 정보 페이지 (서버 컴포넌트)
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.searchParams - URL 검색 파라미터
 */
export default async function BusinessInfo({ searchParams }) {

  const params = await Promise.resolve(searchParams);
  const hash = params.hash;

  if (!hash) {
    notFound();
  }

  // 서버에서 데이터 가져오기 시도
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_business_info?hash=${hash}`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch business data');
    }
    
    // 데이터 유효성만 확인 (실제 데이터는 클라이언트 컴포넌트에서 사용)
    await response.json();
  } catch (error) {
    console.error('Error loading business data:', error);
    // 서버에서 데이터를 찾을 수 없는 경우 404 페이지 표시
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><ClockLoader color="#3182CE" /></div>}>
      <BusinessDataView hash={hash} />
    </Suspense>
  );
}
