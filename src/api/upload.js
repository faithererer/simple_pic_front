import { API_BASE_URL, handleResponse } from './config'

// 上传文件接口
export async function uploadFiles(formData, onProgress, abortSignal) {
  try {
    console.log('发送上传请求...')
    const xhr = new XMLHttpRequest()
    
    // 创建上传 Promise
    const uploadPromise = new Promise((resolve, reject) => {
      // 监听中断信号
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          xhr.abort()
          reject(new Error('上传已取消'))
        })
      }

      // 添加更多事件监听器
      xhr.upload.onloadstart = () => {
        console.log('开始上传数据...')
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total)
          console.log(`上传进度: ${percentage}% (${event.loaded}/${event.total} 字节)`)
          onProgress?.(percentage)
        }
      }

      xhr.upload.onload = () => {
        console.log('数据上传完成')
      }

      xhr.onreadystatechange = () => {
        console.log(`XHR 状态变化: ${xhr.readyState}`)
      }

      xhr.onload = async () => {
        console.log(`收到响应: ${xhr.status}`)
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          console.log('响应数据:', response)
          resolve(response)
        } else {
          reject(new Error(`上传失败: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        console.error('XHR 错误')
        reject(new Error('网络错误'))
      }

      xhr.upload.onerror = (error) => {
        console.error('上传错误:', error)
        reject(new Error('上传错误'))
      }
    })

    // 发送请求
    xhr.open('POST', `${API_BASE_URL}/files/upload`)
    console.log('XHR 已打开连接')
    xhr.send(formData)
    console.log('XHR 已发送数据')
    
    // 等待上传完成
    const result = await uploadPromise
    console.log('上传完成，最终响应:', result)
    return result
  } catch (error) {
    if (error.message === '上传已取消') {
      console.log('上传被用户取消')
      return {
        success: false,
        error: '上传已取消'
      }
    }
    console.error('上传请求失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取媒体列表接口
export async function getMediaList({ page = 1, limit = 20, type = 'all', sortBy = 'uploadedAt', order = 'desc' } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: limit.toString(),
    type,
    sortBy,
    order
  })

  try {
    const response = await fetch(`${API_BASE_URL}/files?${params}`)
    return handleResponse(response)
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 删除文件接口
export async function deleteFile(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取文件详情接口
export async function getFileDetail(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`)
    return handleResponse(response)
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 批量操作接口
export async function batchOperation(operation, fileIds, targetFolder) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        fileIds,
        targetFolder
      })
    })
    return handleResponse(response)
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取上传进度
export async function getUploadProgress(fileId) {
  if (!fileId) {
    console.error('缺少文件ID')
    return {
      success: false,
      error: '缺少文件ID'
    }
  }

  try {
    console.log(`请求进度 API: ${API_BASE_URL}/files/progress/${fileId}`) // 调试日志
    const response = await fetch(`${API_BASE_URL}/files/progress/${fileId}`)
    return handleResponse(response)
  } catch (error) {
    console.error('获取进度失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 