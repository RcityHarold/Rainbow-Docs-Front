import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查业务状态码
    if (response.data && !response.data.success && response.data.message) {
      message.error(response.data.message)
      return Promise.reject(new Error(response.data.message))
    }
    
    return response
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          message.error('登录已过期，请重新登录')
          break
          
        case 403:
          message.error('权限不足')
          break
          
        case 404:
          message.error('请求的资源不存在')
          break
          
        case 422:
          // 验证错误
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat()
            message.error(errorMessages.join(', '))
          } else {
            message.error(data.message || '请求参数错误')
          }
          break
          
        case 429:
          message.error('请求过于频繁，请稍后再试')
          break
          
        case 500:
          message.error('服务器内部错误')
          break
          
        default:
          message.error(data?.message || data?.error || '网络错误，请稍后重试')
      }
    } else if (error.request) {
      // 网络错误
      message.error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      message.error(error.message || '未知错误')
    }
    
    return Promise.reject(error)
  }
)

// 通用请求方法
export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.put(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete(url, config),
    
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }),
}

export default api