export const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token)
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token')
}

export const removeAccessToken = (): void => {
  localStorage.removeItem('access_token')
}
