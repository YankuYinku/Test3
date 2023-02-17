import axios, { AxiosPromise, AxiosResponse } from 'axios'

export const useDownloadFile = (
  downloadUrl: string,
  downloadDescription: string,
  fileType: string
) => {
  return (): Promise<void | AxiosResponse<any, any>> => {
    return axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'blob',
    }).then(response => {
      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: fileType }))
      const fileLink = document.createElement('a')
      fileLink.href = fileUrl
      fileLink.setAttribute('download', downloadDescription)
      document.body.appendChild(fileLink)
      fileLink.click()
      URL.revokeObjectURL(fileLink.href)
      document.body.removeChild(fileLink)
    })
  }
}
