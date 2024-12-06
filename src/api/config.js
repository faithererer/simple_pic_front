// export const API_BASE_URL = 'http://localhost:8083/api/v1'

export const API_BASE_URL = 'http://disk.zjcspace.xyz:8083/api/v1'

// API 请求配置
export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30秒超时
}

// 统一处理响应
export async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '请求失败')
  }
  return response.json()
} 