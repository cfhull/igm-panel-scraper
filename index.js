const axios = require('axios')
const fs = require('fs')
const chalk = require('chalk')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const success = chalk.green
const error = chalk.red

if (!process.argv[2]) {
  console.log(error('Cookie is required. Example: \'node index.js <cookie>\' '))
  process.exit(1)
}
const headers = { Cookie: process.argv[2] }

const results = {
  errors: [],
  data: [],
};

(async () => {
  const body = (await axios({
    url: 'http://www.igmchicago.org/igm-economic-experts-panel',
    headers,
  })).data

  if (body.includes('Incapsula')) {
    console.log(error('Cookie is invalid or has expired'))
    process.exit(1)
  }

  const window = new JSDOM(body).window

  const urls = [
    window.document.querySelector('.graphLink').href,
    ...Array.from(
      window.document.querySelectorAll('.poll-listing.poll-results > h2 > a')
    ).map(x => x.href),
  ]

  // Doing these sequentially because asyc is causes 500 errors for some reason
  doRequest(urls, 0)

  function doRequest(urls, i) {
    axios({ url: urls[i], headers }).then(body => {
      console.log(
        `[${i + 1}/${urls.length}] ${urls[i]} -- ${
          scrapeData(body.data, urls[i])
            ? success('Succeeded!')
            : error('Failed!')
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

  function scrapeData(body, url) {
    const window = new JSDOM(body).window

    let topic
    if (window.document.querySelector('.post.post_domestic h2')) {
      topic = window.document.querySelector('.post.post_domestic h2')
        .textContent
    } else {
      results.errors.push({ url })
      return false
    }
    const questions = Array.from(
      window.document.querySelectorAll('h3.surveyQuestion')
    ).map(x => x.textContent.replace(/Question \w:/g, '').trim())

    const responseTables = Array.from(
      window.document.querySelectorAll('table.responseDetail')
    )
    const responses = responseTables.map(table => {
      const rows = Array.from(table.querySelectorAll('.parent-row'))
      return rows.map(row => ({
        participant: row.querySelector('.response-name a').textContent.trim(),
        university: row.querySelector('td:nth-child(2)').textContent.trim(),
        vote: row.querySelector('td span').textContent.trim(),
        confidence: row.querySelector('.confCell').textContent.trim(),
        comment: row.querySelector('.gridComment').textContent.trim(),
      }))
    })

    results.data.push(
      ...questions.map((question, i) => ({
        question,
        url,
        topic,
        responses: responses[i],
      }))
    )
    return true
  }
})()
