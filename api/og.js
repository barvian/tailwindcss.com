// Based on https://github.com/vercel/og-image

import core from 'puppeteer-core'
import chrome from 'chrome-aws-lambda'
import { https } from 'follow-redirects'
import cheerio from 'cheerio'
import * as path from 'path'
import * as fs from 'fs/promises'

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const isDev = !process.env.AWS_REGION
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1'
const fileType = 'png'

let _page

async function getPage() {
  if (_page) {
    return _page
  }
  let options = await getOptions()
  let browser = await core.launch(options)
  _page = await browser.newPage()
  return _page
}

async function getOptions() {
  if (isDev) {
    return {
      args: [],
      executablePath: exePath,
      headless: true,
    }
  }
  return {
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  }
}

function getDataUri(base64, type) {
  return `data:${type};base64,${base64}`
}

let backgroundImage
let font

async function getHtml({ title, superTitle, description }) {
  if (!backgroundImage) {
    backgroundImage = await fs.readFile(
      path.join(__dirname, '_files', 'og-background.png'),
      'base64'
    )
  }

  if (!font) {
    font = await fs.readFile(path.join(__dirname, '_files', 'Inter-roman.var.woff2'), 'base64')
  }

  return `<!DOCTYPE html>
<html>
  <meta charset="utf-8">
  <title>Generated Image</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @font-face {
      font-family: 'Inter var';
      font-style: normal;
      font-weight: 100 900;
      src: url(${getDataUri(font, 'font/woff2')}) format('woff2');
      font-named-instance: 'Regular';
    }
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html {
      height: 100%;
      font-family: 'Inter var';
      font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
      -webkit-font-smoothing: antialiased;
    }
    body {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 112px;
      background-image: url(${getDataUri(backgroundImage, 'image/png')});
      background-size: 100% 100%;
    }
    h1 {
      font-size: 72px;
      margin-top: 12px;
      line-height: 1;
      color: black;
      letter-spacing: -0.025em;
      font-weight: 800;
    }
    small {
      font-size: 36px;
      color: #0ea5e9;
      line-height: 1.5;
      font-weight: 600;
    }
    p {
      font-size: 36px;
      line-height: 1.5;
      font-weight: 600;
      color: #64748b;
      margin-top: 12px;
    }
  </style>
  <body>
    <svg viewBox="0 0 202 25" width="404" height="50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.832 0c-5.556 0-9.028 2.778-10.417 8.333 2.084-2.777 4.514-3.82 7.292-3.125 1.585.397 2.718 1.546 3.971 2.819 2.043 2.073 4.407 4.473 9.57 4.473 5.556 0 9.028-2.778 10.417-8.333-2.083 2.777-4.514 3.819-7.291 3.125-1.585-.397-2.718-1.546-3.972-2.82C28.359 2.4 25.995 0 20.832 0ZM10.417 12.5C4.86 12.5 1.389 15.276 0 20.832c2.083-2.778 4.514-3.82 7.292-3.125 1.584.396 2.717 1.546 3.971 2.818C13.306 22.6 15.67 25 20.833 25c5.556 0 9.028-2.777 10.417-8.333-2.084 2.778-4.514 3.82-7.292 3.125-1.585-.396-2.717-1.546-3.971-2.819-2.043-2.073-4.407-4.473-9.57-4.473Z" fill="#0EA5E9"/><path fill-rule="evenodd" clip-rule="evenodd" d="M62.5 10.528h-3.636v7.037c0 1.876 1.232 1.847 3.636 1.73v2.844c-4.867.586-6.803-.762-6.803-4.574v-7.037H53v-3.05h2.697V3.54l3.167-.938v4.877H62.5v3.049ZM76.363 7.48h3.166v14.66h-3.166V20.03c-1.114 1.554-2.844 2.492-5.131 2.492-3.988 0-7.301-3.372-7.301-7.711 0-4.369 3.313-7.711 7.3-7.711 2.288 0 4.018.938 5.132 2.462V7.48ZM71.728 19.5c2.639 0 4.632-1.964 4.632-4.691s-1.993-4.691-4.632-4.691c-2.64 0-4.633 1.964-4.633 4.691s1.994 4.691 4.633 4.691ZM84.804 5.28c-1.114 0-2.023-.938-2.023-2.023 0-1.114.909-2.023 2.023-2.023s2.023.909 2.023 2.023c0 1.085-.909 2.023-2.023 2.023ZM83.22 22.14V7.478h3.167v14.66H83.22Zm6.835 0V.736h3.166V22.14h-3.166ZM113.772 7.48h3.343l-4.604 14.66h-3.108l-3.049-9.88-3.079 9.88h-3.108L95.564 7.48h3.343l2.844 10.116 3.078-10.116h3.02l3.05 10.116 2.873-10.116Zm7.27-2.199c-1.114 0-2.023-.938-2.023-2.023 0-1.114.909-2.023 2.023-2.023s2.023.909 2.023 2.023c0 1.085-.909 2.023-2.023 2.023Zm-1.58 16.86V7.478h3.167v14.66h-3.167Zm14.544-15.041c3.284 0 5.63 2.228 5.63 6.04v9.001h-3.167v-8.679c0-2.228-1.29-3.401-3.284-3.401-2.082 0-3.724 1.231-3.724 4.222v7.858h-3.166V7.48h3.166v1.876c.968-1.524 2.551-2.257 4.545-2.257Zm20.639-5.483h3.166v20.525h-3.166V20.03c-1.114 1.554-2.844 2.492-5.131 2.492-3.988 0-7.301-3.372-7.301-7.711 0-4.37 3.313-7.712 7.301-7.712 2.287 0 4.017.939 5.131 2.463V1.616Zm-4.633 17.885c2.639 0 4.633-1.964 4.633-4.691s-1.994-4.691-4.633-4.691c-2.639 0-4.633 1.964-4.633 4.691s1.994 4.691 4.633 4.691Zm18.411 3.02c-4.427 0-7.74-3.372-7.74-7.711 0-4.369 3.313-7.711 7.74-7.711 2.874 0 5.366 1.495 6.539 3.782l-2.727 1.583c-.645-1.378-2.082-2.258-3.841-2.258-2.58 0-4.545 1.965-4.545 4.604 0 2.639 1.965 4.603 4.545 4.603 1.759 0 3.196-.909 3.9-2.258l2.727 1.554c-1.232 2.317-3.724 3.812-6.598 3.812Zm11.82-10.995c0 2.668 7.888 1.056 7.888 6.48 0 2.932-2.551 4.515-5.718 4.515-2.932 0-5.043-1.32-5.981-3.43l2.727-1.584c.469 1.32 1.642 2.111 3.254 2.111 1.408 0 2.492-.469 2.492-1.641 0-2.61-7.887-1.144-7.887-6.392 0-2.757 2.375-4.486 5.366-4.486 2.404 0 4.398 1.114 5.424 3.049l-2.668 1.495c-.528-1.143-1.554-1.671-2.756-1.671-1.144 0-2.141.498-2.141 1.554Zm13.517 0c0 2.668 7.887 1.056 7.887 6.48 0 2.932-2.551 4.515-5.717 4.515-2.932 0-5.043-1.32-5.982-3.43l2.727-1.584c.469 1.32 1.642 2.111 3.255 2.111 1.407 0 2.492-.469 2.492-1.641 0-2.61-7.887-1.144-7.887-6.392 0-2.757 2.375-4.486 5.366-4.486 2.404 0 4.398 1.114 5.424 3.049l-2.668 1.495c-.528-1.143-1.554-1.671-2.756-1.671-1.144 0-2.141.498-2.141 1.554Z" fill="#111827"/></svg>
    <main>
      ${superTitle ? `<small>${superTitle}</small>` : ''}
      <h1>${title}</h1>
      ${description ? `<p>${description}</p>` : ''}
    </main>
  </body>
</html>`
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = ''
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => {
          resolve({ body, statusCode: res.statusCode })
        })
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

