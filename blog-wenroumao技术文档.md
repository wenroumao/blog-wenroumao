# blog-wenroumao 技术文档

## 项目概述

blog-wenroumao 是一个基于 Hexo 静态博客生成器构建的个人博客项目，使用了 AnZhiYu 主题。该项目集成了多种功能插件，提供了丰富的博客功能和优美的用户界面。

### 技术栈

- **核心框架**: Hexo 7.3.0
- **主题**: AnZhiYu (基于 hexo-theme-butterfly 修改)
- **模板引擎**: Pug, EJS
- **样式预处理器**: Stylus
- **包管理器**: npm
- **Node.js版本**: 支持最新LTS版本

## 项目结构

```
blog-wenroumao/
├── .github/                    # GitHub Actions 配置
│   └── dependabot.yml         # 依赖更新配置
├── _config.yml                # Hexo 主配置文件
├── _config.anzhiyu.yml        # AnZhiYu 主题配置文件
├── package.json               # 项目依赖配置
├── db.json                    # Hexo 数据库文件
├── scaffolds/                 # 文章模板目录
│   ├── draft.md              # 草稿模板
│   ├── page.md               # 页面模板
│   └── post.md               # 文章模板
├── source/                    # 源文件目录
│   ├── _data/                # 数据文件目录
│   │   ├── about.yml         # 关于页面数据
│   │   ├── album.yml         # 相册数据
│   │   ├── bangumis.json     # 追番数据
│   │   ├── creativity.yml    # 技能展示数据
│   │   ├── equipment.yml     # 装备展示数据
│   │   ├── essay.yml         # 随笔数据
│   │   └── link.yml          # 友链数据
│   ├── _posts/               # 文章目录
│   ├── about/                # 关于页面
│   ├── album/                # 相册页面
│   ├── categories/           # 分类页面
│   ├── tags/                 # 标签页面
│   ├── link/                 # 友链页面
│   ├── music/                # 音乐页面
│   └── json/                 # JSON数据文件
└── themes/                    # 主题目录
    └── anzhiyu/              # AnZhiYu 主题文件
```

## 核心配置文件

### 1. Hexo 主配置 (_config.yml)

#### 站点信息配置
```yaml
# Site
title: Hexo                    # 网站标题
subtitle: ''                   # 网站副标题
description: ''                # 网站描述
keywords:                      # 网站关键词
author: John Doe               # 作者名称
language: zh-CN                # 网站语言
timezone: ''                   # 时区设置
```

#### URL 配置
```yaml
# URL
url: http://example.com        # 网站URL
permalink: :year/:month/:day/:title/  # 文章永久链接格式
permalink_defaults:
pretty_urls:
  trailing_index: true         # 是否保留尾部 index.html
  trailing_html: true          # 是否保留尾部 .html
```

#### 目录配置
```yaml
# Directory
source_dir: source             # 源文件目录
public_dir: public             # 生成文件目录
tag_dir: tags                  # 标签目录
archive_dir: archives          # 归档目录
category_dir: categories       # 分类目录
code_dir: downloads/code       # 代码目录
i18n_dir: :lang               # 国际化目录
```

#### 写作配置
```yaml
# Writing
new_post_name: :title.md       # 新文章文件名格式
default_layout: post           # 默认布局
titlecase: false               # 标题大小写转换
external_link:
  enable: true                 # 在新标签页打开外部链接
  field: site                  # 应用范围
  exclude: ''
filename_case: 0               # 文件名大小写
render_drafts: false           # 是否渲染草稿
post_asset_folder: false       # 是否启用资源文件夹
relative_link: false           # 是否使用相对链接
future: true                   # 是否显示未来日期的文章
```

#### 代码高亮配置
```yaml
syntax_highlighter: highlight.js
highlight:
  line_number: true            # 显示行号
  auto_detect: false           # 自动检测语言
  tab_replace: ''              # Tab替换
  wrap: true                   # 代码换行
  hljs: false                  # 使用hljs样式
```

