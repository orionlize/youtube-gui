import configStore from '@/store/config'

export function getDownloadVideoShell (url) {
  console.log(`youtube-dl --proxy ${configStore.data.proxy()} -f 136+140 ${url.replace(/\?/g, "\\?")}`)
  return `youtube-dl --proxy ${configStore.data.proxy()} -f 136+140 ${url.replace(/\?/g, "\\?")}`
}