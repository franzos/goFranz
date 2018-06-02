---
title: "How-To set-up syncthing on Debian 9 with NGINX reverse proxy"
layout: post
date: 2018-06-02 00:00:00 +0200
category:
  - dev
  - sync
tags:
  - development
  - digitalocean
  - debian
  - syncthing
---

## Minimum requirements

- Debian 9 / Ubuntu 16.04+ Linux with 512MB RAM
- As much free disk space, as data you're planning to store

## Instructions

### Prepare the system

    sudo apt-get update && sudo apt-get upgrade && sudo apt-get install curl nginx

### Set-up Syncthing

#### 1) Installation

    curl -s https://syncthing.net/release-key.txt | sudo apt-key add -
    echo "deb https://apt.syncthing.net/ syncthing stable" | sudo tee /etc/apt/sources.list.d/syncthing.list
    sudo apt-get update & sudo apt-get install syncthing

#### 2) Configuration

To generate our initial config, we need to run syncthing once.

`syncthing`

Once the initialization has completed, simply cancel with:

`CTRL-C`

Now open the config ...

`nano ~/.config/syncthing/config.xml`

and look for this section:

    <gui enabled="true" tls="false">
        <insecureSkipHostcheck>true</insecureSkipHostcheck> # ADD THIS
    </gui>

### Install SSL certificate, configure NGINX

#### 1) Installation

    sudo apt-get install certbot
    sudo systemctl stop nginx

Before you generate your certificates, make sure your domain is pointed at your server.

`sudo certbot certonly --standalone -d syncthing.domain.com`

#### 2) Configure NGINX

Now we'll need to create a NGINX config, to serve our syncthing installation.

`nano /etc/nginx/sites-available/syncthing.domain.com`

Use this configuration

    server {
        listen              443 ssl;
        server_name         syncthing.domain.com;
        ssl_certificate     /etc/letsencrypt/live/syncthing.domain.com/cert.pem;
        ssl_certificate_key /etc/letsencrypt/live/syncthing.domain.com/privkey.pem;
        ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        location / {
        	  proxy_set_header        Host $host;
        	  proxy_set_header        X-Real-IP $remote_addr;
        	  proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        	  proxy_set_header        X-Forwarded-Proto $scheme;

        	  proxy_pass              http://localhost:8384/;

        	  proxy_read_timeout      600s;
        	  proxy_send_timeout      600s;

        	  auth_basic "RESTRICTED ACCESS";
              auth_basic_user_file /etc/nginx/.htpasswd;
      	}
    }

Once you're done, activate your new configuration.

    cp /etc/nginx/sites-available/syncthing.domain.com /etc/nginx/sites-enabled/syncthing.domain.com

#### 3) Set-up password for NGINX

Now we'll need to generate the password file NGINX will utilize to authenticate us against the syncthing frontend. While syncthing offers a separate authentication mechanism, you can't be careful enough!

    sudo sh -c "echo -n 'USERNAME:' >> /etc/nginx/.htpasswd"
    sudo sh -c "openssl passwd -apr1 >> /etc/nginx/.htpasswd"

### Run

First we'll start NGINX

`sudo systemctl start nginx`

then we run syncthing...

`syncthing`

Your syncthing installation should be accessible via

`https://syncthing.domain.com`

## What's next? (Future Posts)

1. Register syncthing as a service
2. Set-up a firewall
3. Store syncthing files, in encrypted archive
