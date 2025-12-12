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

          <!-- 文本转大小写工具 -->
          <div v-else-if="selectedToolId === 'text-case'" class="text-case-tool">
            <div class="tool-header">
              <p>将文本转换为大写、小写或首字母大写</p>
            </div>

            <div class="tool-body">
              <!-- 左侧：输入区域 -->
              <div class="text-input-section">
                <div class="option-group">
                  <label for="text-case-input">输入文本</label>
                  <textarea
                    id="text-case-input"
                    v-model="textCaseInput"
                    placeholder="请输入要转换的文本..."
                    class="text-input"
                    @input="convertTextCase"
                  ></textarea>
                </div>

                <div class="option-group">
                  <label>转换选项</label>
                  <div class="conversion-options">
                    <label class="radio-label">
                      <input type="radio" v-model="textCaseOption" value="uppercase" @change="convertTextCase" />
                      <span>大写</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="textCaseOption" value="lowercase" @change="convertTextCase" />
                      <span>小写</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="textCaseOption" value="capitalize" @change="convertTextCase" />
                      <span>首字母大写</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- 右侧：输出区域 -->
              <div class="text-output-section">
                <div class="option-group">
                  <div class="output-header">
                    <label>转换结果</label>
                    <button class="copy-btn" @click="copyTextCaseOutput" :disabled="!textCaseOutput">复制</button>
                  </div>
                  <textarea
                    v-model="textCaseOutput"
                    placeholder="转换结果将显示在这里..."
                    class="text-output"
                    readonly
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- 字数统计器工具 -->
          <div v-else-if="selectedToolId === 'word-counter'" class="word-counter-tool">
            <div class="tool-header">
              <p>统计文本的字数、字符数、单词数等信息</p>
            </div>

            <div class="tool-body">
              <!-- 左侧：输入区域 -->
              <div class="text-input-section">
                <div class="option-group">
                  <label for="word-counter-input">输入文本</label>
                  <textarea
                    id="word-counter-input"
                    v-model="wordCounterInput"
                    placeholder="请输入要统计的文本..."
                    class="text-input"
                    @input="countWords"
                  ></textarea>
                </div>
              </div>

              <!-- 右侧：统计结果区域 -->
              <div class="word-count-result-section">
                <div class="count-results">
                  <div class="count-item">
                    <div class="count-label">字符数（含空格）</div>
                    <div class="count-value">{{ wordCounterResults.charactersWithSpaces }}</div>
                  </div>
                  <div class="count-item">
                    <div class="count-label">字符数（不含空格）</div>
                    <div class="count-value">{{ wordCounterResults.charactersWithoutSpaces }}</div>
                  </div>
                  <div class="count-item">
                    <div class="count-label">单词数</div>
                    <div class="count-value">{{ wordCounterResults.words }}</div>
                  </div>
                  <div class="count-item">
                    <div class="count-label">行数</div>
                    <div class="count-value">{{ wordCounterResults.lines }}</div>
                  </div>
                  <div class="count-item">
                    <div class="count-label">段落数</div>
                    <div class="count-value">{{ wordCounterResults.paragraphs }}</div>
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
        {
          id: "text-case",
          name: "文本转大小写",
          description: "将文本转换为大写、小写或首字母大写",
          icon: "🔤",
          category: "text",
        },
        {
          id: "word-counter",
          name: "字数统计器",
          description: "统计文本的字数、字符数、单词数等信息",
          icon: "📊",
          category: "text",
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
      // 文本转大小写相关配置
      textCaseInput: "", // 输入文本
      textCaseOutput: "", // 输出文本
      textCaseOption: "uppercase", // 转换选项：uppercase, lowercase, capitalize
      // 字数统计器相关配置
      wordCounterInput: "", // 输入文本
      wordCounterResults: {
        charactersWithSpaces: 0, // 字符数（含空格）
        charactersWithoutSpaces: 0, // 字符数（不含空格）
        words: 0, // 单词数
        lines: 0, // 行数
        paragraphs: 0, // 段落数
      },
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
    // 文本转大小写功能
    convertTextCase() {
      if (!this.textCaseInput) {
        this.textCaseOutput = ""
        return
      }

      switch (this.textCaseOption) {
        case "uppercase":
          this.textCaseOutput = this.textCaseInput.toUpperCase()
          break
        case "lowercase":
          this.textCaseOutput = this.textCaseInput.toLowerCase()
          break
        case "capitalize":
          this.textCaseOutput = this.textCaseInput
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
          break
        default:
          this.textCaseOutput = this.textCaseInput
      }
    },
    // 复制转换后的文本
    copyTextCaseOutput() {
      navigator.clipboard
        .writeText(this.textCaseOutput)
        .then(() => {
          // 可以添加复制成功的提示
          console.log("文本已复制到剪贴板")
        })
        .catch((err) => {
          console.error("复制失败:", err)
        })
    },
    // 字数统计功能
    countWords() {
      const text = this.wordCounterInput

      // 字符数（含空格）
      const charactersWithSpaces = text.length

      // 字符数（不含空格）
      const charactersWithoutSpaces = text.replace(/\s/g, "").length

      // 单词数：按空格分割，过滤空字符串
      const words = text.trim() ? text.trim().split(/\s+/).length : 0

      // 行数：按换行符分割，过滤空行
      const lines = text ? text.split(/\r?\n/).filter((line) => line.trim() !== "").length : 0

      // 段落数：按两个或更多换行符分割，过滤空段落
      const paragraphs = text ? text.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim() !== "").length : 0

      this.wordCounterResults = {
        charactersWithSpaces,
        charactersWithoutSpaces,
        words,
        lines,
        paragraphs,
      }
    },
  },
}
</script>

