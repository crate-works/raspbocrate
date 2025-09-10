# PARADISEC Pi System

## Admin interface

- A basic fastify app
- Will run in a docker container
- It's job is to configure docker on the Pi
- It will have the following features
  - Manage which major applications are installed by manipulating a docker-compose
  - Be able to load collections into the applications
  - Either from an RO-Crate API endpoint or from a USB stick

## Pi Image builder

- A script that runs out of GitHub Actions and every week builds a new Raspberry
  Pi image with the latest updates and software.
- This will be based on Raspberry Pi OS Lite (64-bit) and will include:
  - Docker
  - Docker Compose
- It will contain and admin docker-compose.yml
- it hosts the admin interface which allows the Pi to be configured via a web interface.
- This will run on /admin when you hit the server
- If an Internet connection is available it will check for updates to the admin
  interface and pull them down and restart the container if needed.
- Maybe just use watchtower for this?

## Applications

- Oni UI
- Omeka-S
