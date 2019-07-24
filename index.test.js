import { describe } from 'riteway'
import { scrape } from './scrape.js'

describe.skip('getDomWindow', async assert => {})

describe('scrapeData()', async assert => {
  const body = `
    <div class="post post_domestic">
      <h2>Test Topic</h2>
    </div>
    <h3 class="surveyQuestion">Test Question</h3>
    <table class="responseDetail">
      <tr class="parent-row">
				<td class="response-name">
					<a href="http://www.testurl.com">
						<img alt="test image alt" src="test image src">
						Test Participant							
					</a>
				</td>
				<td>Test University</td>
				<td>
				  <span>
					  Agree							
				  </span>
				</td>
				<td class="confCell">4</td>
				<td>
				  <div class="gridComment">
					  Test Comment<br>														
					</div>
				</td>
			</tr>
    </table>
  `

  assert({
    given: 'valid html',
    should: 'return a success object',
    actual: scrape(body, 'Test Url'),
    expected: {
      success: true,
      data: [
        {
          question: 'Test Question',
          url: 'Test Url',
          topic: 'Test Topic',
          responses: [
            {
              participant: 'Test Participant',
              university: 'Test University',
              vote: 'Agree',
              confidence: 4,
              comment: 'Test Comment',
            },
          ],
        },
      ],
    },
  })

  assert({
    given: 'invalid html',
    should: 'return an error object',
    actual: scrape('', 'Test Url'),
    expected: { success: false, error: 'Test Url' },
  })
})
