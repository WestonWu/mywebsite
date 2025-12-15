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
        @mouseenter="preloadToolComponent(tool.id)"
      >
        <div class="tool-header">
          <div class="tool-icon">{{ tool.icon }}</div>
          <button
            class="favorite-btn"
            :class="{ active: isFavorite(tool.id) }"
            @click.stop="toggleFavorite(tool.id)"
            :title="isFavorite(tool.id) ? '取消收藏' : '添加收藏'"
          >
            ⭐
          </button>
        </div>
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
          <div class="modal-actions">
            <button class="help-btn" @click="openToolHelp(selectedToolId)" title="工具帮助">?</button>
            <button class="modal-close" @click="closeToolModal" title="关闭">✕</button>
          </div>
        </div>
        <div class="modal-body">
          <!-- 动态工具组件 -->
          <component :is="currentToolComponent" v-if="currentToolComponent"></component>
          <!-- 加载状态 -->
          <div v-else class="tool-loading">
            <div class="loading-spinner"></div>
            <p>工具加载中...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助模态框 -->
    <HelpModal
      v-model:visible="helpModalVisible"
      :title="currentHelpContent.title"
      :description="currentHelpContent.description"
      :usage-steps="currentHelpContent.usageSteps"
      :shortcuts="currentHelpContent.shortcuts"
      :tips="currentHelpContent.tips"
    />
  </div>
</template>

<script>
import { defineAsyncComponent, onMounted, ref, computed, shallowRef } from "vue"
import CustomSelect from "../components/CustomSelect.vue"
import HelpModal from "../components/HelpModal.vue"
import { useToolFavorites } from "../composables/useToolFavorites"

