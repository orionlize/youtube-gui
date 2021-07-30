import configStore from '@/store/config'

export function getDownloadVideoShell (url) {
  const params = {
    download: `youtube-dl --proxy ${configStore.data.proxy()} -f 136+140 ${url.replace(/\?/g, "\\?")}`,
    downloadPath: configStore.data.downloadPath
  }
  console.log(params)
  return params
}