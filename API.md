# API 文档

## 基础配置

```javascript
const API_BASE_URL = 'http://disk.zjcspace.xyz:8083/api/v1'
```

## 接口列表

### 文件上传

```typescript
POST /files/upload
Content-Type: multipart/form-data

Request:
{
  files: File[]  // 文件列表
}

Response:
{
  success: boolean;
  data?: {
    files: Array<{
      id: string;         // 文件唯一标识
      name: string;       // 文件名
      size: number;       // 文件大小（字节）
      type: string;       // 文件MIME类型
      url: string;        // 文件访问URL
      thumbnailUrl?: string; // 缩略图URL（图片/视频）
      uploadedAt: string; // 上传时间
      metadata?: {        // 额外的元数据
        width?: number;   // 图片/视频宽度
        height?: number;  // 图片/视频高度
        duration?: number;// 音视频时长
      }
    }>;
  };
  error?: {
    code: string;
    message: string;
  }
}
```

### 获取上传进度

```typescript
GET /files/progress/{fileId}

Response:
{
  success: boolean;
  data?: {
    fileId: string;       // 文件ID
    fileName: string;     // 文件名
    totalBytes: number;   // 文件总大小
    uploadedBytes: number;// 已上传大小
    percentage: number;   // 上传百分比（0-100）
    status: string;       // 上传状态：UPLOADING, COMPLETED, FAILED
  };
  error?: {
    code: string;
    message: string;
  }
}
```

### 获取媒体列表

```typescript
GET /files

Query Parameters:
{
  page: number;      // 页码，从1开始
  pageSize: number;  // 每页数量
  type?: string;     // 文件类型：all, image, video, audio
  sortBy?: string;   // 排序字段：uploadedAt, name, size
  order?: string;    // 排序方向：desc, asc
}

Response:
{
  success: boolean;
  data?: {
    items: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
      thumbnailUrl?: string;
      uploadedAt: string;
      metadata?: object;
    }>;
    pagination: {
      total: number;
      page: number;
      pageSize: number;
    }
  };
  error?: {
    code: string;
    message: string;
  }
}
```

### 删除文件

```typescript
DELETE /files/{fileId}

Response:
{
  success: boolean;
  error?: {
    code: string;
    message: string;
  }
}
```

### 获取文件详情

```typescript
GET /files/{fileId}

Response:
{
  success: boolean;
  data?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
    metadata?: {
      width?: number;
      height?: number;
      duration?: number;
    }
  };
  error?: {
    code: string;
    message: string;
  }
}
```

### 批量操作

```typescript
POST /files/batch

Request:
{
  operation: string;    // 操作类型：delete, move, copy
  fileIds: string[];   // 文件ID列表
  targetFolder?: string;// 目标文件夹（移动/复制时需要）
}

Response:
{
  success: boolean;
  error?: {
    code: string;
    message: string;
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| UPLOAD_FAILED | 上传失败 |
| FILE_NOT_FOUND | 文件不存在 |
| INVALID_FILE_TYPE | 不支持的文件类型 |
| FILE_TOO_LARGE | 文件大小超出限制 |
| UPLOAD_LIMIT_EXCEEDED | 超过上传数量限制 |
| OPERATION_FAILED | 操作失败 |
| INVALID_OPERATION | 无效的操作类型 |

## 支持的文件类型

### 图片
- jpg/jpeg
- png
- gif
- webp
- svg

### 视频
- mp4
- webm
- mov
- avi

### 音频
- mp3
- wav
- ogg
- m4a

### 文档
- pdf
- doc/docx
- xls/xlsx
- ppt/pptx
- txt

### 压缩文件
- zip
- rar
- 7z

## 限制说明

1. 文件上传：
   - 单个文件最大：100MB
   - 单次上传数量：最多10个文件
   - 支持的文件类型：见上述列表

2. API 调用：
   - 请求频率限制：每分钟60次
   - 上传接口限制：每分钟10次
   - 批量操作限制：每次最多100个文件

3. 存储限制：
   - 总存储空间：10GB/用户
   - 单个文件夹最大文件数：1000个

## 注意事项

1. 所有接口返回的 URL 都是相对路径，需要拼接 API_BASE_URL
2. 图片和视频会自动生成缩略图
3. 文件名长度限制：1-255字符
4. 批量操作建议分批进行，每批不超过50个文件
5. 上传失败后会自动重试3次 