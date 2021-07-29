import configStore from '@/store/config'

export function getDownloadVideoShell (url) {
  console.log(`youtube-dl --proxy ${configStore.data.proxy()} -f 136+140 ${url.replace(/\?/g, "\\?")}`)
  return {
    download: `youtube-dl --proxy ${configStore.data.proxy()} -f 136+140 ${url.replace(/\?/g, "\\?")}`,
    downloadPath: configStore.data.downloadPath
  }
}