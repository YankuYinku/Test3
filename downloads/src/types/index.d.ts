import { DownloadModel } from '@/models/download.model'

export type QueryParams = {
  pageSize: number
  page: number
  sortiments: string[]
  orderSystems: string[]
  customerNumbers: string[]
  categories?: string[]
  search?: string
  languageCode?: string
}

export type IDownloadsQueryResult = {
  downloads: DownloadModel
}
