import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import { uploadFiles, getUploadProgress } from '../api/upload'
import { API_BASE_URL } from '../api/config'
import { ElMessage } from 'element-plus'

export const useUploadStore = defineStore('upload', () => {
  const files = ref([])
  const isUploading = ref(false)
  const uploadControllers = new Map() // 存储每个文件的中断控制器

  // 添加文件到列表
  const addFiles = async (newFiles) => {
    let startIndex = -1
    let uploadingFiles = []

    try {
      isUploading.value = true
      
      // 添加文件到列表，初始化进度为0
      uploadingFiles = Array.from(newFiles).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'uploading',
        file: file,
        abortController: new AbortController() // 为每个文件创建中断控制器
      }))
      
      console.log('准备上传文件:', uploadingFiles.map(f => f.name))
      
      // 添加到文件列表
      startIndex = files.value.length
      files.value.push(...uploadingFiles)

      // 保存中断控制器
      uploadingFiles.forEach((file, i) => {
        const index = startIndex + i
        uploadControllers.set(index, file.abortController)
      })

      // 上传文件
      const formData = new FormData()
      uploadingFiles.forEach(file => {
        formData.append('files', file.file)
      })

      console.log('开始上传文件...')
      const result = await uploadFiles(
        formData, 
        (percentage) => {
          // 更新所有文件的进度
          uploadingFiles.forEach((file, i) => {
            const index = startIndex + i
            if (index < files.value.length) {
              files.value[index] = {
                ...files.value[index],
                uploadProgress: percentage
              }
            }
          })
        },
        uploadingFiles[0].abortController.signal // 使用第一个文件的中断信号
      )

      console.log('上传响应:', result)

      if (result.success) {
        // 更新文件信息
        result.data.files.forEach((file, i) => {
          const index = startIndex + i
          if (index < files.value.length) {
            files.value[index] = {
              ...files.value[index],
              id: file.id,
              url: file.url ? (file.url.startsWith('http') ? file.url : `${API_BASE_URL}${file.url}`) : undefined,
              thumbnailUrl: file.thumbnailUrl ? `${API_BASE_URL}${file.thumbnailUrl}` : undefined,
              metadata: file.metadata,
              uploadProgress: 100,
              status: 'success'
            }
          }
        })

        ElMessage.success({
          message: '文件上传成功',
          type: 'success',
          duration: 3000
        })
      } else {
        handleUploadError(result.error?.message || '上传失败', startIndex, uploadingFiles.length)
      }
    } catch (error) {
      console.error('上传过程出错:', error)
      if (startIndex !== -1 && uploadingFiles.length > 0) {
        handleUploadError(error.message || '未知错误', startIndex, uploadingFiles.length)
      } else {
        ElMessage.error({
          message: error.message || '未知错误',
          type: 'error',
          duration: 5000
        })
      }
    } finally {
      // 清理中断控制器
      uploadingFiles.forEach((file, i) => {
        const index = startIndex + i
        uploadControllers.delete(index)
      })
      isUploading.value = false
    }
  }

  // 开始轮询进度
  const startProgressPolling = async (fileId, index) => {
    if (!fileId) {
      console.error('缺少文件ID，无法查询进度')
      return
    }

    let retryCount = 0
    const maxRetries = 3
    const pollInterval = 1000 // 1秒

    const poll = async () => {
      try {
        console.log(`开始查询文件 ${fileId} 的进度...`)
        const response = await fetch(`${API_BASE_URL}/files/progress/${fileId}`)
        const result = await response.json()
        console.log(`文件 ${fileId} 进度查询结果:`, result)

        if (!result.success) {
          throw new Error(result.error?.message || '获取进度失败')
        }

        const progress = result.data
        if (!files.value[index]) {
          console.log('文件已被删除，停止轮询')
          return
        }

        // 更新进度和状态
        files.value[index] = {
          ...files.value[index],
          uploadProgress: progress.percentage || 0,
          status: progress.status.toLowerCase()
        }

        // 根据状态处理
        switch (progress.status) {
          case 'COMPLETED':
            console.log(`文件 ${fileId} 上传完成`)
            files.value[index].uploadProgress = 100
            ElMessage.success({
              message: `${files.value[index].name} 上传成功`,
              type: 'success',
              duration: 3000
            })
            break

          case 'FAILED':
            console.log(`文件 ${fileId} 上传失败`)
            files.value[index].error = '上传失败'
            files.value[index].uploadProgress = 100
            ElMessage.error({
              message: `${files.value[index].name} 上传失败`,
              type: 'error',
              duration: 5000
            })
            break

          case 'UPLOADING':
            console.log(`文件 ${fileId} 正在上传，进度: ${progress.percentage}%`)
            // 继续轮询
            setTimeout(poll, pollInterval)
            break

          default:
            console.warn(`未知的文件状态: ${progress.status}`)
        }

        retryCount = 0 // 重置重试计数
      } catch (error) {
        console.error(`获取文件 ${fileId} 进度失败:`, error)
        retryCount++

        if (retryCount <= maxRetries) {
          console.log(`第 ${retryCount} 次重试...`)
          setTimeout(poll, pollInterval)
        } else {
          console.error(`超过最大重试次数，停止轮询`)
          if (files.value[index]) {
            files.value[index] = {
              ...files.value[index],
              status: 'error',
              error: '获取进度失败'
            }
            ElMessage.error({
              message: `${files.value[index].name} 获取进度失败`,
              type: 'error',
              duration: 5000
            })
          }
        }
      }
    }

    // 立即开始第一次轮询
    console.log(`开始轮询文件 ${fileId} 的进度`)
    poll()
  }

  // 处理上传错误
  const handleUploadError = (errorMessage, startIndex, count) => {
    for (let i = 0; i < count; i++) {
      const index = startIndex + i
      if (index < files.value.length) {
        files.value[index] = {
          ...files.value[index],
          uploadProgress: 100,
          status: 'error',
          error: errorMessage
        }
      }
    }
    ElMessage.error({
      message: errorMessage,
      type: 'error',
      duration: 5000
    })
  }

  // 移除文件
  const removeFile = (index) => {
    // 如果文件正在上传，先中断上传
    const controller = uploadControllers.get(index)
    if (controller) {
      console.log(`中断文件 ${files.value[index].name} 的上传`)
      controller.abort()
      uploadControllers.delete(index)
    }
    files.value.splice(index, 1)
  }

  // 清空文件列表
  const clearFiles = () => {
    // 中断所有正在进行的上传
    uploadControllers.forEach(controller => controller.abort())
    uploadControllers.clear()
    files.value = []
  }

  // 组件卸载时清理
  onUnmounted(() => {
    clearFiles()
  })

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    clearFiles
  }
}) 