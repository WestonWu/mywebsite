<template>
  <div class="contact">
    <h1>联系方式</h1>
    <div class="contact-content">
      <p>欢迎通过以下方式联系我，我会尽快回复您的消息：</p>
      <ul class="contact-list">
        <li class="contact-item">
          <div class="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M22 6L12 13l-10-7"></path>
            </svg>
          </div>
          <div class="contact-info">
            <h3>邮箱</h3>
            <p>wxy5731057@vip.qq.com</p>
          </div>
        </li>
        <li class="contact-item">
          <div class="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </div>
          <div class="contact-info">
            <h3>GitHub</h3>
            <p><a href="https://github.com/WestonWu" target="_blank" rel="noopener noreferrer">https://github.com/WestonWu</a></p>
          </div>
        </li>
        <li class="contact-item">
          <div class="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </div>
          <div class="contact-info">
            <h3>QQ</h3>
            <p>124191808</p>
          </div>
        </li>
      </ul>

      <!-- 社交媒体链接 -->
      <div class="social-media-section">
        <h2>关注我的社交媒体</h2>
        <div class="social-media-links">
          <a href="https://github.com/WestonWu" target="_blank" rel="noopener noreferrer" class="social-link github" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span>GitHub</span>
          </a>
          <a href="#" class="social-link linkedin" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            <span>LinkedIn</span>
          </a>
          <a href="#" class="social-link twitter" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
            <span>Twitter</span>
          </a>
        </div>
      </div>

      <div class="contact-form">
        <h2>发送消息</h2>
        <form @submit="handleSubmit">
          <div class="form-group">
            <label for="name">姓名 *</label>
            <input 
              type="text" 
              id="name" 
              v-model="name" 
              placeholder="请输入您的姓名（2-50个字符）" 
              :class="{ 'invalid': errors.name, 'valid': name && !errors.name && name.length >= 2 }"
              @input="clearError('name')"
              @blur="() => { const validation = validateField('name', name); errors.value = { ...errors.value, ...validation }; }"
              aria-required="true"
              maxlength="50"
            />
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>
          <div class="form-group">
            <label for="email">邮箱 *</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="请输入您的邮箱（例如：example@email.com）" 
              :class="{ 'invalid': errors.email, 'valid': email && !errors.email }"
              @input="clearError('email')"
              @blur="() => { const validation = validateField('email', email); errors.value = { ...errors.value, ...validation }; }"
              aria-required="true"
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>
          <div class="form-group">
            <label for="message">消息 *</label>
            <textarea 
              id="message" 
              rows="5" 
              v-model="message" 
              placeholder="请输入您的消息（10-1000个字符）" 
              :class="{ 'invalid': errors.message, 'valid': message && !errors.message && message.length >= 10 }"
              @input="clearError('message')"
              @blur="() => { const validation = validateField('message', message); errors.value = { ...errors.value, ...validation }; }"
              aria-required="true"
              maxlength="1000"
            ></textarea>
            <div class="char-count">{{ message.length }}/1000</div>
            <div v-if="errors.message" class="error-message">{{ errors.message }}</div>
          </div>
          <button type="submit" class="submit-button" :disabled="submitting">
            <span v-if="submitting" class="loading-spinner"></span>
            {{ submitting ? "发送中..." : "发送消息" }}
          </button>
          <div v-if="submitStatus" :class="['submit-status', submitStatusType]">
            <span :class="submitStatusIcon"></span>
            {{ submitStatus }}
          </div>
          <p class="form-note">带 * 的字段为必填项</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import emailjs from "@emailjs/browser"

// 表单数据绑定
const name = ref("")
const email = ref("")
const message = ref("")

// 提交状态
const submitting = ref(false)
const submitStatus = ref("")
const submitStatusType = ref("") // 'success' or 'error'
const errors = ref({})

// 根据状态生成相应的图标
const submitStatusIcon = computed(() => {
  return submitStatusType.value === 'success' ? 'success-icon' : 'error-icon';
})

// TODO: 请填写您的emailjs配置信息
const EMAILJS_SERVICE_ID = "service_hz440gm" // 您的service ID
const EMAILJS_TEMPLATE_ID = "template_idpxpmi" // 您的template ID
const EMAILJS_PUBLIC_KEY = "m5AEUyRfptfukIbVX" // 您的public key

// 清除单个字段的错误信息
const clearError = (fieldName) => {
  delete errors.value[fieldName];
  // 如果所有错误都已清除，清除提交状态
  if (Object.keys(errors.value).length === 0) {
    submitStatus.value = "";
  }
}

// 验证单个字段
const validateField = (fieldName, value) => {
  const fieldErrors = {};
  
  switch (fieldName) {
    case 'name':
      if (!value.trim()) {
        fieldErrors.name = "请输入您的姓名";
      } else if (value.length < 2) {
        fieldErrors.name = "姓名至少需要2个字符";
      } else if (value.length > 50) {
        fieldErrors.name = "姓名不能超过50个字符";
      }
      break;
      
    case 'email':
      if (!value.trim()) {
        fieldErrors.email = "请输入您的邮箱";
      } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        fieldErrors.email = "请输入有效的邮箱地址";
      }
      break;
      
    case 'message':
      if (!value.trim()) {
        fieldErrors.message = "请输入您的消息";
      } else if (value.length < 10) {
        fieldErrors.message = "消息至少需要10个字符";
      } else if (value.length > 1000) {
        fieldErrors.message = "消息不能超过1000个字符";
      }
      break;
      
    default:
      break;
  }
  
  return fieldErrors;
}