export default async function handler(req, res) {
  try {
    if (!req.query.path?.startsWith('/')) {
      res.statusCode = 400
      return res.end('Error')
    }

    let url = `https://tailwindcss.com${req.query.path}`
    let { body, statusCode } = await get(url)

    if (statusCode === 404) {
      res.statusCode = 404
      return res.end('404')
    }
    if (statusCode !== 200 || !body) {
      res.statusCode = 500
      return res.end('Error')
    }

    let $ = cheerio.load(body)
    let title = $('title')
      .text()
      .replace(/ [-–] Tailwind CSS$/, '')

    if (!title) {
      res.statusCode = 500
      return res.end('Error')
    }

    let superTitle = $('#header > div > p:first-of-type').text()
    let description = $('meta[property="og:description"]').attr('content')
    let html = await getHtml({ title, superTitle, description })

    if (isHtmlDebug) {
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
      return
    }

    let page = await getPage()
    await page.setViewport({ width: 1280, height: 720 })
    await page.setContent(html)
    let file = await page.screenshot({ type: fileType })

    res.statusCode = 200
    res.setHeader('Content-Type', `image/${fileType}`)
    res.setHeader('Cache-Control', 'public, no-transform, s-maxage=31536000, max-age=3600')
    res.end(file)
  } catch (e) {
    res.statusCode = 500
    console.error(e)
    res.end('Error')
  }
}