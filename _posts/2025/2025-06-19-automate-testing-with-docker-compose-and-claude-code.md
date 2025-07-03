---
title: "Automate testing with Docker Compose and Claude Code"
summary: "Use Claude Code to write tests for your Docker Compose based project, and run them automatically."
layout: blog
source:
date: 2025-6-19 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - claude
  - security
  - docker
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

This is a follow-up to my article on how-to [Isolate Claude Code for Rust Development with Docker](/blog/isolate-claude-code-for-rust-development-with-docker/). This time I want to show you how easy it is to automate testing with Claude Code and your existing Docker Compose setup.

If you haven’t read the previous article, go back and have a look.

### Setup

This assumes Dev Containers are already set up. There are at least two options when running Claude Code in a Dev Container:

1. Give Claude access to the Docker socket so it can run tests in any container of your `docker-compose.yml` project.
2. Share a network with your existing Docker Compose project so Claude can write tests that rely on API access.

The first option is more powerful but significantly less secure.

#### Give Claude Code access to Docker

1. To give Claude Code access to your host’s Docker socket, add this to your `devcontainer.json`:

    ```json
    "remoteUser": "vscode",
    "features": {
        "ghcr.io/devcontainers/features/docker-outside-of-docker:1": {}
    }
    ```

2. For this to work, swap your `Dockerfile` base image and switch to the `vscode` user the image supplies by default. Here's what it looks like:

    ```dockerfile
    # Base image with Rust and common tools
    FROM mcr.microsoft.com/devcontainers/rust:latest

    # Set working dir
    WORKDIR /app

    ENV DEVCONTAINER=true

    # Install extra packages if needed (you can customize as required)
    RUN apt-get update && apt-get install -y \
        pkg-config \
        libssl-dev \
        lldb \
        curl \
        git \
        vim \
        npm \
        ripgrep \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*

    # User should be in the base image; This is just to be sure.
    ARG USERNAME=vscode
    ARG USER_UID=1000
    ARG USER_GID=$USER_UID

    # Create the user if it doesn't exist
    RUN id -u $USERNAME 2>/dev/null || ( \
        groupadd --gid $USER_GID $USERNAME && \
        useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    ) && chown -R $USERNAME:$USERNAME /home/$USERNAME

    # Ensure default node user has access to /usr/local/share
    RUN mkdir -p /usr/local/share/npm-global && \
      chown -R $USERNAME:$USERNAME /usr/local/share

    # Create workspace and config directories and set permissions
    RUN mkdir -p /app /home/$USERNAME/.claude && \
        chown -R $USERNAME:$USERNAME /app /home/$USERNAME/.claude

    ##### Setup RUST environment
    RUN mkdir -p /app/target \
        && chown -R $USERNAME:$USERNAME /app
    ###

    # Set user
    USER $USERNAME

    # Install global packages
    ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
    ENV PATH=$PATH:/usr/local/share/npm-global/bin

    RUN npm install -g @anthropic-ai/claude-code
    RUN npm install -g pnpm

    # Install Rust Tooling
    RUN cargo install --locked watchexec-cli
    RUN rustup component add rustfmt
    ```

3. Make sure your Docker Compose project stays up; for example:

    ```yml
    version: '3'

    services:
      formshive_db:
        restart: unless-stopped
        image: postgres:16
        container_name: formshive_db
        environment:
          - POSTGRES_PASSWORD=postgres
          - POSTGRES_USER=postgres
          - POSTGRES_DB=primaryDatabase

      formshive_redis:
        restart: unless-stopped
        image: redis:7
        container_name: formshive_redis
        command: redis-server --appendonly yes --stop-writes-on-bgsave-error no

      formshive:
        build:
          context: .
          dockerfile: .docker/Dockerfile
        container_name: formshive
        depends_on:
          - formshive_db
          - formshive_redis
        command: watchexec --restart --watch src --watch migrations --watch build.rs --watch Cargo.toml --exts rs,toml,sql -- cargo run
    ```

4. Show Claude how to run the tests:

    ```bash
    docker exec -it formshive cargo test
    ```

To make this work, manually run your project with `docker-compose up` outside the container to ensure mounts work as expected.

#### Expose the API to Claude Code

1. Add this to your `devcontainer.json`:

    ```json
    "runArgs": ["--network=appsuite"]
    ```

2. Reference the network in `docker-compose.yml`:

    ```yml
    services:
      rusty_common:
        build:
          context: .
          dockerfile: .docker/Dockerfile
        container_name: rusty_common
        networks:
          - appsuite

    networks:
      appsuite:
        external: true
    ```

Now the Dev Container is on the same network as your Docker Compose project, so Claude Code can write tests that rely on API access.