// 表单提交处理函数
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 重置错误信息
  errors.value = {}
  submitStatus.value = ""

  // 表单验证
  let isValid = true
  
  // 验证所有字段
  const nameErrors = validateField('name', name.value);
  const emailErrors = validateField('email', email.value);
  const messageErrors = validateField('message', message.value);
  
  // 合并错误信息
  errors.value = { ...nameErrors, ...emailErrors, ...messageErrors };
  
  if (Object.keys(errors.value).length > 0) {
    isValid = false;
    submitStatus.value = "请修正表单中的错误";
    submitStatusType.value = "error";
    
    // 滚动到第一个错误字段
    const firstErrorField = document.querySelector('.form-group input.invalid, .form-group textarea.invalid')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstErrorField.focus()
    }
    
    return;
  }

  submitting.value = true

  try {
    submitting.value = true
    // 使用emailjs发送邮件
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        from_name: name.value,
        from_email: email.value,
        message: message.value,
      },
      EMAILJS_PUBLIC_KEY
    )

    submitStatus.value = "消息发送成功！我会尽快回复您"
    submitStatusType.value = "success"
    
    // 添加成功动画效果
    const submitStatusEl = document.querySelector('.submit-status')
    if (submitStatusEl) {
      submitStatusEl.classList.add('animate-in')
    }
    
    // 清空表单
    name.value = ""
    email.value = ""
    message.value = ""
  } catch (error) {
    console.error("Error sending message:", error)
    submitStatus.value = "消息发送失败，请稍后再试"
    submitStatusType.value = "error"
  } finally {
    submitting.value = false
    setTimeout(() => {
      submitStatus.value = ""
      submitStatusType.value = ""
    }, 5000)
  }
}
</script>

<style scoped>
.contact-list {
  margin: 2rem 0;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(0, 112, 243, 0.05);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.contact-item:hover {
  transform: translateX(5px);
  background-color: rgba(0, 112, 243, 0.1);
}

/* 社交媒体链接样式 */
.social-media-section {
  margin: 3rem 0;
  text-align: center;
}

.social-media-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  background: var(--card-bg);
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-color);
  border-color: var(--accent-color);
}

/* 社交媒体特定样式 */
.social-link.github:hover {
  background: linear-gradient(135deg, #333, #555);
  border-color: #333;
}

.social-link.linkedin:hover {
  background: linear-gradient(135deg, #0077b5, #00a0dc);
  border-color: #0077b5;
}

.social-link.twitter:hover {
  background: linear-gradient(135deg, #1da1f2, #0d9488);
  border-color: #1da1f2;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .social-media-links {
    flex-direction: column;
    align-items: center;
  }
  
  .social-link {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

.contact-icon {
  margin-right: 1rem;
  background: white;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: var(--primary-bg);
}

.contact-info a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-info a:hover {
  color: var(--accent-color-hover);
  text-decoration: underline;
}

.contact-info h3 {
  margin-bottom: 0.3rem;
  color: var(--primary-color);
}

.contact-form {
  margin-top: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 3rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contact-form form {
  max-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-form .form-group {
  width: 100%;
  max-width: 100%;
}

.social-media-section h2,
.contact-form h2 {
    margin-bottom: 1.5rem;
    position: relative;
    display: inline-block;
    color: var(--text-primary) !important;
  }

.contact-form h2::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary) !important;
  }

.form-group input,
  .form-group textarea {
    width: 100%;
    max-width: 100%;
    padding: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
    color: var(--text-primary) !important;
    background: rgba(255, 255, 255, 0.05);
  }
  
  /* 为输入框占位符添加颜色 */
  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: var(--text-secondary) !important;
  }

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
}

.submit-button {
    /* 设置默认渐变背景作为后备 */
    background: linear-gradient(135deg, #0070f3, #00a3ff);
    color: white !important;
    border: none;
    border-radius: 30px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 1rem;
    box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);
    z-index: 1;
    overflow: hidden;
  }

  /* 使用伪元素实现平滑的渐变过渡 */
  .submit-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 30px;
    background: linear-gradient(135deg, #6c63ff, #9b8fff);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 112, 243, 0.4);
  }

  /* 悬停时显示渐变背景 */
  .submit-button:hover::after {
    opacity: 1;
  }

  /* 点击效果 */
  .submit-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
    z-index: 1;
    pointer-events: none;
  }

.submit-button:active::before {
  width: 300px;
  height: 300px;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 表单验证样式 */
.form-group input.invalid,
.form-group textarea.invalid {
  border-color: #ff4d4f;
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.form-group input.valid,
.form-group textarea.valid {
  border-color: #34c759;
  background-color: rgba(52, 199, 89, 0.05);
}

/* 字符计数样式 */
.char-count {
  color: var(--text-secondary);
  font-size: 12px;
  text-align: right;
  margin-top: 4px;
}

/* 表单说明样式 */
.form-note {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 10px;
  text-align: left;
  width: 100%;
}

@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
  min-height: 16px;
}

/* 提交状态样式 */
.submit-status {
  margin-top: 15px;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-status.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.submit-status.success {
  background-color: rgba(52, 199, 89, 0.1);
  color: #34c759;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.submit-status.error {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.3);
}

/* 状态图标 */
.success-icon::before {
  content: '✓';
  font-weight: bold;
}

.error-icon::before {
  content: '✗';
  font-weight: bold;
}
</style>