#### 分页配置
```yaml
# Home page setting
index_generator:
  path: ''                     # 首页路径
  per_page: 10                 # 每页文章数
  order_by: -date              # 排序方式

# Pagination
per_page: 10                   # 分页文章数
pagination_dir: page           # 分页目录
```

### 2. AnZhiYu 主题配置 (_config.anzhiyu.yml)

#### 菜单配置
```yaml
menu:
  文章:
    隧道: /archives/ || anzhiyu-icon-box-archive
    分类: /categories/ || anzhiyu-icon-shapes
    标签: /tags/ || anzhiyu-icon-tags
  友链:
    友人帐: /link/ || anzhiyu-icon-link
    朋友圈: /fcircle/ || anzhiyu-icon-artstation
    留言板: /comments/ || anzhiyu-icon-envelope
  我的:
    音乐馆: /music/?id=2887240194&server=netease || anzhiyu-icon-music
    追番页: /bangumis/ || anzhiyu-icon-bilibili
    相册集: /album/ || anzhiyu-icon-images
    小空调: /air-conditioner/ || anzhiyu-icon-fan
  关于:
    关于本人: /about/ || anzhiyu-icon-paper-plane
    闲言碎语: /essay/ || anzhiyu-icon-lightbulb
    随便逛逛: javascript:toRandomPost() || anzhiyu-icon-shoe-prints1
    我的装备: /equipment/ || anzhiyu-icon-dice-d20
```

#### 代码块配置
```yaml
# Code Blocks
highlight_theme: mac           # 代码高亮主题
highlight_copy: true           # 复制按钮
highlight_lang: true           # 显示语言
highlight_shrink: false        # 代码块收缩
highlight_height_limit: 330    # 高度限制(px)
code_word_wrap: false          # 代码换行
```

#### 复制设置
```yaml
copy:
  enable: true                 # 启用复制功能
  copyright:
    enable: false              # 复制版权信息
    limit_count: 50            # 字数限制
```

#### 头像和图片配置
```yaml
# Avatar
avatar:
  img: https://wenroumao.oss-cn-beijing.aliyuncs.com/img/%E5%A4%B4%E5%83%8F
  effect: false                # 头像特效

# Image settings
favicon: /favicon.ico          # 网站图标
disable_top_img: false         # 禁用顶部图片
index_img: false               # 首页背景图
default_top_img: false         # 默认顶部图片
```

#### 封面配置
```yaml
cover:
  index_enable: true           # 首页显示封面
  aside_enable: true           # 侧边栏显示封面
  archives_enable: true        # 归档页显示封面
  position: left               # 封面位置 (left/right/both)
  default_cover:               # 默认封面
    # - /img/default_cover.jpg
```

#### 文章元信息配置
```yaml
post_meta:
  page:
    date_type: created         # 日期类型 (created/updated/both)
    date_format: simple        # 日期格式 (date/relative/simple)
    categories: true           # 显示分类
    tags: true                 # 显示标签
    label: false               # 显示描述文字
  post:
    date_type: both            # 文章页日期类型
    date_format: date          # 文章页日期格式
    categories: true           # 文章页显示分类
    tags: true                 # 文章页显示标签
    label: true                # 文章页显示描述文字
    unread: false              # 文章未读功能
```

#### 主色调配置
```yaml
mainTone:
  enable: true                 # 启用主色调获取
  mode: api                    # 模式 (cdn/api/both)
  api: https://img2color-go.vercel.app/api?img=  # API地址
  cover_change: true           # 跟随封面修改主色调
```

#### 目录配置
```yaml
toc:
  post: true                   # 文章显示目录
  page: false                  # 页面显示目录
  number: true                 # 目录编号
  expand: false                # 展开目录
  style_simple: false          # 简单样式
```

