export interface DashboardEmbeddedAsset {
  contentType: string
  body: string
  encoding: 'base64'
}

export interface DashboardAssetBundle {
  indexHtml: string
  files: Record<string, DashboardEmbeddedAsset>
}