export default {
  name: "ToolsView",
  components: {
    CustomSelect,
    HelpModal,
  },
  setup() {
    // 定义异步组件映射（在setup中定义，避免被转换为响应式对象）
    const toolComponents = {
      "qr-code": defineAsyncComponent(() => import("../components/tools/ToolQrCode.vue")),
      "text-case": defineAsyncComponent(() => import("../components/tools/ToolTextCase.vue")),
      "word-counter": defineAsyncComponent(() => import("../components/tools/ToolWordCounter.vue")),
      base64: defineAsyncComponent(() => import("../components/tools/ToolBase64.vue")),
      "url-encode": defineAsyncComponent(() => import("../components/tools/ToolUrlEncode.vue")),
      timestamp: defineAsyncComponent(() => import("../components/tools/ToolTimestamp.vue")),
      countdown: defineAsyncComponent(() => import("../components/tools/ToolCountdown.vue")),
      "color-converter": defineAsyncComponent(() => import("../components/tools/ToolColorConverter.vue")),
      "color-gradient": defineAsyncComponent(() => import("../components/tools/ToolColorGradient.vue")),
      "unit-converter": defineAsyncComponent(() => import("../components/tools/ToolUnitConverter.vue")),
      // 天气工具组件
      "weather-current": defineAsyncComponent(() => import("../components/tools/ToolWeatherCurrent.vue")),
      "weather-forecast": defineAsyncComponent(() => import("../components/tools/ToolWeatherForecast.vue")),
      "sunrise-sunset": defineAsyncComponent(() => import("../components/tools/ToolSunriseSunset.vue")),
      "air-quality": defineAsyncComponent(() => import("../components/tools/ToolAirQuality.vue")),
      "uv-index": defineAsyncComponent(() => import("../components/tools/ToolUVIndex.vue")),
      "feels-like": defineAsyncComponent(() => import("../components/tools/ToolFeelsLike.vue")),
      "precipitation-conversion": defineAsyncComponent(() =>
        import("../components/tools/ToolPrecipitationConversion.vue")
      ),
    }

    const { getFavorites, addFavorite, removeFavorite, getRecentUsage, addToRecent } = useToolFavorites()

    // 创建响应式收藏列表
    const favorites = ref(getFavorites())

    // 响应式的isFavorite方法
    const isFavorite = (toolId) => {
      return favorites.value.includes(toolId)
    }

    // 响应式的toggleFavorite方法
    const toggleFavorite = (toolId) => {
      const wasFavorite = favorites.value.includes(toolId)

      if (wasFavorite) {
        // 移除收藏
        favorites.value = favorites.value.filter((id) => id !== toolId)
        removeFavorite(toolId)
        return false
      } else {
        // 添加收藏
        favorites.value.push(toolId)
        addFavorite(toolId)
        return true
      }
    }

    // 使用shallowRef避免将组件对象转换为响应式对象
    const preloadedComponents = shallowRef({})

    return {
      toolComponents,
      favorites,
      isFavorite,
      toggleFavorite,
      getRecentUsage,
      addToRecent,
      preloadedComponents,
    }
  },
  data() {
    return {
      // 分类列表
      categories: [
        { id: "all", name: "全部", icon: "🔍" },
        { id: "recent", name: "最近使用", icon: "⏰" },
        { id: "favorites", name: "我的收藏", icon: "⭐" },
        { id: "text", name: "文本工具", icon: "📝" },
        { id: "encoding", name: "编码工具", icon: "🔢" },
        { id: "date", name: "日期工具", icon: "📅" },
        { id: "color", name: "颜色工具", icon: "🎨" },
        { id: "converter", name: "转换工具", icon: "🔄" },
        { id: "weather", name: "天气工具", icon: "🌤️" },
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
        {
          id: "base64",
          name: "Base64编码/解码",
          description: "Base64编码和解码工具",
          icon: "🔢",
          category: "encoding",
        },
        {
          id: "url-encode",
          name: "URL编码/解码",
          description: "URL编码和解码工具",
          icon: "🔗",
          category: "encoding",
        },
        {
          id: "timestamp",
          name: "时间戳转换",
          description: "时间戳与日期时间的相互转换",
          icon: "⏰",
          category: "date",
        },
        {
          id: "countdown",
          name: "倒计时生成器",
          description: "生成指定日期的倒计时",
          icon: "⏳",
          category: "date",
        },
        {
          id: "color-converter",
          name: "RGB/Hex颜色转换",
          description: "RGB与Hex颜色值之间的相互转换",
          icon: "🎨",
          category: "color",
        },
        {
          id: "color-gradient",
          name: "颜色渐变生成",
          description: "生成CSS和SVG渐变代码",
          icon: "🌈",
          category: "color",
        },
        {
          id: "unit-converter",
          name: "单位转换",
          description: "支持长度、重量、温度等多种单位转换",
          icon: "📏",
          category: "converter",
        },
        // 天气工具
        {
          id: "weather-current",
          name: "实时天气查询",
          description: "查询全球城市实时天气，显示温度、湿度、风速等数据",
          icon: "🌡️",
          category: "weather",
        },
        {
          id: "weather-forecast",
          name: "天气预报",
          description: "查看未来7天天气预报和天气趋势",
          icon: "📅",
          category: "weather",
        },
        {
          id: "sunrise-sunset",
          name: "日出日落时间",
          description: "查询全球各地日出日落和日照时长",
          icon: "🌅",
          category: "weather",
        },
        {
          id: "air-quality",
          name: "空气质量查询",
          description: "查看城市空气质量指数和污染物浓度",
          icon: "💨",
          category: "weather",
        },
        {
          id: "uv-index",
          name: "紫外线指数",
          description: "查询实时紫外线强度和防晒建议",
          icon: "☀️",
          category: "weather",
        },
        {
          id: "feels-like",
          name: "体感温度计算",
          description: "根据温度、湿度、风速计算体感温度",
          icon: "😓",
          category: "weather",
        },
        {
          id: "precipitation-conversion",
          name: "降水量转换",
          description: "毫米与英寸降水量单位转换",
          icon: "💧",
          category: "weather",
        },
      ],
      selectedToolId: "qr-code", // 默认选中URL转二维码工具
      selectedCategory: "all", // 默认显示全部工具
      searchQuery: "", // 搜索查询
      showModal: false, // 模态框显示状态
      // 帮助模态框相关
      helpModalVisible: false,
      currentHelpContent: {
        title: "",
        description: "",
        usageSteps: [],
        shortcuts: [],
        tips: [],
      },
      // 工具帮助内容
      toolHelpContents: {
        "qr-code": {
          title: "URL 转二维码工具帮助",
          description: "将网址转换为可下载的二维码图片，支持自定义尺寸、颜色和边距等参数。",
          usageSteps: [
            "在输入框中输入或粘贴要转换的URL地址",
            "根据需要调整二维码的尺寸、颜色和边距等参数",
            "点击生成按钮生成二维码",
            "点击下载按钮保存二维码图片到本地",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速生成二维码" },
            { key: "Ctrl + D", description: "下载当前二维码" },
          ],
          tips: [
            "生成的二维码支持多种格式下载，包括PNG、JPEG和SVG",
            "可以通过URL参数分享当前的二维码配置",
            "较大尺寸的二维码可能需要更长的生成时间",
          ],
        },
        "text-case": {
          title: "文本转大小写工具帮助",
          description: "将文本转换为大写、小写或首字母大写等不同格式。",
          usageSteps: [
            "在左侧输入框中输入或粘贴要转换的文本",
            "选择要转换的格式（大写、小写、首字母大写等）",
            "转换结果将自动显示在右侧输出框中",
            "可以点击复制按钮复制转换结果",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速转换文本" },
            { key: "Ctrl + C", description: "复制转换结果" },
          ],
          tips: ["支持批量转换大量文本", "可以保存转换历史记录", "支持多种文本格式转换"],
        },
        "word-counter": {
          title: "字数统计器工具帮助",
          description: "统计文本的字数、字符数、单词数等信息。",
          usageSteps: [
            "在输入框中输入或粘贴要统计的文本",
            "系统将自动统计文本的各项指标",
            "可以查看详细的统计结果，包括字数、字符数、单词数等",
            "可以点击复制按钮复制统计结果",
          ],
          shortcuts: [
            { key: "Ctrl + V", description: "粘贴文本并统计" },
            { key: "Ctrl + C", description: "复制统计结果" },
          ],
          tips: ["支持中英文混合文本统计", "实时统计，无需手动刷新", "可以清除统计记录重新开始"],
        },
        base64: {
          title: "Base64编码/解码工具帮助",
          description: "对文本或文件进行Base64编码和解码操作。",
          usageSteps: [
            "选择操作类型：编码或解码",
            "在输入框中输入或粘贴要处理的文本，或上传文件",
            "处理结果将自动显示在输出框中",
            "可以点击复制按钮复制结果，或点击下载按钮保存文件",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速编码/解码" },
            { key: "Ctrl + C", description: "复制处理结果" },
          ],
          tips: ["支持多种文件格式的Base64编码", "解码结果可以预览", "可以批量处理多个文件"],
        },
        "url-encode": {
          title: "URL编码/解码工具帮助",
          description: "对URL进行编码和解码操作，确保URL的正确性和安全性。",
          usageSteps: [
            "选择操作类型：编码或解码",
            "在输入框中输入或粘贴要处理的URL",
            "处理结果将自动显示在输出框中",
            "可以点击复制按钮复制结果",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速编码/解码" },
            { key: "Ctrl + C", description: "复制处理结果" },
          ],
          tips: ["支持完整URL和URL参数的编码", "解码结果可以直接使用", "可以批量处理多个URL"],
        },
        timestamp: {
          title: "时间戳转换工具帮助",
          description: "在时间戳与人类可读日期时间之间进行转换。",
          usageSteps: [
            "选择转换类型：时间戳转日期或日期转时间戳",
            "输入要转换的时间戳或选择日期时间",
            "转换结果将自动显示",
            "可以点击复制按钮复制结果",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速转换" },
            { key: "Ctrl + C", description: "复制转换结果" },
          ],
          tips: ["支持多种时间戳格式", "可以直接使用当前时间", "支持批量转换多个时间戳"],
        },
        countdown: {
          title: "倒计时生成器工具帮助",
          description: "生成指定日期的倒计时，支持多种样式和格式。",
          usageSteps: [
            "选择目标日期和时间",
            "根据需要调整倒计时的样式和格式",
            "生成的倒计时将实时显示",
            "可以复制生成的代码到自己的网站使用",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速生成倒计时" },
            { key: "Ctrl + C", description: "复制倒计时代码" },
          ],
          tips: ["支持多种倒计时样式", "生成的代码可以直接嵌入到网站中", "可以自定义倒计时的颜色和字体"],
        },
        "color-converter": {
          title: "RGB/Hex颜色转换工具帮助",
          description: "在RGB和Hex颜色值之间进行转换，支持实时预览和颜色预设。",
          usageSteps: [
            "在RGB输入框中输入数值或使用滑块调整",
            "或在Hex输入框中直接输入颜色代码",
            "转换结果将实时显示在预览区域",
            "可以点击复制按钮复制转换结果",
          ],
          shortcuts: [
            { key: "Ctrl + C", description: "复制颜色值" },
            { key: "R", description: "随机生成颜色" },
          ],
          tips: ["可以通过点击颜色预设快速选择常用颜色", "支持生成随机颜色", "可以同时查看RGB和Hex两种格式"],
        },
        "color-gradient": {
          title: "颜色渐变生成工具帮助",
          description: "生成CSS和SVG渐变代码，支持线性渐变和径向渐变。",
          usageSteps: [
            "选择渐变类型：线性或径向",
            "调整渐变的方向、角度或形状",
            "添加或删除颜色停止点，调整颜色和位置",
            "复制生成的CSS或SVG代码到自己的项目中",
          ],
          shortcuts: [
            { key: "Ctrl + C", description: "复制渐变代码" },
            { key: "R", description: "随机生成渐变" },
          ],
          tips: ["支持多种渐变方向和角度", "可以通过预设快速选择常用渐变", "生成的代码可以直接用于网页设计"],
        },
        "unit-converter": {
          title: "单位转换工具帮助",
          description: "支持长度、重量、温度等多种单位之间的转换。",
          usageSteps: [
            "选择要转换的单位类型（长度、重量、温度等）",
            "在左侧输入框中输入数值",
            "选择输入单位和输出单位",
            "转换结果将自动显示在右侧输出框中",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速转换" },
            { key: "Ctrl + S", description: "交换单位" },
            { key: "Ctrl + C", description: "复制转换结果" },
          ],
          tips: ["支持多种单位类型的转换", "可以通过常用转换快捷方式快速转换", "转换结果将自动保存到历史记录"],
        },
        "weather-current": {
          title: "实时天气查询工具帮助",
          description: "查询全球城市实时天气，显示温度、湿度、风速等详细数据。",
          usageSteps: [
            "在搜索框中输入城市名称或选择当前位置",
            "系统将自动获取并显示该城市的实时天气信息",
            "可以点击温度单位切换按钮在摄氏度、华氏度和开尔文之间切换",
            "查看详细的天气数据，包括湿度、风速、气压等",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速查询天气" },
            { key: "Ctrl + L", description: "使用当前位置" },
          ],
          tips: ["支持全球大部分城市的天气查询", "数据每30分钟自动更新", "可以添加常用城市到收藏列表"],
        },
        "weather-forecast": {
          title: "天气预报工具帮助",
          description: "查看未来7天天气预报和天气趋势，包括温度变化、降水概率等。",
          usageSteps: [
            "在搜索框中输入城市名称或选择当前位置",
            "查看未来7天的天气预报信息",
            "可以点击具体日期查看该天的详细天气数据",
            "观察天气趋势图了解温度和降水变化",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速获取预报" },
            { key: "Ctrl + L", description: "使用当前位置" },
          ],
          tips: ["预报数据每小时更新一次", "可以查看日出日落时间", "降水概率显示当天可能的降雨情况"],
        },
        "sunrise-sunset": {
          title: "日出日落时间工具帮助",
          description: "查询全球各地日出日落时间和日照时长，带有可视化太阳路径。",
          usageSteps: [
            "在搜索框中输入城市名称或选择当前位置",
            "系统将显示该地点的日出日落时间和日照时长",
            "查看可视化的太阳路径动画，了解太阳在天空中的移动轨迹",
            "可以切换日期查看不同日期的日出日落时间",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速查询" },
            { key: "Ctrl + L", description: "使用当前位置" },
          ],
          tips: ["数据基于地理位置精确计算", "支持查看历史日期的日出日落时间", "可以比较不同地点的日照时长"],
        },
        "air-quality": {
          title: "空气质量查询工具帮助",
          description: "查看城市空气质量指数和污染物浓度，提供健康建议。",
          usageSteps: [
            "在搜索框中输入城市名称或选择当前位置",
            "查看空气质量指数(AQI)和主要污染物信息",
            "了解各项污染物的浓度和健康影响",
            "查看针对当前空气质量的健康建议",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速查询" },
            { key: "Ctrl + L", description: "使用当前位置" },
          ],
          tips: ["AQI数值越高表示污染越严重", "提供不同人群的健康建议", "数据每小时更新一次"],
        },
        "uv-index": {
          title: "紫外线指数工具帮助",
          description: "查询实时紫外线强度和防晒建议，保护您的皮肤健康。",
          usageSteps: [
            "在搜索框中输入城市名称或选择当前位置",
            "查看当前紫外线指数和强度等级",
            "了解针对当前UV指数的防晒建议",
            "可以查看全天UV指数变化趋势",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速查询" },
            { key: "Ctrl + L", description: "使用当前位置" },
          ],
          tips: ["UV指数在中午前后最高", "即使阴天也需要注意防晒", "建议根据UV指数选择合适的防晒措施"],
        },
        "feels-like": {
          title: "体感温度计算工具帮助",
          description: "根据温度、湿度、风速计算体感温度，了解实际感受的温度。",
          usageSteps: [
            "输入当前温度值",
            "输入相对湿度百分比",
            "输入风速值",
            "系统将自动计算并显示体感温度",
            "可以切换温度单位查看不同单位下的体感温度",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速计算" },
            { key: "Ctrl + U", description: "切换温度单位" },
          ],
          tips: [
            "体感温度考虑了多种因素对人体感受的影响",
            "高湿度会使体感温度高于实际温度",
            "大风天气会使体感温度低于实际温度",
          ],
        },
        "precipitation-conversion": {
          title: "降水量转换工具帮助",
          description: "在毫米(mm)和英寸(in)之间转换降水量单位，提供降水等级参考。",
          usageSteps: [
            "在输入框中输入降水量数值",
            "选择输入单位(mm或in)",
            "系统将自动转换为另一种单位",
            "查看转换结果和对应的降水等级",
            "可以点击交换按钮快速切换输入输出单位",
          ],
          shortcuts: [
            { key: "Ctrl + Enter", description: "快速转换" },
            { key: "Ctrl + S", description: "交换单位" },
          ],
          tips: ["支持小数和整数输入", "提供不同降水等级的参考标准", "转换结果精确到小数点后两位"],
        },
      },
    }
  },
  computed: {
    // 筛选后的工具列表
    filteredTools() {
      let filtered = this.tools

      // 分类筛选
      if (this.selectedCategory === "all") {
        // 显示所有工具
        filtered = this.tools
      } else if (this.selectedCategory === "recent") {
        // 最近使用的工具
        const recentToolIds = this.getRecentUsage()
        filtered = this.tools.filter((tool) => recentToolIds.includes(tool.id))
        // 按最近使用顺序排序
        filtered.sort((a, b) => {
          const indexA = recentToolIds.indexOf(a.id)
          const indexB = recentToolIds.indexOf(b.id)
          return indexA - indexB
        })
      } else if (this.selectedCategory === "favorites") {
        // 收藏的工具
        const favoriteToolIds = this.favorites
        filtered = this.tools.filter((tool) => favoriteToolIds.includes(tool.id))
      } else {
        // 其他分类筛选
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
    // 当前工具组件
    currentToolComponent() {
      return this.toolComponents[this.selectedToolId]
    },
  },
  mounted() {
    // 检查URL参数，实现直接打开工具
    const urlParams = new URLSearchParams(window.location.search)
    const toolId = urlParams.get("tool")
    if (toolId && this.toolComponents[toolId]) {
      this.selectedToolId = toolId
      this.showModal = true
    }
  },
  methods: {
    selectTool(toolId) {
      this.selectedToolId = toolId
    },
    // 分类切换
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    // 预加载工具组件
    preloadToolComponent(toolId) {
      // 如果组件已经预加载过，直接返回
      if (this.preloadedComponents[toolId]) {
        return
      }

      // 获取组件配置
      const component = this.toolComponents[toolId]
      if (component) {
        // 直接使用组件，不再调用它（因为它已经是一个异步组件，不是函数）
        this.preloadedComponents[toolId] = component
      }
    },
    // 打开工具模态框
    openToolModal(toolId) {
      this.selectedToolId = toolId
      this.showModal = true

      // 将工具添加到最近使用记录
      this.addToRecent(toolId)

      // 更新URL参数，实现分享功能
      this.updateUrlParams(toolId)
    },
    // 关闭工具模态框
    closeToolModal() {
      this.showModal = false

      // 移除URL参数
      this.updateUrlParams(null)
    },
    // 更新URL参数
    updateUrlParams(toolId) {
      const url = new URL(window.location)
      if (toolId) {
        url.searchParams.set("tool", toolId)
      } else {
        url.searchParams.delete("tool")
      }
      window.history.pushState({}, "", url)
    },
    // 打开工具帮助
    openToolHelp(toolId) {
      const helpContent = this.toolHelpContents[toolId]
      if (helpContent) {
        this.currentHelpContent = helpContent
        this.helpModalVisible = true
      }
    },
    // 关闭帮助模态框
    closeHelpModal() {
      this.helpModalVisible = false
    },
  },
}
</script>

<style scoped>
/* 保持原有的CSS样式不变 */
.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tools-header {
  text-align: center;
  margin-bottom: 30px;
}

.tools-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.tools-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 搜索和分类 */
.tools-filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.search-bar {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--card-bg);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--text-primary);
}

