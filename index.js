#!/usr/bin/env node

const { getDomWindow, scrape } = require('./scrape.js')
const fs = require('fs')
const chalk = require('chalk')
const success = chalk.green
const error = chalk.red

if (!process.argv[2]) {
  console.log(error('Cookie is required. Example: \'igm-scrape <cookie>\' '))
  process.exit(1)
}
const cookie = process.argv[2]

const window = getDomWindow(
  'http://www.igmchicago.org/igm-economic-experts-panel',
  cookie
)

const urls = [
  window.document.querySelector('.graphLink').href,
  ...Array.from(
    window.document.querySelectorAll('.poll-listing.poll-results > h2 > a')
  ).map(x => x.href),
]

const results = {
  errors: [],
  data: [],
}

// Doing these sequentially because async is causes 500 errors for some reason
doRequest(urls, 0)

function doRequest(urls, i) {
  getDomWindow(urls[i], cookie).then(body => {
    const scrapeResult = scrape(body.data, urls[i])
    if (scrapeResult.data) results.data.push(...scrapeResult.data)
    if (scrapeResult.errors) results.errors.push(scrapeResult.errors)
    console.log(
      `[${i + 1}/${urls.length}] ${urls[i]} -- ${
        scrapeResult.success ? success('Succeeded!') : error('Failed!')
      }`
    )

    if (urls[i + 1]) {
      doRequest(urls, i + 1)
    } else {
      fs.writeFile('igmdata.json', JSON.stringify(results, null, 2), err => {
        if (err) {
          console.log(error(err))
        } else {
          console.log('\nResults written to ./igmdata.json')
          console.log('Errors: ', error(results.errors.length))
        }
      })
      return
    }
  })
}
