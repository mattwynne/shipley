# Shipley

Shipley lets you continuously deploy code from GitHub to a 
machine behind a firewall. 

## How it works

First, we use [ngrok](https://ngrok.com/) to create a tunnel from the internet to the local machine.

Next, we start an express web server listening on the end of that tunnel.

Then we call GitHub's API to create a webhook that will ping the web server when a commit is received.

When `shipley` stops, the webhook is deleted and the ngrok tunnel is closed.

## Installation

Install the package globally:

    npm install shipley -g

## Configure Shipley

Set your `GITHUB_TOKEN` environment variable for configuring the webhooks.

Start shipley in the directory of the repo you want to sync from GitHub:

    shipley

It will automatically sync the `master` branch from the `origin` remote.

## TODO

- configure startup command
- run startup command on first boot
- detect current branch, don't just assume master
- allow configurable remote
- options for verbose / non-verbose logging
- tests?!
