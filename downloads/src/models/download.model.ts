import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'
import { FileModel } from '@/models/download/file.model'
import { FilePreviewModel } from '@/models/download/filePreview.model'
import { CategoryModel } from '@/models/category/category.model'
import { ISortiment } from '@apetito/portal-sdk-common'

export interface IDownloadModel {
  pageSize: number
  overallItems: number
  overallPages: number
  categoriesSummarization: Array<CategoriesSummarizationModel>
  items: Array<IDownloadDetailModel>
}

export interface IDownloadDetailModel {
  id: string
  title: string
  description: string
  type: string
  file: FileModel
  filePreview: FilePreviewModel
  categories: Array<CategoryModel>
  areas: Array<string>
  sortiments: Array<ISortiment>
  keywords: Array<string>
  orderSystems: Array<string>
  customerNumbers: Array<number>
  materialNumbers: Array<number>
}
