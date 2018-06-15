# Shipley

Shipley lets you continuously deploy code from GitHub to a 
machine behind a firewall. 

## How it works

First, we use [ngrok](https://ngrok.com/) to create a tunnel from the internet to the lcoal machine.

Next, we start an express web server listening on the end of that tunnel.

Then we call GitHub's API to create a webhook that will ping the web server when a commit is received.

## Installation

Install the package globally:

    npm install shipley -g

## Configure Shipley

Set your `GITHUB_TOKEN` environment variable for configuring the webhooks.

Start shipley, passing the local directory and the name of the git 
remote you want to sync:

    shipley . origin

