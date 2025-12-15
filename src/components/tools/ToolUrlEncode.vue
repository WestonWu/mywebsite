<template>
  <div class="url-encode-tool">
    <div class="tool-header">
      <p>URL编码/解码工具</p>
    </div>

    <div class="tool-body">
      <!-- 左侧：输入区域 -->
      <div class="text-input-section">
        <div class="option-group">
          <label for="url-encode-input">输入URL或文本</label>
          <textarea
            id="url-encode-input"
            v-model="urlEncodeInput"
            placeholder="请输入要编码/解码的URL或文本..."
            class="text-input"
            @input="processUrlEncode"
          ></textarea>
        </div>

        <div class="option-group">
          <label>操作类型</label>
          <div class="conversion-options">
            <label class="radio-label">
              <input type="radio" v-model="urlEncodeOperation" value="encode" @change="processUrlEncode" />
              <span>编码</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="urlEncodeOperation" value="decode" @change="processUrlEncode" />
              <span>解码</span>
            </label>
          </div>
        </div>

        <div class="option-group">
          <label>编码选项</label>
          <div class="checkbox-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="encodeFullUrl" @change="processUrlEncode" />
              <span>完整URL编码</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="encodeSpaceAsPlus" @change="processUrlEncode" />
              <span>空格编码为+</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 右侧：输出区域 -->
      <div class="text-output-section">
        <div class="option-group">
          <div class="output-header">
            <label>输出结果</label>
            <button class="copy-btn" @click="copyUrlEncodeOutput" :disabled="!urlEncodeOutput">复制</button>
          </div>
          <textarea
            v-model="urlEncodeOutput"
            placeholder="处理结果将显示在这里..."
            class="text-output"
            readonly
          ></textarea>
        </div>

        <div class="option-group" v-if="urlEncodeOperation === 'decode' && urlEncodeOutput">
          <label>解码结果预览</label>
          <div class="preview-section">
            <div class="url-preview">
              <a :href="getPreviewUrl(urlEncodeOutput)" target="_blank" rel="noopener noreferrer">{{ urlEncodeOutput }}</a>
            </div>
          </div>
        </div>

        <div class="option-group" v-if="urlEncodeOutput">
          <button class="download-btn" @click="downloadResult">下载结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToolUtils } from '../../composables/useToolUtils'

export default {
  name: "ToolUrlEncode",
  setup() {
    const { 
      copyToClipboard,
      generateRandomId 
    } = useToolUtils()
    
    return {
      copyToClipboard,
      generateRandomId
    }
  },
  data() {
    return {
      // URL编码相关配置
      urlEncodeInput: "", // 输入文本
      urlEncodeOutput: "", // 输出文本
      urlEncodeOperation: "encode", // 操作类型：encode, decode
      encodeFullUrl: false, // 是否完整URL编码
      encodeSpaceAsPlus: true, // 是否将空格编码为+（仅编码时有效）
    }
  },
  methods: {
    // 处理URL编码/解码
    processUrlEncode() {
      if (!this.urlEncodeInput) {
        this.urlEncodeOutput = ""
        return
      }

      try {
        if (this.urlEncodeOperation === "encode") {
          // URL编码
          this.urlEncodeOutput = this.encodeUrl(this.urlEncodeInput)
        } else {
          // URL解码
          this.urlEncodeOutput = this.decodeUrl(this.urlEncodeInput)
        }
      } catch (error) {
        this.urlEncodeOutput = `处理失败: ${error.message}`
      }
    },
    
    // URL编码
    encodeUrl(url) {
      if (this.encodeFullUrl) {
        // 完整URL编码
        return encodeURIComponent(url)
      } else {
        // 仅编码路径和查询参数部分
        try {
          const urlObj = new URL(url)
          let encodedUrl = `${urlObj.protocol}//${urlObj.hostname}`
          
          if (urlObj.port) {
            encodedUrl += `:${urlObj.port}`
          }
          
          if (urlObj.pathname) {
            // 编码路径
            encodedUrl += urlObj.pathname.split('/').map((part, index) => {
              if (index === 0) return part
              return encodeURIComponent(part)
            }).join('/')
          }
          
          if (urlObj.search) {
            // 编码查询参数
            const searchParams = new URLSearchParams(urlObj.search)
            const encodedParams = []
            for (const [key, value] of searchParams.entries()) {
              encodedParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            }
            encodedUrl += `?${encodedParams.join('&')}`
          }
          
          if (urlObj.hash) {
            // 编码哈希部分
            encodedUrl += `#${encodeURIComponent(urlObj.hash.slice(1))}`
          }
          
          return encodedUrl
        } catch {
          // 如果不是有效的URL，使用普通编码
          return encodeURIComponent(url)
        }
      }
    },
    
    // URL解码
    decodeUrl(url) {
      // 先将+转换为空格
      const urlWithSpaces = url.replace(/\+/g, ' ')
      // 然后进行URL解码
      return decodeURIComponent(urlWithSpaces)
    },
    
    // 获取预览URL
    getPreviewUrl(url) {
      try {
        // 尝试解析为URL
        new URL(url)
        return url
      } catch {
        // 如果不是有效的URL，返回空
        return ''
      }
    },
    
    // 复制结果
    copyUrlEncodeOutput() {
      this.copyToClipboard(this.urlEncodeOutput)
        .then(success => {
          if (success) {
            console.log("URL编码/解码结果已复制到剪贴板")
            // 可以添加复制成功的提示
          }
        })
    },
    
    // 下载结果
    downloadResult() {
      if (!this.urlEncodeOutput) return
      
      const filename = `${this.urlEncodeOperation === 'encode' ? 'url_encoded' : 'url_decoded'}_${this.generateRandomId(8)}.txt`
      const blob = new Blob([this.urlEncodeOutput], { type: 'text/plain' })
      
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
/* URL编码/解码工具样式 */
.url-encode-tool {
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
.conversion-options,
.checkbox-options {
  display: flex;
  gap: 20px;
}

/* 单选按钮标签 */
.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.radio-label input[type="radio"],
.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.radio-label:hover,
.checkbox-label:hover {
  color: var(--accent-color);
}

/* 复制按钮 */
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

/* 预览区域 */
.preview-section {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 12px;
  overflow: auto;
  max-height: 150px;
}

/* URL预览 */
.url-preview a {
  color: var(--accent-color);
  text-decoration: none;
  word-break: break-all;
  font-size: 0.9rem;
  font-family: 'Courier New', Courier, monospace;
}

.url-preview a:hover {
  color: var(--accent-color-hover);
  text-decoration: underline;
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
  
  .conversion-options,
  .checkbox-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .output-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>