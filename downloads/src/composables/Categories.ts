import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'

export const useMapCategories = (
  defaultCategory: CategoriesSummarizationModel,
  defaultCategoryAmount?: number
) => {
  return (rawCategories: CategoriesSummarizationModel[]) => {
    if (rawCategories?.length) {
      const returnedCategories = rawCategories
      const categories = [
        {
          ...defaultCategory,
          amount:
            defaultCategoryAmount ||
            returnedCategories.reduce((amount, category) => {
              return { ...category }?.amount + amount
            }, 0),
        },
        ...returnedCategories,
      ]
      return Promise.resolve(categories.filter(cat => cat.categoryName))
    }
    return Promise.resolve([])
  }
}
