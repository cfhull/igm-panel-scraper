const axios = require('axios')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const error = require('chalk').red

const getDomWindow = async (url, cookie) => {
  const body = (await axios({
    url,
    headers: { Cookie: cookie },
  })).data

  if (body.includes('Incapsula')) {
    console.log(error('Cookie is invalid or has expired'))
    process.exit(1)
  }

  return JSDOM(body).window
}

const scrape = (body, url) => {
  const window = new JSDOM(body).window

  let topic
  if (window.document.querySelector('.post.post_domestic h2')) {
    topic = window.document.querySelector('.post.post_domestic h2').textContent
  } else {
    return { success: false, error: url }
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
      confidence: +row.querySelector('.confCell').textContent.trim(),
      comment: row.querySelector('.gridComment').textContent.trim(),
    }))
  })

  const data = questions.map((question, i) => ({
    question,
    url,
    topic,
    responses: responses[i],
  }))

  return { success: true, data }
}

module.exports = {
  getDomWindow,
  scrape,
}