#### 版权配置
```yaml
post_copyright:
  enable: true                 # 启用版权信息
  decode: false                # 解码
  author_href:                 # 作者链接
  location: 大连               # 位置
  license: CC BY-NC-SA 4.0     # 许可证
  license_url: https://creativecommons.org/licenses/by-nc-sa/4.0/
  avatarSinks: false           # 头像下沉效果
  copyright_author_link: /     # 版权作者链接
```

#### 打赏配置
```yaml
reward:
  enable: true                 # 启用打赏
  QR_code:
    - img: https://npm.elemecdn.com/anzhiyu-blog@1.1.6/img/post/common/qrcode-weichat.png
      text: 微信
    - img: https://npm.elemecdn.com/anzhiyu-blog@1.1.6/img/post/common/qrcode-alipay.png
      text: 支付宝
```

## 插件配置

### 1. 信笺留言板插件 (hexo-butterfly-envelope)

```yaml
envelope_comment:
  enable: true                 # 控制开关
  custom_pic:
    cover: https://npm.elemecdn.com/hexo-butterfly-envelope/lib/violet.jpg
    line: https://npm.elemecdn.com/hexo-butterfly-envelope/lib/line.png
    beforeimg: https://npm.elemecdn.com/hexo-butterfly-envelope/lib/before.png
    afterimg: https://npm.elemecdn.com/hexo-butterfly-envelope/lib/after.png
  message:                     # 信笺正文
    - 有什么想问的？
    - 有什么想说的？
    - 有什么想吐槽的？
    - 哪怕是有什么想吃的，都可以告诉我哦~
  bottom: 自动书记人偶竭诚为您服务！
  front_matter:
    title: 留言板
    comments: true
    top_img: false
    type: envelope
```

### 2. 追番插件 (hexo-bilibili-bangumi)

```yaml
bangumi:
  enable: true                 # 是否启用
  source: bili                 # 数据源
  vmid: 397547279              # B站用户ID
  title: "追番列表"            # 页面标题
  quote: "生命不息，追番不止！" # 页面引言
  show: 1                      # 初始显示页面 (0=想看, 1=在看, 2=看过)
  lazyload: false              # 图片懒加载
  showMyComment: false         # 显示个人评论
  pagination: false            # 分页
  proxy:
    host: "代理host"
    port: "代理端口"
  extra_options:
    top_img: false
    lazyload:
      enable: false
```

### 3. 博客加密插件 (hexo-blog-encrypt)

该插件用于对特定文章进行密码保护，在文章的 Front Matter 中添加：

```yaml
---
title: 加密文章
date: 2023-01-01
password: your_password
abstract: 这是一篇加密文章
message: 请输入密码查看
---
```

## 数据文件配置

### 1. 关于页面数据 (source/_data/about.yml)

```yaml
- class_name: 关于页
  subtitle: 生活明朗，万物可爱✨
  avatarImg: https://wenroumao.oss-cn-beijing.aliyuncs.com/img/%E5%A4%B4%E5%83%8F
  avatarSkills:
    left:
      - 🤖️ 数码科技爱好者
      - 🔍 分享与热心帮助
      - 🏠 智能家居小能手
      - 🔨 设计开发一条龙
    right:
      - 专修交互与设计 🤝
      - 脚踏实地行动派 🏃
      - 团队小组发动机 🧱
      - 喜欢安静一个人 🤫
  name: 苏桉汐
  description: 是一名学生、独立开发者、博主
  careers:
    tips: 生涯
    title: 无限进步
    list:
      - desc: EDU,信息技术专业
        color: "#357ef5"
```

### 2. 友链数据 (source/_data/link.yml)

```yaml
- class_name: 框架
  flink_style: flexcard
  link_list:
    - name: Hexo
      link: https://hexo.io/zh-tw/
      avatar: https://d33wubrfki0l68.cloudfront.net/6657ba50e702d84afb32fe846bed54fba1a77add/827ae/logo.svg
      descr: 快速、简单且强大的网站框架

- class_name: 推荐博客
  flink_style: telescopic
  link_list:
    - name: 安知鱼
      link: https://blog.anheyu.com/
      avatar: https://wenroumao.oss-cn-beijing.aliyuncs.com/img/%E5%A4%B4%E5%83%8F
      descr: 生活明朗，万物可爱
      color: vip
      tag: 技术
```

