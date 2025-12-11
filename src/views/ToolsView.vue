<template>
  <div class="tools-container">
    <div class="tools-header">
      <h1>实用工具</h1>
      <p>提供各种实用工具，方便日常使用</p>
    </div>

    <!-- 搜索和分类 -->
    <div class="tools-filters">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="搜索工具..." class="search-input" />
      </div>

      <!-- 分类标签页 -->
      <div class="category-tabs">
        <div
          v-for="category in categories"
          :key="category.id"
          :class="['category-tab', { active: selectedCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 工具卡片网格 -->
    <div class="tools-grid">
      <!-- 工具卡片 -->
      <div
        v-for="tool in filteredTools"
        :key="tool.id"
        :class="['tool-card', { active: selectedToolId === tool.id }]"
        @click="openToolModal(tool.id)"
      >
        <div class="tool-icon">{{ tool.icon }}</div>
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
      </div>
      <!-- 没有找到工具的提示 -->
      <div v-if="filteredTools.length === 0" class="no-tools">
        <div class="no-tools-icon">🔍</div>
        <h3>没有找到匹配的工具</h3>
        <p>请尝试调整搜索词或选择其他分类</p>
      </div>
    </div>

    <!-- 工具模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeToolModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedToolId ? tools.find((tool) => tool.id === selectedToolId)?.name : "工具" }}</h2>
          <button class="modal-close" @click="closeToolModal">✕</button>
        </div>
        <div class="modal-body">
          <!-- URL 转二维码工具 -->
          <div v-if="selectedToolId === 'qr-code'" class="qr-tool">
            <div class="qr-tool-header">
              <p>输入网址，生成可下载的二维码</p>
            </div>

            <div class="qr-tool-body">
              <!-- 左侧：配置选项 -->
              <div class="qr-config-section">
                <!-- 主选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('main')">
                    <h3>主选项</h3>
                    <span class="toggle-icon">{{ groups.main ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.main" class="group-content">
                      <div class="option-group">
                        <label for="url-input">Data</label>
                        <input
                          type="text"
                          id="url-input"
                          v-model="urlInput"
                          placeholder="https://example.com"
                          class="url-input"
                          @input="generateQRCode"
                        />
                      </div>
                      <div class="option-group">
                        <label for="image-upload">图片文件</label>
                        <div class="file-input-wrapper">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            @change="handleImageUpload"
                            class="image-upload"
                          />
                          <button v-if="selectedImage" @click="clearImage" class="clear-btn">清除</button>
                        </div>
                      </div>
                      <div class="option-row">
                        <div class="option-group">
                          <label for="qr-width">Width</label>
                          <input
                            type="number"
                            id="qr-width"
                            v-model.number="qrConfig.width"
                            min="100"
                            max="1000"
                            step="50"
                            @input="generateQRCode"
                          />
                        </div>
                        <div class="option-group">
                          <label for="qr-height">Height</label>
                          <input
                            type="number"
                            id="qr-height"
                            v-model.number="qrConfig.height"
                            min="100"
                            max="1000"
                            step="50"
                            @input="generateQRCode"
                          />
                        </div>
                      </div>
                      <div class="option-group">
                        <label for="qr-margin">Margin</label>
                        <input
                          type="number"
                          id="qr-margin"
                          v-model.number="qrConfig.margin"
                          min="0"
                          max="100"
                          step="1"
                          @input="generateQRCode"
                        />
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 点选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('dots')">
                    <h3>点选项</h3>
                    <span class="toggle-icon">{{ groups.dots ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.dots" class="group-content">
                      <div class="option-group">
                        <label for="dots-style">点样式</label>
                        <custom-select
                          v-model="qrConfig.dotsOptions.type"
                          :options="styleOptions"
                          @update:modelValue="generateQRCode"
                        ></custom-select>
                      </div>
                      <div class="option-group">
                        <label>颜色类型</label>
                        <div class="color-type-options">
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.dotsOptions.colorType"
                              value="single"
                              @change="generateQRCode"
                            />
                            <span>单色</span>
                          </label>
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.dotsOptions.colorType"
                              value="gradient"
                              @change="generateQRCode"
                            />
                            <span>渐变</span>
                          </label>
                        </div>
                      </div>

                      <!-- 单色选项 -->
                      <div v-if="qrConfig.dotsOptions.colorType === 'single'" class="option-group">
                        <label for="dots-color">点颜色</label>
                        <input
                          type="color"
                          id="dots-color"
                          v-model="qrConfig.dotsOptions.color"
                          @input="generateQRCode"
                          class="color-input"
                        />
                      </div>

                      <!-- 渐变选项 -->
                      <div v-else class="gradient-options">
                        <div class="option-group">
                          <label>渐变类型</label>
                          <div class="color-type-options">
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.dotsOptions.gradient.type"
                                value="linear"
                                @change="generateQRCode"
                              />
                              <span>线性</span>
                            </label>
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.dotsOptions.gradient.type"
                                value="radial"
                                @change="generateQRCode"
                              />
                              <span>径向</span>
                            </label>
                          </div>
                        </div>

                        <!-- 线性渐变旋转角度 -->
                        <div v-if="qrConfig.dotsOptions.gradient.type === 'linear'" class="option-group">
                          <label for="dots-gradient-rotation">旋转角度</label>
                          <input
                            type="number"
                            id="dots-gradient-rotation"
                            v-model.number="qrConfig.dotsOptions.gradient.rotation"
                            min="0"
                            max="360"
                            step="15"
                            @input="generateQRCode"
                          />
                        </div>

                        <!-- 渐变颜色 -->
                        <div class="option-group">
                          <label>渐变颜色</label>
                          <div class="gradient-colors">
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.dotsOptions.gradient.colorStops[0].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.dotsOptions.gradient.colorStops[1].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 角方块选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('cornersSquare')">
                    <h3>角方块选项</h3>
                    <span class="toggle-icon">{{ groups.cornersSquare ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.cornersSquare" class="group-content">
                      <div class="option-group">
                        <label for="corners-square-style">角方块样式</label>
                        <custom-select
                          v-model="qrConfig.cornersSquareOptions.type"
                          :options="styleOptions"
                          @update:modelValue="generateQRCode"
                        ></custom-select>
                      </div>
                      <div class="option-group">
                        <label>颜色类型</label>
                        <div class="color-type-options">
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.cornersSquareOptions.colorType"
                              value="single"
                              @change="generateQRCode"
                            />
                            <span>单色</span>
                          </label>
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.cornersSquareOptions.colorType"
                              value="gradient"
                              @change="generateQRCode"
                            />
                            <span>渐变</span>
                          </label>
                        </div>
                      </div>

                      <!-- 单色选项 -->
                      <div v-if="qrConfig.cornersSquareOptions.colorType === 'single'" class="option-group">
                        <label for="corners-square-color">角方块颜色</label>
                        <input
                          type="color"
                          id="corners-square-color"
                          v-model="qrConfig.cornersSquareOptions.color"
                          @input="generateQRCode"
                          class="color-input"
                        />
                      </div>

                      <!-- 渐变选项 -->
                      <div v-else class="gradient-options">
                        <div class="option-group">
                          <label>渐变类型</label>
                          <div class="color-type-options">
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.cornersSquareOptions.gradient.type"
                                value="linear"
                                @change="generateQRCode"
                              />
                              <span>线性</span>
                            </label>
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.cornersSquareOptions.gradient.type"
                                value="radial"
                                @change="generateQRCode"
                              />
                              <span>径向</span>
                            </label>
                          </div>
                        </div>

                        <!-- 线性渐变旋转角度 -->
                        <div v-if="qrConfig.cornersSquareOptions.gradient.type === 'linear'" class="option-group">
                          <label for="corners-square-gradient-rotation">旋转角度</label>
                          <input
                            type="number"
                            id="corners-square-gradient-rotation"
                            v-model.number="qrConfig.cornersSquareOptions.gradient.rotation"
                            min="0"
                            max="360"
                            step="15"
                            @input="generateQRCode"
                          />
                        </div>

                        <!-- 渐变颜色 -->
                        <div class="option-group">
                          <label>渐变颜色</label>
                          <div class="gradient-colors">
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.cornersSquareOptions.gradient.colorStops[0].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.cornersSquareOptions.gradient.colorStops[1].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 角点选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('cornersDot')">
                    <h3>角点选项</h3>
                    <span class="toggle-icon">{{ groups.cornersDot ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.cornersDot" class="group-content">
                      <div class="option-group">
                        <label for="corners-dot-style">角点样式</label>
                        <custom-select
                          v-model="qrConfig.cornersDotOptions.type"
                          :options="cornerDotStyleOptions"
                          @update:modelValue="generateQRCode"
                        ></custom-select>
                      </div>
                      <div class="option-group">
                        <label>颜色类型</label>
                        <div class="color-type-options">
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.cornersDotOptions.colorType"
                              value="single"
                              @change="generateQRCode"
                            />
                            <span>单色</span>
                          </label>
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.cornersDotOptions.colorType"
                              value="gradient"
                              @change="generateQRCode"
                            />
                            <span>渐变</span>
                          </label>
                        </div>
                      </div>

                      <!-- 单色选项 -->
                      <div v-if="qrConfig.cornersDotOptions.colorType === 'single'" class="option-group">
                        <label for="corners-dot-color">角点颜色</label>
                        <input
                          type="color"
                          id="corners-dot-color"
                          v-model="qrConfig.cornersDotOptions.color"
                          @input="generateQRCode"
                          class="color-input"
                        />
                      </div>

                      <!-- 渐变选项 -->
                      <div v-else class="gradient-options">
                        <div class="option-group">
                          <label>渐变类型</label>
                          <div class="color-type-options">
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.cornersDotOptions.gradient.type"
                                value="linear"
                                @change="generateQRCode"
                              />
                              <span>线性</span>
                            </label>
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.cornersDotOptions.gradient.type"
                                value="radial"
                                @change="generateQRCode"
                              />
                              <span>径向</span>
                            </label>
                          </div>
                        </div>

                        <!-- 线性渐变旋转角度 -->
                        <div v-if="qrConfig.cornersDotOptions.gradient.type === 'linear'" class="option-group">
                          <label for="corners-dot-gradient-rotation">旋转角度</label>
                          <input
                            type="number"
                            id="corners-dot-gradient-rotation"
                            v-model.number="qrConfig.cornersDotOptions.gradient.rotation"
                            min="0"
                            max="360"
                            step="15"
                            @input="generateQRCode"
                          />
                        </div>

                        <!-- 渐变颜色 -->
                        <div class="option-group">
                          <label>渐变颜色</label>
                          <div class="gradient-colors">
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.cornersDotOptions.gradient.colorStops[0].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.cornersDotOptions.gradient.colorStops[1].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 背景选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('background')">
                    <h3>背景选项</h3>
                    <span class="toggle-icon">{{ groups.background ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.background" class="group-content">
                      <div class="option-group">
                        <label>颜色类型</label>
                        <div class="color-type-options">
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.backgroundOptions.colorType"
                              value="single"
                              @change="generateQRCode"
                            />
                            <span>单色</span>
                          </label>
                          <label class="radio-label">
                            <input
                              type="radio"
                              v-model="qrConfig.backgroundOptions.colorType"
                              value="gradient"
                              @change="generateQRCode"
                            />
                            <span>渐变</span>
                          </label>
                        </div>
                      </div>

                      <!-- 单色选项 -->
                      <div v-if="qrConfig.backgroundOptions.colorType === 'single'" class="option-group">
                        <label for="background-color">背景颜色</label>
                        <input
                          type="color"
                          id="background-color"
                          v-model="qrConfig.backgroundOptions.color"
                          @input="generateQRCode"
                          class="color-input"
                        />
                      </div>

                      <!-- 渐变选项 -->
                      <div v-else class="gradient-options">
                        <div class="option-group">
                          <label>渐变类型</label>
                          <div class="color-type-options">
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.backgroundOptions.gradient.type"
                                value="linear"
                                @change="generateQRCode"
                              />
                              <span>线性</span>
                            </label>
                            <label class="radio-label">
                              <input
                                type="radio"
                                v-model="qrConfig.backgroundOptions.gradient.type"
                                value="radial"
                                @change="generateQRCode"
                              />
                              <span>径向</span>
                            </label>
                          </div>
                        </div>

                        <!-- 线性渐变旋转角度 -->
                        <div v-if="qrConfig.backgroundOptions.gradient.type === 'linear'" class="option-group">
                          <label for="background-gradient-rotation">旋转角度</label>
                          <input
                            type="number"
                            id="background-gradient-rotation"
                            v-model.number="qrConfig.backgroundOptions.gradient.rotation"
                            min="0"
                            max="360"
                            step="15"
                            @input="generateQRCode"
                          />
                        </div>

                        <!-- 渐变颜色 -->
                        <div class="option-group">
                          <label>渐变颜色</label>
                          <div class="gradient-colors">
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.backgroundOptions.gradient.colorStops[0].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                            <div class="gradient-color-stop">
                              <input
                                type="color"
                                v-model="qrConfig.backgroundOptions.gradient.colorStops[1].color"
                                @input="generateQRCode"
                                class="color-input gradient-color-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 图片选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('image')">
                    <h3>图片选项</h3>
                    <span class="toggle-icon">{{ groups.image ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.image" class="group-content">
                      <div class="option-group checkbox-group">
                        <label class="checkbox-label">
                          <input
                            type="checkbox"
                            v-model="qrConfig.imageOptions.hideBackgroundDots"
                            @change="generateQRCode"
                          />
                          <span>隐藏背景点</span>
                        </label>
                      </div>
                      <div class="option-row">
                        <div class="option-group">
                          <label for="image-size">图片大小</label>
                          <input
                            type="number"
                            id="image-size"
                            v-model.number="qrConfig.imageOptions.imageSize"
                            min="0.1"
                            max="0.8"
                            step="0.1"
                            @input="generateQRCode"
                          />
                        </div>
                        <div class="option-group">
                          <label for="image-margin">图片边距</label>
                          <input
                            type="number"
                            id="image-margin"
                            v-model.number="qrConfig.imageOptions.margin"
                            min="0"
                            max="20"
                            step="1"
                            @input="generateQRCode"
                          />
                          <span>px</span>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- QR选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('qr')">
                    <h3>QR选项</h3>
                    <span class="toggle-icon">{{ groups.qr ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.qr" class="group-content">
                      <div class="option-row">
                        <div class="option-group">
                          <label for="type-number">类型编号</label>
                          <input
                            type="number"
                            id="type-number"
                            v-model.number="qrConfig.qrOptions.typeNumber"
                            min="0"
                            max="40"
                            step="1"
                            @input="generateQRCode"
                          />
                        </div>
                        <div class="option-group">
                          <label for="qr-mode">模式</label>
                          <custom-select
                            v-model="qrConfig.qrOptions.mode"
                            :options="qrModeOptions"
                            @update:modelValue="generateQRCode"
                          ></custom-select>
                        </div>
                      </div>
                      <div class="option-group">
                        <label for="error-correction">纠错级别</label>
                        <custom-select
                          v-model="qrConfig.qrOptions.errorCorrectionLevel"
                          :options="errorCorrectionOptions"
                          @update:modelValue="generateQRCode"
                        ></custom-select>
                      </div>
                    </div>
                  </transition>
                </div>

                <!-- 导出选项 -->
                <div class="qr-options-group">
                  <div class="group-header" @click="toggleGroup('export')">
                    <h3>导出选项</h3>
                    <span class="toggle-icon">{{ groups.export ? "▼" : "▶" }}</span>
                  </div>
                  <transition name="group-collapse">
                    <div v-if="groups.export" class="group-content">
                      <div class="option-group">
                        <label for="download-format">下载格式</label>
                        <custom-select v-model="downloadFormat" :options="downloadFormatOptions"></custom-select>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- 右侧：预览和操作 -->
              <div class="qr-result-section">
                <div class="qr-preview" ref="qrPreview"></div>
                <div class="qr-actions">
                  <div class="download-options">
                    <label for="download-btn">Download</label>
                    <button class="download-btn" @click="downloadQRCode" :disabled="!urlInput">
                      {{ downloadFormat.toUpperCase() }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCodeStyling from "qr-code-styling"
import CustomSelect from "../components/CustomSelect.vue"

export default {
  name: "ToolsView",
  components: {
    CustomSelect,
  },
  data() {
    return {
      // 分类列表
      categories: [
        { id: "all", name: "全部", icon: "🔍" },
        { id: "text", name: "文本工具", icon: "📝" },
        { id: "encoding", name: "编码工具", icon: "🔢" },
        { id: "date", name: "日期工具", icon: "📅" },
        { id: "color", name: "颜色工具", icon: "🎨" },
        { id: "converter", name: "转换工具", icon: "🔄" },
      ],
      // 工具列表
      tools: [
        {
          id: "qr-code",
          name: "URL 转二维码",
          description: "将网址转换为可下载的二维码",
          icon: "📱",
          category: "converter",
        },
      ],
      selectedToolId: "qr-code", // 默认选中URL转二维码工具
      selectedCategory: "all", // 默认显示全部工具
      searchQuery: "", // 搜索查询
      showModal: false, // 模态框显示状态
      // 纠错级别选项
      errorCorrectionOptions: [
        { value: "L", label: "低 (L)" },
        { value: "M", label: "中 (M)" },
        { value: "Q", label: "较高 (Q)" },
        { value: "H", label: "高 (H)" },
      ],
      // 选项组折叠状态
      groups: {
        main: true,
        dots: false,
        cornersSquare: false,
        cornersDot: false,
        background: false,
        image: false,
        qr: false,
        export: false,
      },
      // 下载格式选项
      downloadFormatOptions: [
        { value: "png", label: "PNG" },
        { value: "jpeg", label: "JPEG" },
      ],
      // 样式选项
      styleOptions: [
        { value: "rounded", label: "圆角" },
        { value: "dots", label: "圆点" },
        { value: "classy", label: "优雅" },
        { value: "classy-rounded", label: "优雅圆角" },
        { value: "square", label: "方形" },
        { value: "extra-rounded", label: "超圆角" },
      ],
      // 角点样式选项（包含none选项）
      cornerDotStyleOptions: [
        { value: "none", label: "无" },
        { value: "dot", label: "圆点" },
        { value: "square", label: "方形" },
        { value: "rounded", label: "圆角" },
        { value: "classy", label: "优雅" },
        { value: "classy-rounded", label: "优雅圆角" },
        { value: "extra-rounded", label: "超圆角" },
      ],
      // QR模式选项
      qrModeOptions: [
        { value: "Numeric", label: "数字" },
        { value: "Alphanumeric", label: "字母数字" },
        { value: "Byte", label: "字节" },
        { value: "Kanji", label: "汉字" },
      ],
      // URL转二维码相关配置
      urlInput: "https://example.com", // 默认URL示例
      selectedImage: null,
      downloadFormat: "png",
      // 完整的二维码配置
      qrConfig: {
        width: 300,
        height: 300,
        margin: 0,
        // 点选项
        dotsOptions: {
          color: "#000000",
          type: "extra-rounded",
          colorType: "single", // single or gradient
          gradient: {
            type: "linear", // linear or radial
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#000000" },
              { offset: 1, color: "#333333" },
            ],
          },
        },
        // 角方块选项
        cornersSquareOptions: {
          color: "#000000",
          type: "extra-rounded",
          colorType: "single",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#000000" },
              { offset: 1, color: "#333333" },
            ],
          },
        },
        // 角点选项
        cornersDotOptions: {
          color: "#000000",
          type: "dot",
          colorType: "single",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#000000" },
              { offset: 1, color: "#333333" },
            ],
          },
        },
        // 背景选项
        backgroundOptions: {
          color: "#ffffff",
          colorType: "single",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#ffffff" },
              { offset: 1, color: "#f0f0f0" },
            ],
          },
        },
        // 图片选项
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
        },
        // QR选项
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "Q",
        },
      },
      qrCode: null,
    }
  },
  computed: {
    // 筛选后的工具列表
    filteredTools() {
      let filtered = this.tools

      // 分类筛选
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter((tool) => tool.category === this.selectedCategory)
      }

      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (tool) => tool.name.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query)
        )
      }

      return filtered
    },
  },
  methods: {
    selectTool(toolId) {
      this.selectedToolId = toolId
    },
    // 分类切换
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    // 打开工具模态框
    openToolModal(toolId) {
      this.selectedToolId = toolId
      this.showModal = true
      // 在模态框打开时生成二维码
      setTimeout(() => {
        this.generateQRCode()
      }, 100)
    },
    // 关闭工具模态框
    closeToolModal() {
      this.showModal = false
    },
    // 切换选项组折叠状态
    toggleGroup(groupName) {
      this.groups[groupName] = !this.groups[groupName]
    },
    // 处理图片上传
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedImage = e.target.result
          this.generateQRCode()
        }
        reader.readAsDataURL(file)
      }
    },
    // 清除上传的图片
    clearImage() {
      this.selectedImage = null
      // 清除文件输入
      const fileInput = document.getElementById("image-upload")
      if (fileInput) {
        fileInput.value = ""
      }
      this.generateQRCode()
    },

    // 生成二维码
    generateQRCode() {
      if (!this.urlInput) {
        return
      }

      // 清除之前的二维码
      const preview = this.$refs.qrPreview
      if (!preview) {
        return
      }

      preview.innerHTML = ""

      try {
        // 构建dotsOptions配置
        const dotsOptions = {
          type: this.qrConfig.dotsOptions.type,
          // 默认单色
          color: this.qrConfig.dotsOptions.color,
        }

        if (this.qrConfig.dotsOptions.colorType === "gradient") {
          // 使用qr-code-styling 1.9.2正确的渐变配置：gradient是独立属性
          dotsOptions.gradient = {
            type: this.qrConfig.dotsOptions.gradient.type,
            rotation: this.qrConfig.dotsOptions.gradient.rotation,
            colorStops: this.qrConfig.dotsOptions.gradient.colorStops,
          }
        }

        // 构建cornersSquareOptions配置
        const cornersSquareOptions = {
          type: this.qrConfig.cornersSquareOptions.type,
          color: this.qrConfig.cornersSquareOptions.color,
        }

        if (this.qrConfig.cornersSquareOptions.colorType === "gradient") {
          cornersSquareOptions.gradient = {
            type: this.qrConfig.cornersSquareOptions.gradient.type,
            rotation: this.qrConfig.cornersSquareOptions.gradient.rotation,
            colorStops: this.qrConfig.cornersSquareOptions.gradient.colorStops,
          }
        }

        // 构建cornersDotOptions配置
        const cornersDotOptions = {
          type: this.qrConfig.cornersDotOptions.type,
          color: this.qrConfig.cornersDotOptions.color,
        }

        if (this.qrConfig.cornersDotOptions.colorType === "gradient") {
          cornersDotOptions.gradient = {
            type: this.qrConfig.cornersDotOptions.gradient.type,
            rotation: this.qrConfig.cornersDotOptions.gradient.rotation,
            colorStops: this.qrConfig.cornersDotOptions.gradient.colorStops,
          }
        }

        // 构建backgroundOptions配置
        const backgroundOptions = {
          color: this.qrConfig.backgroundOptions.color,
        }

        if (this.qrConfig.backgroundOptions.colorType === "gradient") {
          backgroundOptions.gradient = {
            type: this.qrConfig.backgroundOptions.gradient.type,
            rotation: this.qrConfig.backgroundOptions.gradient.rotation,
            colorStops: this.qrConfig.backgroundOptions.gradient.colorStops,
          }
        }

        // 创建新的二维码实例
        this.qrCode = new QRCodeStyling({
          width: this.qrConfig.width,
          height: this.qrConfig.height,
          type: "svg",
          data: this.urlInput,
          image: this.selectedImage,
          margin: this.qrConfig.margin,
          qrOptions: this.qrConfig.qrOptions,
          imageOptions: this.qrConfig.imageOptions,
          dotsOptions,
          backgroundOptions,
          cornersSquareOptions,
          cornersDotOptions,
        })

        // 渲染二维码
        this.qrCode.append(preview)
      } catch (error) {
        console.error("Error generating QR code:", error)
        // 显示错误信息给用户
        preview.innerHTML = `<p style="color: red;">生成二维码失败: ${error.message}</p>`
      }
    },
    // 下载二维码
    downloadQRCode() {
      if (this.qrCode) {
        this.qrCode.download({
          name: "qrcode",
          extension: this.downloadFormat,
        })
      }
    },
  },
  mounted() {
    // 初始生成二维码（使用默认URL）
    setTimeout(() => {
      this.generateQRCode()
    }, 100)
  },
}
</script>

