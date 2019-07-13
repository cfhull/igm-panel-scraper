const fetch = require('node-fetch')
const axios = require('axios')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

var url = 'http://www.igmchicago.org/igm-economic-experts-panel'

const headers = {'Cookie': 'visid_incap_1371851=Cl91/oaUQJOMXVi5E80hIUvcJF0AAAAAQUIPAAAAAAARhoa1fWgA6WZgcwXB3Egm; incap_ses_143_1371851=gwU+BnJjKWBSkVcUJwz8AezMKV0AAAAAnk6Nf4gNtRPr7bop9V6isQ==;'}

const results = {
  errors: [],
  data: []
}

;(async () => {
	const body = (await axios({url, headers})).data

	if (body.includes('Incapsula')) throw 'Cookie has expired'
	const window = new JSDOM(body).window

	const urls =  [
		window.document.querySelector('.graphLink').href,
		...Array.from(window.document.querySelectorAll('.poll-listing.poll-results > h2 > a')).map(x => x.href),
	]

  // Doing these sequentially because asyc is causes 500 errors for some reason
	doRequest(urls, 0)

	function doRequest(urls, i) {
		if (!urls[i]) {
	    fs.writeFile("igmdata.json", JSON.stringify(results, null, 2), err => err ? console.log(err) : console.log("The file was saved!"))
	    return
		}
		console.log('start', i)
		axios({ url: urls[i], headers}).then(body => {
			console.log('done', i)
			scrapeData(body.data, urls[i])
			doRequest(urls, i+1)
		})
	}

  function scrapeData(body, url) {
	  const window = new JSDOM(body).window;

	  let record = {}

    let topic
	  if (window.document.querySelector('.post.post_domestic h2')) {
      topic = window.document.querySelector('.post.post_domestic h2').textContent
    } else {
      console.log('skipped!')
      results.errors.push({ url })
      return
    }
	  const questions = Array.from(window.document.querySelectorAll('h3.surveyQuestion')).map(x => x.textContent.replace(/Question \w:/g, '').trim())

	  const responseTables = Array.from(window.document.querySelectorAll('table.responseDetail'))
	  const participants = Array.from(responseTables[0].querySelectorAll('.response-name a')).map(x => x.textContent.trim())
	  const responses = responseTables.map(table => ({
		  votes: Array.from(table.querySelectorAll('td span')).map(x => x.textContent.trim()),
		  confidences: Array.from(table.querySelectorAll('.confCell')).map(x => x.textContent.trim()),
	  }))

	  results.data.push({
	    url,
		  topic,
		  questions,
		  participants: participants.map((participant, i) => ({
			  participant,
			  responses: responses.map(response => ({
				  vote: response.votes[i],
				  confidence: response.confidences[i],
			  }))
		  }))
	  })
  }
})()

