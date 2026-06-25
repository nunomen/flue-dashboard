import { readdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const projectRoot = new URL('..', import.meta.url)
const dashboardDist = new URL('dist-dashboard/', projectRoot)
const outputFile = new URL('src/server/dashboard-assets.generated.ts', projectRoot)

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

async function collectFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true })

  await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(path, files)
      return
    }

    files.push(path)
  }))

  return files
}

const files = await collectFiles(dashboardDist.pathname)
const assets = {}
let indexHtml = ''

for (const filePath of files) {
  if (extname(filePath) === '.map') {
    continue
  }

  const body = await readFile(filePath)
  const assetPath = `/${relative(dashboardDist.pathname, filePath).replaceAll('\\', '/')}`
  const contentType = contentTypes.get(extname(filePath)) ?? 'application/octet-stream'

  if (assetPath === '/index.html') {
    indexHtml = body.toString('utf8')
    continue
  }

  assets[assetPath] = {
    contentType,
    body: body.toString('base64'),
    encoding: 'base64',
  }
}

const source = `import type { DashboardAssetBundle } from './dashboard-assets-types'\n\nexport const dashboardAssets: DashboardAssetBundle = ${JSON.stringify({ indexHtml, files: assets }, null, 2)}\n`

await writeFile(outputFile, source)