<style scoped>
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 10;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px var(--shadow-color);
}

.tools-header {
  text-align: center;
  margin-bottom: 3rem;
}

.tools-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.tools-header p {
  font-size: 1.2rem;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  max-width: 600px;
  margin: 0 auto;
}

/* 响应式页面布局 */
@media (max-width: 768px) {
  .tools-container {
    padding: 1.5rem;
    margin: 1rem;
  }

  .tools-header {
    margin-bottom: 2rem;
  }

  .tools-header h1 {
    font-size: 2rem;
  }

  .tools-header p {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .tools-container {
    padding: 1.2rem;
    margin: 0.5rem;
  }

  .tools-header {
    margin-bottom: 1.5rem;
  }

  .tools-header h1 {
    font-size: 1.8rem;
  }

  .tools-header p {
    font-size: 1rem;
  }
}

/* 工具卡片网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.tool-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 卡片装饰效果 */
.tool-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tool-card:hover::before {
  transform: scaleX(1);
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--accent-color);
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--hover-bg) 100%);
}

.tool-card.active {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--hover-bg) 100%);
  box-shadow: 0 0 0 2px var(--accent-color), 0 12px 32px rgba(0, 0, 0, 0.12);
}

.tool-card.active::before {
  transform: scaleX(1);
}