<style scoped>
/* 工具容器 */
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 工具头部 */
.tools-header {
  text-align: center;
  margin-bottom: 30px;
}

.tools-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.tools-header p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* 搜索和分类 */
.tools-filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

/* 分类标签页 */
.category-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.category-tab:hover {
  background-color: var(--bg-secondary);
  transform: translateY(-2px);
}

.category-tab.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 工具卡片网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* 工具卡片 */
.tool-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.tool-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.tool-card h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.tool-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

/* 没有找到工具的提示 */
.no-tools {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.no-tools-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-tools h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.no-tools p {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.modal-body {
  padding: 24px;
}

/* 二维码工具样式 */
.qr-tool {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qr-tool-header {
  text-align: center;
  margin-bottom: 10px;
}

.qr-tool-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* 配置部分 */
.qr-config-section {
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  max-height: 600px;
  overflow-y: auto;
}

.qr-options-group {
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-primary);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.group-header:hover {
  background-color: var(--bg-secondary);
}

.group-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.toggle-icon {
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.group-content {
  padding: 16px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

/* 选项组 */
.option-group {
  margin-bottom: 16px;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.option-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 输入样式 */
input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

/* 颜色类型选项 */
.color-type-options {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 颜色输入 */
.color-input {
  width: 100%;
  height: 40px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

/* 渐变颜色 */
.gradient-colors {
  display: flex;
  gap: 8px;
}

.gradient-color-stop {
  flex: 1;
}

/* 预览和操作 */
.qr-result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-preview img {
  max-width: 100%;
  max-height: 100%;
}

.qr-actions {
  display: flex;
  gap: 12px;
}

.download-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-btn {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.download-btn:hover:not(:disabled) {
  background-color: #1a73e8;
  transform: translateY(-2px);
}

.download-btn:disabled {
  background-color: var(--text-disabled);
  cursor: not-allowed;
}

/* 文本转大小写工具样式 */
.text-case-tool {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-case-tool .tool-header {
  text-align: center;
  margin-bottom: 10px;
}

.text-case-tool .tool-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.text-input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-input {
  width: 100%;
  height: 300px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
}

.text-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.conversion-options {
  display: flex;
  gap: 16px;
}

.text-output-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-btn {
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.copy-btn:hover:not(:disabled) {
  background-color: #1a73e8;
}

.copy-btn:disabled {
  background-color: var(--text-disabled);
  cursor: not-allowed;
}

.text-output {
  width: 100%;
  height: 300px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
}

/* 字数统计器工具样式 */
.word-counter-tool {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.word-counter-tool .tool-header {
  text-align: center;
  margin-bottom: 10px;
}

.word-counter-tool .tool-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.word-count-result-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.count-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
}

.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease;
}

.count-item:hover {
  transform: translateY(-2px);
}

.count-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-align: center;
}

.count-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

/* 工具卡片和模态框的响应式设计 */
@media (max-width: 768px) {
  .qr-tool-body {
    grid-template-columns: 1fr;
  }

  .text-case-tool .tool-body {
    grid-template-columns: 1fr;
  }

  .word-counter-tool .tool-body {
    grid-template-columns: 1fr;
  }

  .option-row {
    grid-template-columns: 1fr;
  }

  .conversion-options {
    flex-direction: column;
    gap: 8px;
  }

  .count-results {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .tools-header h1 {
    font-size: 2rem;
  }

  .category-tabs {
    gap: 8px;
  }

  .category-tab {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-content {
    width: 95%;
    padding: 0;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 16px;
  }

  .count-results {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
.group-collapse-enter-active,
.group-collapse-leave-active {
  transition: all 0.3s ease;
}

.group-collapse-enter-from,
.group-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  padding-top: 0;
  padding-bottom: 0;
}

/* 明亮主题适配 */
.light-mode .modal-overlay {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}
</style>