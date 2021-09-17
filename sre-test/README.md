# SRE Technical Challenge

You are a Software Reliability Engineer brand new to Famly. The backend team is looking to you to improve their development velocity while keeping Famly's suite of services responsive and reliable. It's a job that wears many hats. One day you might be working closely with developers to unblock their development cycle, another day you might be in the weeds with the infrastructure team to build out a brand new way of creating and managing secrets. One thing is sure: your work is never dull.

How you approach this challenge gives Famly a peek into how your mind works when thinking of systems holistically: from code to production. SREs often need to step back and take in the Big Picture. We'll start with the code...

**Time expectations:**

- We don't want to take too much of your time, so we don't expect you to use more than 2-4 hours on these challenges.
- Don’t worry too much about getting stuck on one of the assignments or running out of time. In that case, we can discuss potential solutions and challenges during the follow-up meeting.

**Solution expectations:**

- Make sure to read through the whole README to get an overview.
- You can change as much as you want, we will go through the choices together.
- If you get stuck, or you think there’s something that doesn’t make sense, please don’t hesitate to reach out!

**If you want to detail anything about your solution, include it here:**

<!-- START of your notes on the solution -->

<!-- END of Notes -->

## Overview

- [Development](#development)
  - [Assignment](#assignment)

## Development

You will need the following tools installed locally:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) for access to the Docker Engine and a local Kubernetes cluster. See the [docs](https://birthday.play-with-docker.com/kubernetes-docker-desktop/) for how to spin up your cluster. If you're a Linux user, see [this article](https://blog.flant.com/small-local-kubernetes-comparison/) for an overview of friendly local cluster tools.

### Assignment

This project consists of a simple app written in Python that connects to MySQL with an Nginx webserver. 

Your challenge is to:
1.  _containerize the app, webserver and database_ then,
2.  run the stack _on Kubernetes_.

**To get started**, inside the directory of this README is a `docker-compose.yaml`, which is offered as an example of building and running the stack using `docker-compose` (or `docker compose` if using the new [V2 release candidate](https://docs.docker.com/compose/cli-command/)). The compose manifest _does not run_. Its purpose is only as a reference.

You are encouraged to be as creative and radical as you like. Take shortcuts, question the material, be absurd. What's important is your final product reflects the way you think.