.tool-icon {
  font-size: 4rem;
  margin-bottom: 1.2rem;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.tool-card:hover .tool-icon {
  transform: scale(1.1);
}

.tool-card h3 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  font-weight: 600;
  transition: color 0.3s ease;
}

.tool-card p {
  color: var(--text-primary) !important;
  opacity: 0.85 !important;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  max-width: 240px;
  transition: opacity 0.3s ease;
}

.tool-card:hover p {
  opacity: 0.95 !important;
}

/* 响应式卡片调整 */
@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .tool-card {
    padding: 1.5rem 1rem;
    min-height: 200px;
  }

  .tool-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .tool-card h3 {
    font-size: 1.25rem;
  }

  .tool-card p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .tool-card {
    min-height: 180px;
  }
}

/* 搜索栏样式 */
.search-bar {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

.search-input::placeholder {
  color: var(--text-secondary) !important;
  opacity: 0.8 !important;
}

/* 分类标签页样式 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.category-tab:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.category-tab.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white !important;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.category-tab.active * {
  color: white !important;
  opacity: 1 !important;
}

.category-icon {
  font-size: 1.2rem;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 500;
}

/* 没有找到工具的提示 */
.no-tools {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.no-tools-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-tools h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 1 !important;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8); /* 遮罩层背景，用于遮挡背景内容 */
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  transition: opacity 0.3s ease;
  padding-top: 60px; /* 调整为更靠近navbar */
}

