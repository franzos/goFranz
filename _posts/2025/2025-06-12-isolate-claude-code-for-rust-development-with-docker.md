---
title: "Isolate Claude Code for Rust Development with Docker"
summary: "A simple setup to use Claude Code in a Docker container for Rust development with VSCode."
layout: blog
source:
date: 2025-6-12 0:00:00 +0000
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

I have recently started using Claude Code more frequently, and was wondering whether there's a good solution to isolate it: Docker, of course.

### Setup

It's simple with VSCode:

1. Make sure you have the Dev Containers extension installed
<br/>`ms-vscode-remote.remote-containers`
 
2. Create a new directory `.devcontainer`

3. Add a `.devcontainer/devcontainer.json` file:

    ```json
    {
      "name": "Your Project Name - Rust & Claude Code",
      "customizations": {
        "vscode": {
          "settings": {
            "terminal.integrated.shell.linux": "/bin/bash"
          },
          "extensions": [
            // Cline for precision adjustments
            "saoudrizwan.claude-dev",
            // WakaTime for tracking coding time
            "wakatime.vscode-wakatime",
            // Copilot for autocompletion
            "github.copilot",
            "github.copilot-chat",
            // Rust analyzer for code analysis
            "rust-lang.rust-analyzer",
            // Rust/C++ debugger
            "vadimcn.vscode-lldb"
          ]
        }
      },
      "build": {
        "dockerfile": "Dockerfile"
      },
      "workspaceMount": "source=${localWorkspaceFolder},target=/app,type=bind,consistency=delegated",
      "workspaceFolder": "/app",
      "remoteUser": "dev",
      "mounts": [
        "source=claude-code-bashhistory,target=/commandhistory,type=volume",
        "source=claude-code-config,target=/home/dev/.claude,type=volume"
      ],
      "remoteEnv": {
        "CLAUDE_CONFIG_DIR": "/home/dev/.claude"
      }
    }
    ```

Notes:
- The `workspaceFolder` is set to `/app` - The working directory in the Docker container.
- The `remoteUser` is set to `dev` - The user created in the Dockerfile.
- The `mounts` section creates two volumes: one for the command history and one for the Claude configuration. This allows you to persist your Claude settings and command history across container restarts.

_PS: As you can tell, I'm using multiple LLM extensions: Copilot is good for autocomplete, Cline for precision._

4. Add a `.devcontainer/Dockerfile` in the same directory with the following content:

    ```dockerfile
    # Base image with Rust and common tools
    FROM rust:latest

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
        nodejs \
        npm \
        ripgrep \
        ca-certificates \
        libpq-dev \
        libgtk-3-dev \
        libatk1.0-dev \
        libjavascriptcoregtk-4.1-dev \
        libsoup-3.0-dev \
        libpango1.0-dev \
        libwebkit2gtk-4.1-dev \
        libxdo-dev \
        && rm -rf /var/lib/apt/lists/*

    # Create a non-root user (optional but recommended)
    ARG USERNAME=dev
    ARG USER_UID=1000
    ARG USER_GID=$USER_UID

    RUN groupadd --gid $USER_GID $USERNAME \
        && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
        && chown -R $USERNAME /home/$USERNAME

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

    # Install Rust Tooling
    RUN cargo install --locked watchexec-cli
    RUN rustup component add rustfmt
    ```

You should adapt this to your needs, and project-requirements (dependencies etc.).

Notes:
- I use the user `dev` in the container
- The working directory is `/app`
- This is a Rust (`dioxus`) project.

### Why this helps

- **Isolation**: Claude remains sandboxed in Docker.  
- **Persistence**: Bash history and Claude live in Docker volumes and don't pollute your local environment.
- **Reproducibility**: You have a predictable environment that you can commit to git*

*It makes sense to pin the Docker image to a specific version.

### Conclusion

I’m just getting started with VS Code dev containers, so this is a basic setup that will likely evolve. It already makes Rust development on Guix much easier, since `rust-analyzer-proc-macro-srv` [isn’t yet included upstream](https://issues.guix.gnu.org/70690).

**Update: 2025-06-19**

Published a follow-up: [Automate testing with Docker Compose and Claude Code](/dev/automate-testing-with-docker-compose-and-claude-code/)