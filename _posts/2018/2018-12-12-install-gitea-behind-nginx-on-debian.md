---
title: "Gitea behind nginx on Debian"
summary: "Quick setup guide for Gitea 1.6.1 running with supervisor on Debian 9.x, using nginx reverse proxy and LetsEncrypt SSL."
layout: blog
date: 2018-12-12 00:00:00 +0200
category:
  - dev
tags:
  - gitea
  - debian
  - nginx
  - git
---

I don't really have time to write-up something detailed but this should get you, to where you want to be:

1. Gitea 1.6.1 running using supervisor on Debian 9.x
2. nginx reverse proxy
3. LetsEncrypt

## Instructions

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install git nginx certbot supervisor -y
sudo adduser --disabled-login --gecos 'gitea' git
wget -O gitea https://dl.gitea.io/gitea/1.6.1/gitea-1.6.1-linux-amd64
chmod +x gitea
mkdir -p custom/conf
mkdir data
exit
sudo mkdir /var/log/gitea
sudo nano /etc/supervisor/conf.d/gitea.conf
```

Add this to `gitea.conf`:

```
[program:gitea]
directory=/home/git/
command=/home/git/gitea web
autostart=true
autorestart=true
startsecs=10
stdout_logfile=/var/log/gitea/stdout.log
stdout_logfile_maxbytes=1MB
stdout_logfile_backups=10
stdout_capture_maxbytes=1MB
stderr_logfile=/var/log/gitea/stderr.log
stderr_logfile_maxbytes=1MB
stderr_logfile_backups=10
stderr_capture_maxbytes=1MB
environment = HOME="/home/git", USER="git"
```

```bash
sudo service supervisor restart
sudo systemctl stop nginx
sudo certbot certonly --standalone --email email@yourdomain.com -d git.yourdomain.com
sudo nano /etc/nginx/sites-available/git.yourdomain.com
```

Add this to `git.yourdomain.com`:

```
server{
		listen 80;
        server_name git.yourdomain.com;
        return 301 https://git.yourdomain.com$request_uri;
}

server{
        listen 443;
        ssl on;
        server_name git.yourdomain.com;
        ssl_certificate /etc/letsencrypt/live/git.yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/git.yourdomain.com/privkey.pem;
        location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_set_header Host             $host;
                proxy_set_header X-Real-IP        $remote_addr;
                proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
                client_max_body_size 100M;
        }
}
```

Symlink the config, start nginx.

```bash
sudo ln -s /etc/nginx/sites-available/git.yourdomain.com /etc/nginx/sites-enabled/
sudo systemctl start nginx
```

That's it. Visit your site at git.yourdomain.com.