/* 亮主题下的模态框遮罩层样式 */
.light-mode .modal-overlay {
  background: rgba(255, 255, 255, 0.8); /* 亮主题下使用浅色半透明背景 */
  backdrop-filter: blur(5px);
}

/* 确保亮主题下的模态框内容背景色正确 */
.light-mode .modal-content {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* 确保亮主题下的模态框头部背景色正确 */
.light-mode .modal-header {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* 确保亮主题下的模态框内容区域背景色正确 */
.light-mode .modal-body {
  background: var(--card-bg);
  color: var(--text-primary);
}

/* 确保亮主题下的工具卡片背景色正确 */
.light-mode .tool-card {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* 确保亮主题下的选项组背景色正确 */
.light-mode .qr-options-group {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* 确保亮主题下的分组内容背景色正确 */
.light-mode .group-content {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.modal-content {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  max-width: 1000px;
  width: 100%;
  max-height: calc(100vh - 80px); /* 调整为与padding-top匹配 */
  overflow-y: auto;
  box-shadow: 0 10px 40px var(--shadow-color);
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: scale(0.95);
  opacity: 0;
}

.modal-overlay:has(.modal-content) .modal-content {
  transform: scale(1);
  opacity: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h2 {
  font-size: 1.8rem;
  margin: 0;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: var(--hover-bg);
  color: var(--accent-color);
}

.modal-body {
  padding: 2rem;
  background: var(--card-bg);
}

/* 响应式模态框设计 */
@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-close {
    font-size: 1.8rem;
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 0.8rem 1.2rem;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 1.2rem;
  }
}

/* URL 转二维码工具样式 */
.qr-tool {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-color);
}

/* 确保QR工具内容区域完全覆盖模态框背景 */
.qr-tool-header,
.qr-tool-body {
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
}

/* 修复亮主题下的背景色问题 */
.light-mode .qr-tool,
.light-mode .qr-tool-header,
.light-mode .qr-tool-body {
  background: var(--card-bg);
  color: var(--text-primary);
}

/* 修复亮主题下的模态框内容背景色 */
.light-mode .modal-content,
.light-mode .modal-header,
.light-mode .modal-body {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* 修复亮主题下的选项组背景色 */
.light-mode .qr-options-group,
.light-mode .group-content {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.qr-tool-header {
  text-align: center;
  margin-bottom: 2rem;
}

.qr-tool-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

.qr-tool-header p {
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
}

.qr-tool-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: var(--card-bg);
}

@media (min-width: 768px) {
  .qr-tool-body {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* 配置选项部分 */
.qr-config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: auto;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 1rem;
  box-sizing: border-box;
  background: var(--card-bg);
}

/* 选项组 */
.qr-options-group {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 2px 8px var(--shadow-color);
  margin-bottom: 1rem;
}

/* 分组标题 */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--accent-color);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.group-header:hover {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.group-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: white !important;
  opacity: 1 !important;
  font-weight: 600 !important;
}

.toggle-icon {
  font-size: 1rem;
  color: white !important;
  opacity: 1 !important;
  transition: transform 0.3s ease;
  font-weight: bold;
}

/* 分组内容 - 确保折叠时完全隐藏，展开时完全显示 */
.group-content {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--card-bg);
  display: block;
  overflow: visible;
  box-sizing: border-box;
  max-height: 500px;
  height: auto;
  opacity: 1;
  transition: all 0.3s ease;
}

/* 选项组折叠展开过渡动画 */
.group-collapse-enter-active,
.group-collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.group-collapse-enter-from,
.group-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 1.5rem;
  border-top-width: 0;
}

.group-collapse-enter-to,
.group-collapse-leave-from {
  opacity: 1;
  max-height: 500px;
  padding: 1.5rem;
  border-top-width: 1px;
}

/* 选项组内的选项 */
.option-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 1 !important;
}

/* 确保选项组内容可见 */
.option-group * {
  opacity: 1 !important;
  color: var(--text-primary) !important;
}

/* 渐变选项样式 */
.gradient-options {
  margin-top: 1rem;
}

.gradient-colors {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.gradient-color-stop {
  flex: 1;
}

.gradient-color-input {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--card-bg);
  cursor: pointer;
}

.gradient-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.gradient-color-input::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

/* 工具主体布局调整 */
.qr-tool-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: auto;
  max-height: none;
}

@media (min-width: 992px) {
  .qr-tool-body {
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
  }
}

/* 右侧结果区域调整 */
.qr-result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-width: 0; /* 确保flex子元素能够正确收缩 */
  padding: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--shadow-color);
  min-height: 400px;
}

