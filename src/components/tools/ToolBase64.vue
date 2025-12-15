<template>
  <div class="base64-tool">
    <div class="tool-header">
      <p>Base64编码/解码工具</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：输入区域 -->
      <div class="text-input-section">
        <div class="option-group">
          <label for="base64-input">输入文本或上传文件</label>
          <textarea
            id="base64-input"
            v-model="base64Input"
            placeholder="请输入要编码/解码的文本..."
            class="text-input"
            @input="processBase64"
          ></textarea>
        </div>

        <div class="option-group">
          <label>操作类型</label>
          <div class="conversion-options">
            <label class="radio-label">
              <input type="radio" v-model="base64Operation" value="encode" @change="processBase64" />
              <span>编码</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="base64Operation" value="decode" @change="processBase64" />
              <span>解码</span>
            </label>
          </div>
        </div>

        <div class="option-group">
          <label>文件操作</label>
          <div class="file-options">
            <input
              type="file"
              @change="handleFileUpload"
              class="file-input"
              :accept="base64Operation === 'encode' ? '*/*' : '.txt,.json,.html,.css,.js'"
            />
            <button class="clear-btn" @click="clearFile" v-if="selectedFile">清除文件</button>
          </div>
          <div class="file-info" v-if="selectedFile">
            <span>{{ selectedFile.name }}</span>
            <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
          </div>
        </div>
      </div>

      <!-- 右侧：输出区域 -->
      <div class="text-output-section">
        <div class="option-group">
          <div class="output-header">
            <label>输出结果</label>
            <button class="copy-btn" @click="copyBase64Output" :disabled="!base64Output">复制</button>
          </div>
          <textarea
            v-model="base64Output"
            placeholder="处理结果将显示在这里..."
            class="text-output"
            readonly
          ></textarea>
        </div>

        <div class="option-group" v-if="base64Operation === 'decode' && base64Output && isTextContent">
          <label>解码结果预览</label>
          <div class="preview-section">
            <pre>{{ base64Output }}</pre>
          </div>
        </div>

        <div class="option-group" v-if="downloadable">
          <button class="download-btn" @click="downloadResult">下载结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToolUtils } from '../../composables/useToolUtils'

export default {
  name: "ToolBase64",
  setup() {
    const { 
      copyToClipboard,
      formatFileSize,
      generateRandomId 
    } = useToolUtils()
    
    return {
      copyToClipboard,
      formatFileSize,
      generateRandomId
    }
  },
  data() {
    return {
      // Base64相关配置
      base64Input: "", // 输入文本
      base64Output: "", // 输出文本
      base64Operation: "encode", // 操作类型：encode, decode
      selectedFile: null, // 选中的文件
      downloadable: false, // 是否可下载
      isTextContent: true, // 是否为文本内容
    }
  },
  methods: {
    // 处理Base64编码/解码
    processBase64() {
      if (!this.base64Input) {
        this.base64Output = ""
        this.downloadable = false
        return
      }

      try {
        if (this.base64Operation === "encode") {
          // Base64编码
          this.base64Output = btoa(unescape(encodeURIComponent(this.base64Input)))
        } else {
          // Base64解码
          this.base64Output = decodeURIComponent(escape(atob(this.base64Input)))
        }
        
        this.downloadable = true
        this.isTextContent = this.isText(this.base64Output)
      } catch (error) {
        this.base64Output = `处理失败: ${error.message}`
        this.downloadable = false
        this.isTextContent = true
      }
    },
    
    // 检查内容是否为文本
    isText(content) {
      try {
        // 尝试解析为JSON，成功则返回true
        JSON.parse(content)
        return true
      } catch {
        // 检查是否包含不可打印字符
        const nonTextRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g
        return !nonTextRegex.test(content)
      }
    },
    
    // 处理文件上传
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        const reader = new FileReader()
        
        if (this.base64Operation === "encode") {
          // 文件编码：读取为DataURL
          reader.onload = (e) => {
            // 提取Base64部分（去除DataURL前缀）
            const dataUrl = e.target.result
            this.base64Output = dataUrl.split(',')[1]
            this.downloadable = true
            this.isTextContent = false
          }
          reader.readAsDataURL(file)
        } else {
          // 文件解码：读取为文本
          reader.onload = (e) => {
            this.base64Input = e.target.result
            this.processBase64()
          }
          reader.readAsText(file)
        }
      }
    },
    
    // 清除文件
    clearFile() {
      this.selectedFile = null
      // 清除文件输入
      const fileInput = document.querySelector('.file-input')
      if (fileInput) {
        fileInput.value = ""
      }
      // 重置输出
      this.base64Output = ""
      this.downloadable = false
    },
    
    // 复制结果
    copyBase64Output() {
      this.copyToClipboard(this.base64Output)
        .then(success => {
          if (success) {
            console.log("Base64结果已复制到剪贴板")
            // 可以添加复制成功的提示
          }
        })
    },
    
    // 下载结果
    downloadResult() {
      if (!this.base64Output) return
      
      let blob, filename
      
      if (this.base64Operation === "encode") {
        // 编码结果：如果是从文件编码来的，保持原文件名，否则生成新文件名
        filename = this.selectedFile ? `${this.selectedFile.name}.base64` : `encoded_${this.generateRandomId(8)}.txt`
        blob = new Blob([this.base64Output], { type: 'text/plain' })
      } else {
        // 解码结果：如果是文本，使用.txt，否则尝试其他格式
        filename = this.selectedFile ? this.selectedFile.name.replace(/\.base64$/, '') : `decoded_${this.generateRandomId(8)}.txt`
        
        if (this.isTextContent) {
          blob = new Blob([this.base64Output], { type: 'text/plain' })
        } else {
          // 二进制数据，使用application/octet-stream
          blob = new Blob([atob(this.base64Output)], { type: 'application/octet-stream' })
        }
      }
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  },
}
</script>

<style scoped>
/* Base64工具样式 */
.base64-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-header {
  margin-bottom: 20px;
  text-align: center;
}

.tool-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.tool-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  height: calc(100% - 60px);
}

/* 文本输入区域 */
.text-input-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 文本输出区域 */
.text-output-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 选项组 */
.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* 文本输入区域 */
.text-input,
.text-output {
  width: 100%;
  height: 200px;
  padding: 12px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.text-output {
  background: var(--secondary-bg);
  cursor: default;
}

/* 转换选项 */
.conversion-options {
  display: flex;
  gap: 20px;
}

/* 单选按钮标签 */
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.radio-label:hover {
  color: var(--accent-color);
}

/* 文件操作 */
.file-options {
  display: flex;
  gap: 10px;
  align-items: center;
}

.file-input {
  padding: 8px;
  background: var(--primary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn,
.copy-btn,
.download-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover,
.copy-btn:hover:not(:disabled),
.download-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 文件信息 */
.file-info {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 5px;
}

.file-size {
  font-size: 0.7rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* 预览区域 */
.preview-section {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 12px;
  overflow: auto;
  max-height: 150px;
}

.preview-section pre {
  margin: 0;
  color: var(--text-primary);
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 输出头部 */
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 下载按钮 */
.download-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .text-input,
  .text-output {
    height: 150px;
  }
  
  .conversion-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .file-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .output-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>