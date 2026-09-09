const https = require('https')

const MAX_REDIRECTS = 5

function httpGet(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      },
      (res) => {
        const statusCode = res.statusCode ?? 0
        const location = res.headers.location

        if (statusCode >= 300 && statusCode < 400 && location) {
          res.resume()
          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error(`Too many redirects while fetching ${url}`))
            return
          }
          resolve(httpGet(new URL(location, url).toString(), redirectCount + 1))
          return
        }

        if (statusCode < 200 || statusCode >= 300) {
          res.resume()
          reject(new Error(`HTTP ${statusCode} while fetching ${url}`))
          return
        }

        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        res.on('error', reject)
      },
    )
    request.on('error', reject)
  })
}

module.exports = httpGet