### 3. 技能展示数据 (source/_data/creativity.yml)

```yaml
- class_name: 开启创造力
  creativity_list:
    - name: Java
      color: "#fff"
      icon: https://upload-bbs.miyoushe.com/upload/2025/07/29/125766904/26ba17ce013ecde9afc8b373e2fc0b9d_1804318147854602575.jpg
    - name: Docker
      color: "#57b6e6"
      icon: https://upload-bbs.miyoushe.com/upload/2025/07/29/125766904/544b2d982fd5c4ede6630b29d86f3cae_7350393908531420887.png
    - name: Vue
      color: "#b8f0ae"
      icon: https://upload-bbs.miyoushe.com/upload/2025/07/29/125766904/cf23526f451784ff137f161b8fe18d5a_692393069314581413.png
```

## 项目依赖

### 核心依赖

```json
{
  "dependencies": {
    "hexo-bilibili-bangumi": "^2.0.1",      // 追番插件
    "hexo-blog-encrypt": "^3.1.9",          // 博客加密插件
    "hexo-butterfly-envelope": "^1.0.15",   // 信笺留言板插件
    "hexo-deployer-git": "^4.0.0",          // Git部署插件
    "hexo-generator-archive": "^2.0.0",     // 归档生成器
    "hexo-generator-category": "^2.0.0",    // 分类生成器
    "hexo-generator-index": "^3.0.0",       // 首页生成器
    "hexo-generator-tag": "^2.0.0",         // 标签生成器
    "hexo-renderer-ejs": "^2.0.0",          // EJS渲染器
    "hexo-renderer-marked": "^6.0.0",       // Markdown渲染器
    "hexo-renderer-pug": "^3.0.0",          // Pug渲染器
    "hexo-renderer-stylus": "^3.0.1",       // Stylus渲染器
    "hexo-server": "^3.0.0",                // 本地服务器
    "hexo-theme-landscape": "^1.0.0"        // 默认主题
  },
  "devDependencies": {
    "hexo": "^7.3.0"                        // Hexo核心
  }
}
```

### NPM 脚本

```json
{
  "scripts": {
    "build": "chmod +x ./node_modules/.bin/hexo && npx hexo generate",  // 构建
    "clean": "hexo clean",                                              // 清理
    "deploy": "hexo deploy",                                            // 部署
    "server": "hexo server"                                             // 启动服务器
  }
}
```

## 使用方法

### 1. 环境准备

```bash
# 安装 Node.js (推荐 LTS 版本)
# 安装 Git

# 克隆项目
git clone <repository-url>
cd blog-wenroumao

# 安装依赖
npm install
```

### 2. 本地开发

```bash
# 启动本地服务器
npm run server
# 或
hexo server

# 访问 http://localhost:4000
```

### 3. 创建文章

```bash
# 创建新文章
hexo new "文章标题"

# 创建新页面
hexo new page "页面名称"

# 创建草稿
hexo new draft "草稿标题"
```

### 4. 生成和部署

```bash
# 清理缓存
npm run clean

# 生成静态文件
npm run build

# 部署到远程
npm run deploy
```

### 5. 文章 Front Matter 示例

```yaml
---
title: 文章标题
date: 2023-01-01 12:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类1
  - 分类2
cover: /img/cover.jpg          # 文章封面
top_img: /img/top.jpg          # 顶部图片
description: 文章描述
keywords: 关键词1,关键词2
comments: true                 # 是否开启评论
toc: true                      # 是否显示目录
mathjax: false                 # 是否启用数学公式
katex: false                   # 是否启用KaTeX
hide: false                    # 是否隐藏文章
password: 密码                 # 文章密码（需要加密插件）
---
```

