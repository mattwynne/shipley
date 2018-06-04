const token = process.env.GITHUB_TOKEN
const octokit = require('@octokit/rest')()
octokit.authenticate({
	type: 'token',
	token
})

const bodyParser = require ('body-parser')

const main = async () => {

	console.log('Connecting to ngrok...')
	const url = await require('ngrok').connect(8080)
	console.log(url)

	const app = require('express')()
	app.use(bodyParser.json())
	app.post('/', (req) => {
		console.log("incoming webhook!")
		console.log(req.body)
		// TODO: pull to local repo
		// TODO: run some kind of configurable stop / startup commands?
	})

	app.listen(8080, () => {
		console.log("stated web server to listen for incoming hooks")

		console.log("creating hook")
		const config = {
			"url": url,
			"content_type": "json"
		}
		octokit.repos.createHook({
			owner: 'mattwynne',
			repo: 'cucumbers-and-raspberries',
			name: 'web',
			config,
			events: ["push"],
			active: true
		}).then(data => {
			console.log("Created webhook:", data)
		})
	})

	// TODO: delete hook when stopped
}

main()
