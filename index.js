const octokit = require('@octokit/rest')()
const { execSync } = require('child_process')

const remote = 'origin'
const branch = 'master'

const remoteUrl = execSync(`git config --get remote.${remote}.url`).toString()
const [_, owner, repo] = remoteUrl.match(/:([^/]+)\/(.+)\.git/)
console.log(owner, repo)

const token = process.env.GITHUB_TOKEN
octokit.authenticate({ type: 'token', token })

const main = async () => {
  console.log('Connecting to ngrok...')
  const url = await require('ngrok').connect(8080)
  console.log('Connected: ', url)

  const bodyParser = require('body-parser')
  const app = require('express')()
  app.use(bodyParser.json())
  app.post('/', req => {
    console.log('incoming webhook!')
    const ref = req.body.ref
    if (ref && ref === `refs/heads/${branch}`) {
      console.log(`Syncing with git remote ${remote} from ${ref}`)
      execSync(`git fetch && git reset --hard ${remote} ${branch}`)
    }
  })

  app.listen(8080, () => {
    console.log('stated web server to listen for incoming hooks')

    console.log('creating hook')
    const config = {
      url: url,
      content_type: 'json'
    }
    octokit.repos
      .createHook({
        owner,
        repo,
        name: 'web',
        config,
        events: ['push'],
        active: true
      })
      .then(({ data }) => {
        console.log('Created webhook:', data.id)
      })
  })

  // TODO: delete hook when stopped
}

main()
