const octokit = require('@octokit/rest')()
const { execSync, spawn } = require('child_process')

const remote = 'origin'
const branch = 'master'
const cmd = ['npm', ['start']]

const remoteUrl = execSync(`git config --get remote.${remote}.url`).toString()
const [_, owner, repo] = remoteUrl.match(/:([^/]+)\/(.+)\.git/)
console.log(`Syncing GitHub repo ${owner}/${repo} => ${process.cwd()}`)

const token = process.env.GITHUB_TOKEN
octokit.authenticate({ type: 'token', token })

let appProcess = null

const main = async () => {
  console.log('Connecting to ngrok...')
  const url = await require('ngrok').connect(8080)
  console.log('Connected: ', url)

  const bodyParser = require('body-parser')
  const app = require('express')()
  app.use(bodyParser.json())
  app.post('/', req => {
    const ref = req.body.ref
    if (ref && ref === `refs/heads/${branch}`) {
      console.log(
        `Webhook received. Syncing with git remote ${remote} from ${ref}...`
      )
      execSync(`git fetch && git reset --hard ${remote}/${branch}`)
      console.log('Done.')

      console.log('Restarting app...')
      if (appProcess) appProcess.kill()
      appProcess = spawn(...cmd)
      console.log('Restarted.')
    }
  })

  app.listen(8080, () => {
    console.log('Started web server to listen for incoming hooks')

    console.log('Creating webhook...')
    const config = {
      url,
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
        const { id } = data
        process.on('SIGINT', () => {
          console.log('Deleting webhook...')
          octokit.repos.deleteHook({ hook_id: id, owner, repo }).then(() => {
            console.log('Deleted.')
            process.exit(0)
          })
        })
        console.log('Created webhook:', id)
      })
  })

  console.log('Starting app...')
  appProcess = spawn(...cmd)
  console.log('Started.')
}

main()
