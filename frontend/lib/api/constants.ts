/**
 * 서버/클라이언트 양쪽에서 참조하는 API 상수.
 * (`client.ts` 는 'use client' 라 서버 모듈에서 직접 import 하지 않는다)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'
