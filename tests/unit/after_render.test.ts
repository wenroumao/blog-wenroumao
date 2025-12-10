import { describe, it, expect } from 'vitest'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { processHtml } = require('../../scripts/after_render')

describe('after_render filter', () => {
  it('injects head and bottom resources', () => {
    const html = `<!doctype html><html><head></head><body><h1>Test</h1></body></html>`
    const out = processHtml(html)
    expect(out).toContain('/js/patches.js')
    expect(out).toContain('rel="preconnect"')
  })

  it('adds lazy/async to img tags', () => {
    const html = `<html><head></head><body><img src="/a.jpg"><img src="/b.jpg" loading="lazy"></body></html>`
    const out = processHtml(html)
    expect(out).toContain('<img src="/a.jpg" loading="lazy" decoding="async">')
    expect(out).toContain('<img src="/b.jpg" loading="lazy" decoding="async">')
  })
})