# Simple Picture Hub

一个现代化的文件托管与分享平台，支持多种媒体格式。

- 在线地址: [https://share.zjcspace.xyz](https://share.zjcspace.xyz)

## 功能特点

- 📤 支持多种文件格式上传（图片、视频、音频、文档等）
- 📋 支持剪贴板直接粘贴上传
- 👀 媒体文件在线预览
- 🌓 亮色/暗色主题切换
- 📱 全响应式设计，完美适配各种设备
- ✨ 现代化 UI 设计，流畅动画效果
- 🔍 强大的媒体管理功能
  - 支持多种排序方式（上传时间、文件名、大小）
  - 文件类型筛选
  - 分页加载
  - 文件预览和下载

## 技术栈

- Vue 3 (Composition API)
- Vite
- TailwindCSS - 样式框架
- Iconify - 图标系统
- Vue Router - 路由管理
- Pinia - 状态管理

## 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后，可以通过以下方式访问应用：

1. 打开浏览器，访问 http://localhost:5173 (默认端口)
2. 可以通过以下路由访问不同功能：
   - `/` - 首页
   - `/upload` - 文件上传页面
   - `/gallery` - 媒体库页面

## 开发指南

### 目录结构

```
src/
├── assets/        # 静态资源
├── components/    # 通用组件
├── router/        # 路由配置
├── stores/        # 状态管理
├── views/         # 页面组件
├── App.vue        # 根组件
└── main.js        # 入口文件
```

### 功能说明

#### 媒体库功能

1. 文件展示
   - 网格布局展示媒体文件
   - 支持图片预览、视频和音频播放
   - 显示文件名和类型图标
   - 悬浮显示操作按钮

2. 文件排序
   - 最近上传（默认）
   - 文件名字母顺序
   - 文件大小排序

3. 文件筛选
   - 全部文件
   - 仅图片
   - 仅视频
   - 仅音频

4. 文件操作
   - 预览：支持图片、视频、音频的在线预览
   - 下载：直接下载原始文件
   - 分页加载：支持滚动加载更多

#### 文件上传功能

支持多种上传方式：
1. 点击上传按钮选择文件
2. 拖拽文件到上传区域
3. 直接粘贴文件（Ctrl+V / Command+V）

#### 主题切换

应用支持亮色/暗色主题切换：
1. 点击导航栏右上角的主题切换按钮
2. 自动跟随系统主题设置
3. 主题设置会被保存在 localStorage 中

### 组件说明

1. `MediaPreview.vue`
   - 用于预览媒体文件的模态框组件
   - 支持图片、视频、音频预览
   - 显示文件详细信息
   - 提供下载功能

2. `GalleryView.vue`
   - 媒体库主页面组件
   - 实现文件网格展示
   - 处理文件排序和筛选
   - 管理文件预览和下载

3. `UploadView.vue`
   - 文件上传页面组件
   - 处理文件上传逻辑
   - 支持多种上传方式
   - 显示上传进度和状态

## 生产环境构建

```bash
# 构建生产版本
npm run build
```

构建后的文件将生成在 `dist` 目录中。

## 浏览器支持

- Chrome ≥ 87
- Firefox ≥ 78
- Safari ≥ 14
- Edge ≥ 88

## 许可证

MIT
 

### 错误代码说明

```typescript
enum ErrorCodes {
  INVALID_REQUEST = 'INVALID_REQUEST',       // 无效的请求参数
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',        // 文件超过大小限制
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE', // 不支持的文件类型
  STORAGE_LIMIT_EXCEEDED = 'STORAGE_LIMIT_EXCEEDED', // 存储空间已满
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',        // 文件不存在
  PERMISSION_DENIED = 'PERMISSION_DENIED',   // 权限不足
  SERVER_ERROR = 'SERVER_ERROR'             // 服务器内部错误
}
```

### 文件上传限制

```typescript
interface UploadLimits {
  maxFileSize: number;    // 单个文件最大大小（字节）
  totalStorageSize: number; // 总存储空间（字节）
  allowedFileTypes: string[]; // 允许的文件类型
  maxFilesPerUpload: number; // 单次上传最大文件数
}
```