.category-tab:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.category-tab.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 工具卡片网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* 工具卡片 */
.tool-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-color);
  position: relative;
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.tool-card.active {
  border-color: var(--accent-color);
  box-shadow: 0 8px 24px var(--shadow-color);
}

/* 工具头部 */
.tool-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 16px;
}

.tool-icon {
  font-size: 3rem;
}

/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--shadow-color);
  z-index: 10;
}

.favorite-btn:hover {
  transform: scale(1.1) rotate(5deg);
  border-color: var(--accent-color);
}

.favorite-btn.active {
  color: var(--accent-color);
  animation: bounce 0.3s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.favorite-btn:not(.active) {
  opacity: 0.6;
}

.favorite-btn:not(.active):hover {
  opacity: 1;
}

.tool-card h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.tool-card p {
  color: var(--text-secondary);
  margin-bottom: 0;
  font-size: 0.95rem;
}

/* 没有找到工具的提示 */
.no-tools {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.no-tools-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-tools h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.no-tools p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-content {
  background: var(--primary-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px var(--shadow-color);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
  background: var(--secondary-bg);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* 模态框操作按钮组 */
.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.modal-close:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

/* 帮助按钮 */
.help-btn {
  width: 40px;
  height: 40px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.help-btn:hover {
  background: var(--accent-color-hover);
  transform: scale(1.1);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  background: var(--primary-bg);
}

/* 工具通用样式 */
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
}

/* 工具加载状态 */
.tool-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.tool-loading p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tools-header h1 {
    font-size: 2rem;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .tool-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }

  .modal-header,
  .modal-body {
    padding: 20px;
  }

  .category-tabs {
    gap: 8px;
  }

  .category-tab {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>
