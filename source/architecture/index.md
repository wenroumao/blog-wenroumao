---
title: 项目整体架构分析
date: 2025-01-27 10:00:00
type: "architecture"
layout: "page"
comments: false
---

# 📋 项目整体架构分析

> 📊 **快速导航**: [查看更新日志](/changelog/) | [项目版本历史](/changelog/v1-1-0.html)

## 🏗️ 1. 项目基础架构

这是一个基于 **Hexo 7.3.0** 的静态博客网站，使用了 **AnZhiYu** 主题（版本 1.6.14）。项目采用现代化的前端技术栈：

- **静态站点生成器**: Hexo
- **模板引擎**: Pug
- **样式预处理器**: Stylus  
- **部署平台**: Vercel
- **内容管理**: Markdown + YAML 数据文件

## 🎨 2. 主题结构分析

**AnZhiYu 主题**是一个功能丰富的卡片式UI设计主题：

### 核心目录结构：
```
themes/anzhiyu/
├── layout/                 # 页面布局模板
│   ├── includes/          # 组件模块
│   │   ├── layout.pug     # 主布局文件
│   │   ├── additional-js.pug # JavaScript加载
│   │   └── ...
│   ├── index.pug          # 首页模板
│   └── post.pug           # 文章页模板
├── source/                # 静态资源
│   ├── css/              # 样式文件（Stylus）
│   ├── js/               # JavaScript功能脚本
│   └── img/              # 图片和图标资源
└── scripts/              # Hexo插件和扩展功能
```

### 特色功能模块：
- **实况照片功能**: 支持苹果Live Photo展示
- **玻璃材质效果**: 高级视觉特效
- **相册系统**: 支持普通和瀑布流两种展示方式
- **音乐播放器**: 集成网易云音乐
- **追番页面**: 动漫追踪功能
- **智能导航**: 响应式菜单系统

## 📝 3. 内容组织结构

### 文章管理：
```
source/
├── _posts/               # 博客文章（Markdown格式）
├── _data/               # 数据文件
│   ├── about.yml        # 关于页面数据
│   ├── album.yml        # 相册配置
│   ├── equipment.yml    # 装备展示
│   └── bangumis.json    # 追番数据
└── [pages]/             # 各种专题页面
    ├── about/           # 关于页面
    ├── album/           # 相册页面
    ├── music/           # 音乐页面
    ├── architecture/    # 项目架构页面
    └── changelog/       # 更新日志页面 → [点击查看](/changelog/)
```

### 版本历史 📋
- **v1.1.0** (2025-01-27): 新增项目架构分析页面和更新日志系统 → [详细更新内容](/changelog/v1-1-0.html)
- **v1.0.0** (2024): 博客初始版本，包含基础功能和AnZhiYu主题集成

## 🔧 5. 技术配置

### 核心依赖：
```json
{
  "hexo": "^7.3.0",
  "hexo-renderer-pug": "^3.0.0",
  "hexo-renderer-stylus": "^3.0.1",
  "hexo-abbrlink": "^2.2.1",
  "hexo-bilibili-bangumi": "^2.0.1"
}
```

### 构建和部署：
- **本地开发**: `hexo server`
- **构建命令**: `hexo generate`
- **部署方式**: Vercel 自动部署
- **输出目录**: `public/`

### 配置文件：
- `_config.yml`: Hexo 主配置
- `_config.anzhiyu.yml`: AnZhiYu 主题配置
- `vercel.json`: Vercel 部署配置

### 内容管理：
```
source/
├── _posts/               # 博客文章（Markdown格式）
├── _data/               # 数据文件
│   ├── about.yml        # 关于页面数据
│   ├── album.yml        # 相册配置
│   ├── equipment.yml    # 装备展示
│   └── bangumis.json    # 追番数据
└── [pages]/             # 各种专题页面
    ├── about/           # 关于页面
    ├── album/           # 相册页面
    ├── architecture/    # 项目架构页面
    ├── changelog/       # 更新日志页面
    ├── music/           # 音乐页面
    └── ...
```

## 🚀 6. 开发特点
- `_config.anzhiyu.yml`: 主题配置
- `vercel.json`: 部署配置

## 🔧 5. 开发特点

### 自定义功能：
1. **实况照片系统**: 完整的Live Photo支持
2. **玻璃材质特效**: 高级CSS视觉效果
3. **智能相册**: 多种展示模式
4. **个性化组件**: 音乐、追番、装备展示

### 技术亮点：
- 响应式设计，支持多设备
- 模块化组件架构
- 丰富的交互效果
- SEO优化配置
- 性能优化（懒加载、压缩等）

## 📊 6. 项目规模

- **文章数量**: 约15篇技术文档和生活记录
- **主题文件**: 1300+行配置，完整的组件系统
- **静态资源**: 图片、样式、脚本等完整资源
- **功能模块**: 10+个自定义功能页面

## 🚀 7. 性能优化

### 加载优化：
- 图片懒加载
- JavaScript按需加载
- CSS压缩和合并
- 静态资源CDN加速

### 用户体验：
- 页面预加载
- 平滑过渡动画
- 响应式布局
- 深色模式支持

---

*最后更新时间: 2025年1月27日*
*版本: v1.0.0*