.qr-preview {
  width: 100%;
  max-width: 350px;
  height: auto;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.08);
}

.qr-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.download-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  flex-direction: column;
}

.download-btn {
  padding: 0.8rem 2rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  width: 100%;
  max-width: 250px;
}

/* 响应式二维码工具调整 */
@media (max-width: 992px) {
  .qr-tool-body {
    flex-direction: column;
  }

  .qr-result-section {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .qr-tool-header h2 {
    font-size: 1.8rem;
  }

  .qr-result-section {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .qr-preview {
    max-width: 300px;
    min-height: 250px;
    padding: 0.8rem;
  }

  .qr-config-section {
    padding-right: 0;
  }

  .group-header {
    padding: 0.8rem 1.2rem;
  }

  .group-header h3 {
    font-size: 1rem;
  }

  .group-content {
    padding: 1.2rem;
  }
}

@media (max-width: 480px) {
  .qr-tool-header {
    margin-bottom: 1.5rem;
  }

  .qr-tool-header h2 {
    font-size: 1.5rem;
  }

  .qr-result-section {
    padding: 1.2rem;
    gap: 1.2rem;
  }

  .qr-preview {
    max-width: 250px;
    min-height: 200px;
    padding: 0.5rem;
  }

  .download-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
  }

  .group-header {
    padding: 0.7rem 1rem;
  }

  .group-content {
    padding: 1rem;
  }
}

/* 确保group-content在折叠时完全隐藏 */
.group-content {
  border-top: 1px solid var(--border-color);
  background: var(--card-bg);
}

/* 修复可能的样式冲突 */
.qr-options-group {
  overflow: visible;
}

.option-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-row .option-group {
  flex: 1;
  margin-bottom: 0;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-group label {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

/* 输入框样式 */
.url-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.url-input:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

.url-input::placeholder {
  color: var(--text-secondary) !important;
  opacity: 0.8 !important;
}

/* 数字输入框 */
.option-group input[type="number"] {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.option-group input[type="number"]:focus {
  outline: none;
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

/* 滑块样式 */
.option-group input[type="range"] {
  width: 100%;
  accent-color: var(--accent-color);
}

/* 颜色选择器 */
.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

/* 单选按钮样式 */
.color-type-options {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 400 !important;
}

.radio-label input[type="radio"] {
  accent-color: var(--accent-color);
}

.radio-label span {
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

/* 复选框样式 */
.checkbox-group {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 400 !important;
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--accent-color);
}

.checkbox-label span {
  color: var(--text-primary) !important;
  opacity: 1 !important;
}

/* 图片上传样式 */
.file-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.image-upload {
  padding: 0.75rem 1rem;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  opacity: 1 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.image-upload:hover {
  border-color: var(--accent-color);
  background: var(--hover-bg) !important;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1 !important;
}

.clear-btn:hover {
  background: var(--accent-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 滚动条样式 */
.qr-config-section::-webkit-scrollbar {
  width: 6px;
}

.qr-config-section::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 3px;
}

.qr-config-section::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 3px;
}

.qr-config-section::-webkit-scrollbar-thumb:hover {
  background: var(--text-primary);
}

/* 工具未选择提示 */
.tool-placeholder {
  text-align: center;
  color: var(--text-primary) !important;
  opacity: 0.9 !important;
  padding: 4rem 2rem;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.tool-placeholder h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 1 !important;
}

.qr-actions {
  display: flex;
  gap: 1rem;
  flex-direction: column;
  align-items: center;
}

.download-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.download-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1 !important;
  min-width: 100px;
}

.download-btn:hover:not(:disabled) {
  background: var(--accent-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.download-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed;
  transform: none;
}
</style>
