import { useQuery } from '@vue/apollo-composable'
import { DocumentNode } from 'graphql'
import { QueryParams } from '@/types'

export const useDownloadQuery = <T>(query: DocumentNode, queryParams: QueryParams) => {
  const { result, loading, onResult, onError, stop } = useQuery<T>(query, queryParams)
  return {
    result,
    loading,
    onResult,
    onError,
    stop,
  }
}
