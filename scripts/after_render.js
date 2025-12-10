const INJECT_HEAD = [
  '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>',
  '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
  '<link rel="preconnect" href="https://unpkg.com" crossorigin>',
  '<link rel="dns-prefetch" href="https://unpkg.com">',
  '<link rel="preconnect" href="https://ipapi.co" crossorigin>',
  '<link rel="dns-prefetch" href="https://ipapi.co">',
  '<script src="https://cdn.jsdelivr.net/npm/i18next@23/i18next.min.js" defer></script>'
].join('\n');

const INJECT_BOTTOM = [
  '<script src="/js/patches.js" defer></script>',
  '<script src="/js/lang-switch.js" defer></script>'
].join('\n');

function injectResources(html) {
  if (typeof html !== 'string' || !html) return html;
  let output = html;
  if (output.includes('</head>') && !output.includes('/js/patches.js')) {
    output = output.replace('</head>', `${INJECT_HEAD}\n</head>`);
  }
  if (output.includes('</body>') && !output.includes('/js/patches.js')) {
    output = output.replace('</body>', `${INJECT_BOTTOM}\n</body>`);
  }
  return output;
}

function optimizeImages(html) {
  if (typeof html !== 'string' || !html) return html;
  return html.replace(/<img\b([^>]*?)>/g, (m, attrs) => {
    const hasLoading = /\bloading\s*=/.test(attrs);
    const hasDecoding = /\bdecoding\s*=/.test(attrs);
    const newAttrs = [
      attrs.trim(),
      hasLoading ? '' : 'loading="lazy"',
      hasDecoding ? '' : 'decoding="async"'
    ].filter(Boolean).join(' ');
    return `<img ${newAttrs}>`;
  });
}

function processHtml(html) {
  if (process && process.env && process.env.BLOG_PATCHES_DISABLE === '1') return html;
  let out = html;
  out = optimizeImages(out);
  out = injectResources(out);
  return out;
}

if (typeof hexo !== 'undefined' && hexo.extend && hexo.extend.filter) {
  hexo.extend.filter.register('after_render:html', processHtml);
}

module.exports = {
  injectResources,
  optimizeImages,
  processHtml
};