---
title: "React Native (and Android Development) on Guix"
summary: "React Native development on Guix, without Android Studio using Docker."
layout: blog
source:
date: 2025-7-7 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - claude
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

This is a quick one. Android and React Native development on Guix can be a bit of a pain, despite a few packages being available to improve the situation. I figured I would put my development environment into Docker, so I can run it on Guix without having to deal with Android Studio and the like.

## Setup

Here's the Dockerfile:

```Dockerfile
FROM reactnativecommunity/react-native-android:latest

# Set environment variables
ENV ANDROID_SDK_ROOT=/opt/android-sdk-linux
ENV PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    libsecret-tools \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Install specific SDK components if needed
RUN sdkmanager "platforms;android-33" "build-tools;33.0.0"

# Set up working directory
WORKDIR /app

# Create a script to handle ADB connection to host
RUN echo '#!/bin/bash\n/usr/local/android-sdk/platform-tools/adb -H host.docker.internal "$@"' > /usr/local/bin/adb \
    && chmod +x /usr/local/bin/adb
```

This is a pretty straightforward setup, using the up-to-date community image `reactnativecommunity/react-native-android:latest`.

The `docker-compose.yml` file is also simple:

```yaml
version: '3.8'
services:
  setup:
    build:
      context: .
      dockerfile: android.Dockerfile
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    command: >
      bash -c "npm install"
    tty: true
    stdin_open: true

  bundler:
    build:
      context: .
      dockerfile: android.Dockerfile
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    ports:
      - "8081:8081" # Metro bundler port
    environment:
      - REACT_NATIVE_PACKAGER_HOSTNAME=host.docker.internal
    command: >
      bash -c "npx react-native start --host 0.0.0.0 --reset-cache"
    tty: true
    stdin_open: true

  # Android development service
  android:
    build:
      context: .
      dockerfile: android.Dockerfile
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - android_cache:/root/.android
    environment:
      - REACT_NATIVE_PACKAGER_HOSTNAME=host.docker.internal
    network_mode: "host" # Needed for USB device access and ADB
    privileged: true # Required for USB device access
    command: bash -c "adb devices && npm run android && tail -f /dev/null"

  # Android development service
  android_build:
    build:
      context: .
      dockerfile: android.Dockerfile
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - android_cache:/root/.android
      # ADJUST THIS BASED ON HOST MACHINE
      - /run/media/franz/.d-crate/dev/Keys:/keys
    environment:
      - REACT_NATIVE_PACKAGER_HOSTNAME=host.docker.internal
    env_file:
      - .prod.env
    network_mode: "host" # Needed for USB device access and ADB
    privileged: true # Required for USB device access
    command: bash -c "npx react-native build-android --mode=release"

volumes:
  node_modules:
  android_cache:
```

A couple of points:

- `REACT_NATIVE_PACKAGER_HOSTNAME=host.docker.internal` overrides the default hostname.
- `/run/media/franz/.d-crate/dev/Keys:/keys` mounts the production keys to the container.
- `.prod.env` tells `gradlew` where to find the keystore, alias, and password for signing the APK.

## Usage

To use this setup effectively:

1.  Run setup: `docker-compose run setup`
2.  Start the Metro bundler: `docker-compose up bundler`
3.  Connect your Android device via USB and run: `docker-compose up android`

At this point, you have a working React Native development environment on Guix using Docker. If you have trouble connecting your device via `adb`, simply relaunch the `android` service; It should prompt you to allow USB debugging on your device.

Once you're happy with the result, build the production APK with:

```bash
docker-compose run android_build
```

## Debugging

The Metro Bundler has trouble with the Docker environment, so if you want to debug the application, this script might be useful:

```bash
#!/bin/sh

CODESPACE="http://localhost:8081"
WS_DEBUGGER_URL="/$(curl -s "$CODESPACE/json" | jq -r '.[-1].webSocketDebuggerUrl' | cut -d'/' -f4-)"
ENCODED_URL="$(python3 -c "import urllib.parse;print(urllib.parse.quote('$WS_DEBUGGER_URL'))")"
DEVTOOLS_URL="$CODESPACE/debugger-frontend/rn_fusebox.html?ws=$ENCODED_URL"

# Enter the URL in the browser
echo $DEVTOOLS_URL

# Uncomment the line below to open the URL in Chrome automatically
# open -a Chrome "$DEVTOOLS_URL"
```

## Conclusion

This setup allows you to develop React Native applications on Guix without the hassle of installing Android Studio or dealing with its dependencies. It leverages Docker to create a clean, isolated environment, making it easier to manage your development workflow. Enjoy! :)