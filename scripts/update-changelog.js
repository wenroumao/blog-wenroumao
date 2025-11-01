/**
 * 自动更新日志同步脚本
 * 用于在博客更新时自动同步更新日志
 */

const fs = require('fs');
const path = require('path');

class ChangelogManager {
  constructor(hexo) {
    this.hexo = hexo;
    this.changelogDir = path.join(hexo.source_dir, 'changelog');
    this.packagePath = path.join(hexo.base_dir, 'package.json');
  }

  /**
   * 获取当前版本号
   */
  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
      return packageJson.version || '1.0.0';
    } catch (error) {
      console.log('无法读取版本号，使用默认版本');
      return '1.0.0';
    }
  }

  /**
   * 生成版本更新日志模板
   */
  generateVersionTemplate(version, changes = []) {
    const date = new Date().toLocaleDateString('zh-CN');
    const template = `---
title: v${version} 更新详情
date: ${new Date().toISOString().split('T')[0]} 10:00:00
type: "changelog-detail"
layout: "page"
comments: false
---

# 📋 v${version} 更新详情

**发布日期**: ${date}  
**版本类型**: 功能更新

---

## 🆕 新增功能

${changes.filter(c => c.type === 'feature').map(c => `- ${c.description}`).join('\n') || '- 暂无新增功能'}

---

## 🐛 问题修复

${changes.filter(c => c.type === 'fix').map(c => `- ${c.description}`).join('\n') || '- 暂无问题修复'}

---

## 🎨 界面优化

${changes.filter(c => c.type === 'ui').map(c => `- ${c.description}`).join('\n') || '- 暂无界面优化'}

---

## ⚡ 性能优化

${changes.filter(c => c.type === 'performance').map(c => `- ${c.description}`).join('\n') || '- 暂无性能优化'}

---

## 🔧 技术改进

${changes.filter(c => c.type === 'tech').map(c => `- ${c.description}`).join('\n') || '- 暂无技术改进'}

---

## 📝 文档更新

${changes.filter(c => c.type === 'docs').map(c => `- ${c.description}`).join('\n') || '- 暂无文档更新'}

---

*此版本的详细更新内容，记录了所有重要的改进和修复。*`;

    return template;
  }

  /**
   * 更新主更新日志页面
   */
  updateMainChangelog(version, summary) {
    const changelogPath = path.join(this.changelogDir, 'index.md');
    
    if (!fs.existsSync(changelogPath)) {
      console.log('更新日志主页面不存在，跳过更新');
      return;
    }

    try {
      let content = fs.readFileSync(changelogPath, 'utf8');
      const date = new Date().toLocaleDateString('zh-CN');
      
      // 在最新更新部分添加新版本
      const newVersionEntry = `### v${version} - ${date}
${summary || '- 版本更新'}

---

## 📋 版本历史`;

      content = content.replace(
        /## 🚀 最新更新\n\n(.*?)\n---\n\n## 📋 版本历史/s,
        `## 🚀 最新更新\n\n${newVersionEntry}`
      );

      fs.writeFileSync(changelogPath, content, 'utf8');
      console.log(`✅ 更新日志主页面已更新 (v${version})`);
    } catch (error) {
      console.error('更新主更新日志失败:', error);
    }
  }

  /**
   * 创建新版本更新日志
   */
  createVersionChangelog(version, changes = []) {
    const versionFile = `v${version.replace(/\./g, '-')}.md`;
    const versionPath = path.join(this.changelogDir, versionFile);

    if (fs.existsSync(versionPath)) {
      console.log(`版本 v${version} 的更新日志已存在`);
      return;
    }

    const template = this.generateVersionTemplate(version, changes);
    
    try {
      fs.writeFileSync(versionPath, template, 'utf8');
      console.log(`✅ 创建版本更新日志: ${versionFile}`);
    } catch (error) {
      console.error('创建版本更新日志失败:', error);
    }
  }

  /**
   * 自动检测并同步更新
   */
  autoSync() {
    const version = this.getCurrentVersion();
    console.log(`🔄 检查版本更新: v${version}`);
    
    // 这里可以添加更多自动检测逻辑
    // 比如检测 git commit、文件变更等
    
    return {
      version,
      needsUpdate: false // 可以根据实际情况判断
    };
  }
}

// Hexo 插件注册
hexo.extend.console.register('changelog', '管理更新日志', {
  usage: '[version] [type]',
  arguments: [
    { name: 'version', desc: '版本号 (如: 1.2.0)' },
    { name: 'type', desc: '更新类型 (major|minor|patch)' }
  ]
}, function(args) {
  const manager = new ChangelogManager(this);
  
  if (args._.length === 0) {
    // 显示当前版本和帮助信息
    console.log('📋 更新日志管理工具');
    console.log(`当前版本: v${manager.getCurrentVersion()}`);
    console.log('');
    console.log('使用方法:');
    console.log('  hexo changelog 1.2.0        # 创建 v1.2.0 更新日志');
    console.log('  hexo changelog sync          # 同步更新日志');
    return;
  }

  const command = args._[0];
  
  if (command === 'sync') {
    const result = manager.autoSync();
    console.log('🔄 同步完成');
    return;
  }

  // 创建新版本更新日志
  const version = command;
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('❌ 版本号格式错误，请使用 x.y.z 格式');
    return;
  }

  manager.createVersionChangelog(version);
  manager.updateMainChangelog(version, '- 新版本发布');
});

// 导出管理器供其他脚本使用
module.exports = ChangelogManager;