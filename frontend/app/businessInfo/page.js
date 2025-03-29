'use client'

import { useSearchParams } from 'next/navigation';
import BusinessDataView from './BusinessDataView';

export default function BusinessInfo() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');

  if (!hash) {
    return (
      <div>올바른 회사 정보를 찾을 수 없습니다.</div>
    );
  }

  return <BusinessDataView hash={hash} />;
}
