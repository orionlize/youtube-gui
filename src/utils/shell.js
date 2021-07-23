export function getDownloadViedeoShell (url) {
  console.log(`youtube-dl --proxy http://127.0.0.1:4780 -f 136+140 ${url.replace(/\?/g, '\\?')}`)
  return `youtube-dl --proxy http://127.0.0.1:4780 -f 136+140 ${url.replace(/\?/g, '\\?')}`
}