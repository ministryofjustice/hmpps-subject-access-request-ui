import express, { Express } from 'express'
import config from '../config'
import nunjucksSetup from './nunjucksSetup'

describe.each(['productConfigDetails', 'confirmCreateProductConfig', 'confirmUpdateProductConfig'])(
  '%s Slack channel display',
  template => {
    let app: Express

    const render = (teamSlackChannelId?: string | null): Promise<string> =>
      new Promise((resolve, reject) => {
        app.render(`pages/admin/${template}.njk`, { productDetails: { teamSlackChannelId } }, (error, html) => {
          if (error) reject(error)
          else resolve(html)
        })
      })

    const setup = () => {
      app = express()
      nunjucksSetup(app, {
        applicationName: 'test',
        buildNumber: '1',
        gitRef: 'test',
        gitShortHash: 'test',
        branchName: 'main',
      })
    }

    beforeEach(setup)
    afterEach(() => jest.restoreAllMocks())

    it('uses the channel ID as the link label instead of displaying the URL', async () => {
      const html = await render('C1234567890')

      expect(html).toContain('>C1234567890</a>')
      expect(html).not.toContain('>https://moj.enterprise.slack.com/archives/C1234567890</a>')
    })

    it('opens the Slack channel link in a new tab', async () => {
      const html = await render('C1234567890')

      expect(html).toContain(
        '<a class="govuk-link" href="https://moj.enterprise.slack.com/archives/C1234567890" target="_blank" rel="noopener noreferrer">C1234567890</a>',
      )
    })

    it('displays comma-separated channel IDs as separate links', async () => {
      const html = await render('C1234567890, C0987654321')

      expect(html).toContain(
        '<a class="govuk-link" href="https://moj.enterprise.slack.com/archives/C1234567890" target="_blank" rel="noopener noreferrer">C1234567890</a>, <a class="govuk-link" href="https://moj.enterprise.slack.com/archives/C0987654321" target="_blank" rel="noopener noreferrer">C0987654321</a>',
      )
    })

    it.each([undefined, null, '', ', ,'])(
      'displays NONE without a Slack link for an absent ID (%s)',
      async channelId => {
        const html = await render(channelId)

        expect(html).toMatch(/Team Slack channel[\s\S]*?govuk-summary-list__value">\s*NONE\s*</)
        expect(html).not.toContain('slack.com/archives/')
      },
    )

    it.each(['https://slack.example/archives', 'https://slack.example/archives/'])(
      'uses the configured base URL %s',
      async baseUrl => {
        jest.replaceProperty(config, 'slackChannelBaseUrl', baseUrl)
        setup()

        const html = await render('C1234567890')

        expect(html).toContain('href="https://slack.example/archives/C1234567890"')
      },
    )

    it('encodes the channel ID as a URL component', async () => {
      const html = await render('C123/?"<>&')

      expect(html).toContain('href="https://moj.enterprise.slack.com/archives/C123%2F%3F%22%3C%3E%26"')
      expect(html).not.toContain('C123/?"<>&')
    })
  },
)
