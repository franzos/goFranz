---
title: "Build React Native Android Apps on Guix in 5 Minutes"
summary: "No Docker, no Android Studio. Just Guix and a few commands."
layout: blog
source:
date: 2026-01-12 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - react-native
  - android
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

In a [previous post](/blog/react-native-on-guix), I shared how to set up React Native development on Guix using Docker. It works, but there's a simpler way.

Guix has a neat trick: `guix shell --container --emulate-fhs`. Android SDK binaries expect libraries at standard paths like `/lib64/ld-linux-x86-64.so.2`, which don't exist on Guix. The `--emulate-fhs` flag creates these paths, so cmake, ninja, and the NDK toolchain just work. No Docker required.

## Setup

First, download the Android SDK. Guix packages `sdkmanager` from the F-Droid project:

```bash
export ANDROID_HOME=$PWD/android-sdk
mkdir -p $ANDROID_HOME

guix shell sdkmanager -- sh -c "
  export ANDROID_HOME='$ANDROID_HOME'
  echo y | sdkmanager --licenses
  sdkmanager 'platforms;android-36' 'build-tools;35.0.0' 'ndk;27.1.12297006'
"
```

## Build

Now build your APK or AAB:

```bash
guix shell --container --emulate-fhs --network --pure \
  --share="$HOME/.gradle"="$HOME/.gradle" \
  --share="$ANDROID_HOME"="$ANDROID_HOME" \
  --share="$PWD"="$PWD" \
  openjdk@17:jdk node pnpm coreutils bash grep sed \
  glibc gcc-toolchain zlib which findutils diffutils \
  -- sh -c "
    cd '$PWD'
    export ANDROID_HOME='$ANDROID_HOME'
    export JAVA_HOME=\$(dirname \$(dirname \$(readlink -f \$(which java))))
    unset C_INCLUDE_PATH CPLUS_INCLUDE_PATH CPATH
    pnpm install
    cd android && ./gradlew --no-daemon assembleRelease
"
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

For an AAB (Play Store), use `bundleRelease` instead of `assembleRelease`.

## Run on Device

For live development with hot reload, you need three things: ADB server on the host, Metro bundler, and the app running on your device.

First, download platform-tools and start the ADB server on your host:

```bash
guix shell sdkmanager -- sh -c "
  export ANDROID_HOME='$ANDROID_HOME'
  sdkmanager 'platform-tools'
"

$ANDROID_HOME/platform-tools/adb start-server
$ANDROID_HOME/platform-tools/adb devices  # verify device is connected
```

Start Metro bundler in one terminal:

```bash
guix shell node pnpm -- npx react-native start
```

Run on device in another terminal:

```bash
guix shell --container --emulate-fhs --network --pure \
  --share="$HOME/.gradle"="$HOME/.gradle" \
  --share="$ANDROID_HOME"="$ANDROID_HOME" \
  --share="$PWD"="$PWD" \
  --share=/tmp=/tmp \
  openjdk@17:jdk node pnpm coreutils bash grep sed \
  glibc gcc-toolchain zlib which findutils diffutils \
  -- sh -c "
    cd '$PWD'
    export ANDROID_HOME='$ANDROID_HOME'
    export JAVA_HOME=\$(dirname \$(dirname \$(readlink -f \$(which java))))
    export ADB_SERVER_SOCKET=tcp:localhost:5037
    unset C_INCLUDE_PATH CPLUS_INCLUDE_PATH CPATH
    npx react-native run-android
"
```

The key additions here:
- `--share=/tmp=/tmp` shares the tmp directory where ADB stores socket info
- `ADB_SERVER_SOCKET=tcp:localhost:5037` tells ADB inside the container to connect to the host's running server instead of starting its own

The app will build, install to your device, and connect to Metro for live reload.

## What's happening?

A few key flags make this work:

- `--emulate-fhs` creates `/lib64/ld-linux-x86-64.so.2` and standard FHS paths that Android SDK binaries expect
- `--pure` gives you a clean environment without inherited variables
- `--network` allows Gradle to download dependencies
- `unset C_INCLUDE_PATH` is extra insurance against header conflicts

The container shares your gradle cache, SDK, and project directory, so subsequent builds are fast.

## Signed Release

For a signed release, pass the keystore details as Gradle properties:

```bash
guix shell --container --emulate-fhs --network --pure \
  --share="$HOME/.gradle"="$HOME/.gradle" \
  --share="$ANDROID_HOME"="$ANDROID_HOME" \
  --share="$PWD"="$PWD" \
  --share="/path/to/keys"="/path/to/keys" \
  openjdk@17:jdk node pnpm coreutils bash grep sed \
  glibc gcc-toolchain zlib which findutils diffutils \
  -- sh -c "
    cd '$PWD'
    export ANDROID_HOME='$ANDROID_HOME'
    export JAVA_HOME=\$(dirname \$(dirname \$(readlink -f \$(which java))))
    unset C_INCLUDE_PATH CPLUS_INCLUDE_PATH CPATH
    pnpm install
    cd android && ./gradlew --no-daemon \
      -PMYAPP_UPLOAD_STORE_FILE=/path/to/keys/release.keystore \
      -PMYAPP_UPLOAD_STORE_PASSWORD=yourpassword \
      -PMYAPP_UPLOAD_KEY_ALIAS=youralias \
      -PMYAPP_UPLOAD_KEY_PASSWORD=yourpassword \
      -PuseReleaseSigning=true \
      bundleRelease
"
```

## Troubleshooting

**Gradle permission errors**: If you've previously run Docker builds as root, the gradle cache may have wrong permissions:
```bash
sudo rm -rf ~/.gradle/native/
```

**CMake crashes (exit 139)**: Re-download the SDK cmake:
```bash
rm -rf android-sdk/cmake
# It re-downloads on next build
```

**Header conflicts / stubs-32.h errors**: Make sure you're using `--pure` and unsetting the C include paths.

## Conclusion

This approach eliminates Docker from the React Native build process on Guix. The FHS container gives you the compatibility you need, while keeping everything in user space. Build times are comparable to Docker, and you have one less layer to debug.