## 主题特色功能

### 1. 响应式设计
- 支持桌面端、平板端、移动端自适应
- 优雅的动画效果和交互体验

### 2. 多种页面类型
- 文章页面：支持目录、代码高亮、数学公式
- 关于页面：个人信息展示、技能展示
- 友链页面：多种友链样式
- 相册页面：图片展示
- 音乐页面：音乐播放器集成
- 追番页面：B站追番数据同步

### 3. 评论系统支持
- Valine
- Waline  
- Twikoo
- Gitalk
- Giscus

### 4. 搜索功能
- 本地搜索
- Algolia 搜索
- Docsearch

### 5. 社交功能
- 社交图标配置
- 分享功能
- RSS 订阅

### 6. SEO 优化
- 自动生成 sitemap
- 结构化数据
- Open Graph 支持
- Twitter Card 支持

## 自定义配置

### 1. 修改主题颜色

在 `_config.anzhiyu.yml` 中修改：

```yaml
# 主色调配置
mainTone:
  enable: true
  mode: api
  cover_change: true
```

### 2. 添加自定义 CSS/JS

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/custom.css">
  bottom:
    - <script src="/js/custom.js"></script>
```

### 3. 配置 CDN

```yaml
CDN:
  # 第三方 CDN
  third_party_provider: jsdelivr
  # 自定义格式
  option:
    # main_css:
    # main:
    # utils:
```

## 部署配置

### 1. GitHub Pages 部署

在 `_config.yml` 中配置：

```yaml
deploy:
  type: git
  repo: https://github.com/username/username.github.io.git
  branch: main
```

### 2. Vercel 部署

1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置输出目录：`public`

### 3. Netlify 部署

1. 连接 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置发布目录：`public`

## 性能优化

### 1. 图片优化
- 使用 WebP 格式
- 启用图片懒加载
- 配置 CDN 加速

### 2. 代码优化
- 启用代码压缩
- 使用 CDN 加载第三方库
- 启用浏览器缓存

### 3. 加载优化
- 启用 PJAX
- 预加载关键资源
- 异步加载非关键资源

## 常见问题

### 1. 安装依赖失败

```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules
npm install
```

### 2. 主题更新

```bash
# 备份配置文件
cp _config.anzhiyu.yml _config.anzhiyu.yml.bak

# 更新主题
cd themes/anzhiyu
git pull

# 恢复配置
cp _config.anzhiyu.yml.bak _config.anzhiyu.yml
```

### 3. 生成失败

```bash
# 清理缓存
hexo clean

# 检查配置文件语法
# 重新生成
hexo generate
```
# 更新追番数据
hexo bangumi -u
# 本地预览
hexo server

## 注意事项

1. **配置文件格式**：YAML 格式对缩进敏感，请使用空格而非 Tab
2. **图片路径**：建议使用绝对路径或 CDN 链接
3. **插件兼容性**：更新插件前请查看兼容性说明
4. **备份重要数据**：定期备份 `source` 目录和配置文件
5. **版本控制**：使用 Git 管理代码，避免直接修改主题文件

## 更新日志

- **v1.0.0**: 初始版本，基于 AnZhiYu 主题
- 集成追番插件、信笺留言板插件
- 新增 bilibili  bangumi 插件
- 新增 信笺留言板 插件
 # 更新追番数据
hexo bangumi -u
# 使用 bili 源时显示追番进度（需要 SESSDATA）
hexo bangumi -u 'your_sessdata_here'
# 更新追剧数据
hexo cinema -u

# 更新游戏数据
hexo game -u
- 配置个人信息和友链数据
- 优化 SEO 和性能设置

## 技术支持

- **Hexo 官方文档**: https://hexo.io/docs/
- **AnZhiYu 主题文档**: https://docs.anheyu.com/
- **GitHub Issues**: 项目仓库 Issues 页面

---

*本文档最后更新时间：2025年9月*