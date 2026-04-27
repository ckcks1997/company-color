'use client'

import apiClient from './axios'
import type { PaginatedResponse } from './types'

export interface FavoriteItem {
  hash: string
  company_nm: string | null
  created_at: string
}

export interface MyReplyItem {
  idx: number
  hash: string
  reply: string
  created_at: string | null
}

export async function listFavorites(
  page: number = 1,
  itemsPerPage: number = 30
): Promise<PaginatedResponse<FavoriteItem>> {
  const params = new URLSearchParams({
    page: String(page),
    items_per_page: String(itemsPerPage),
  })
  const response = await apiClient.get<PaginatedResponse<FavoriteItem>>(
    `/me/favorites?${params.toString()}`
  )
  return response.data
}

/** 본인 즐겨찾기의 hash 배열만 가볍게 가져오기 — 검색 결과 lookup 용. */
export async function listFavoriteHashes(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/me/favorites/hashes')
  return response.data
}

export async function addFavorite(hash: string, companyNm?: string | null): Promise<FavoriteItem> {
  const response = await apiClient.post<FavoriteItem>('/me/favorites', {
    hash,
    company_nm: companyNm ?? null,
  })
  return response.data
}

export async function removeFavorite(hash: string): Promise<void> {
  await apiClient.delete(`/me/favorites/${encodeURIComponent(hash)}`)
}

export async function listMyReplies(): Promise<MyReplyItem[]> {
  const response = await apiClient.get<MyReplyItem[]>('/me/replies')
  return response.data
}
