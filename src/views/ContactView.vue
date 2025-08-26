<template>
  <div class="contact">
    <h1>联系方式</h1>
    <div class="contact-content">
      <p>欢迎通过以下方式联系我，我会尽快回复您的消息：</p>
      <ul class="contact-list">
        <li class="contact-item">
          <div class="contact-icon">📧</div>
          <div class="contact-info">
            <h3>邮箱</h3>
            <p>wxy5731057@vip.qq.com</p>
          </div>
        </li>
        <li class="contact-item">
          <div class="contact-icon">💻</div>
          <div class="contact-info">
            <h3>GitHub</h3>
            <p>https://github.com/WestonWu</p>
          </div>
        </li>
        <li class="contact-item">
          <div class="contact-icon">🔗</div>
          <div class="contact-info">
            <h3>QQ</h3>
            <p>124191808</p>
          </div>
        </li>
      </ul>

      <div class="contact-form">
        <h2>发送消息</h2>
        <form @submit="handleSubmit">
          <div class="form-group">
            <label for="name">姓名</label>
            <input 
              type="text" 
              id="name" 
              v-model="name" 
              placeholder="请输入您的姓名" 
              :class="{ 'invalid': errors.name }"
              @input="clearError('name')"
            />
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="请输入您的邮箱" 
              :class="{ 'invalid': errors.email }"
              @input="clearError('email')"
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>
          <div class="form-group">
            <label for="message">消息</label>
            <textarea 
              id="message" 
              rows="5" 
              v-model="message" 
              placeholder="请输入您的消息" 
              :class="{ 'invalid': errors.message }"
              @input="clearError('message')"
            ></textarea>
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
}

// 表单提交处理函数
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 重置错误信息
  errors.value = {}
  submitStatus.value = ""

  // 表单验证
  let isValid = true
  
  if (!name.value) {
    errors.value.name = "请输入您的姓名"
    isValid = false
  }
  
  if (!email.value) {
    errors.value.email = "请输入您的邮箱"
    isValid = false
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
    errors.value.email = "请输入有效的邮箱地址"
    isValid = false
  }
  
  if (!message.value) {
    errors.value.message = "请输入您的消息"
    isValid = false
  }
  
  if (!isValid) {
    submitStatus.value = "请修正表单中的错误"
    submitStatusType.value = "error"
    
    // 滚动到第一个错误字段
    const firstErrorField = document.querySelector('.form-group input.invalid, .form-group textarea.invalid')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstErrorField.focus()
    }
    
    return
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

.contact-icon {
  font-size: 1.8rem;
  margin-right: 1rem;
  background: white;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

/* 表单验证错误样式 */
.form-group input.invalid,
.form-group textarea.invalid {
  border-color: #ff4d4f;
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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
