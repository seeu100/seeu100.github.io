# 本地导航站点

基于Markdown的静态导航站点，自动解析分类结构并支持图标加载优化。

## 功能特性
- 📂 Markdown格式链接库管理
- 🖼️ 自动图标加载与缓存
- 📁 多级分类支持（主分类+子分类）
- 🛠️ 纯前端实现，无需后端

## 文件结构
```
homepage/
├── app.js          # 核心解析与渲染逻辑
├── index.html      # 主界面入口
├── links.md        # 主链接数据库
├── bookmarks.md    # 扩展书签库  
└── styles.css      # 界面样式表
```

## 自定义配置
1. 编辑`links.md`添加新链接：
```markdown
# 新分类
[链接名称](URL) <!-- icon:图标URL -->
```

2. 修改`styles.css`调整样式：
```css
.grid-container {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* 调整卡片宽度 */
}
```

## 浏览器兼容
✅ Chrome 90+ | ✅ Firefox 85+ | ✅ Edge 90+

## 许可证
MIT License