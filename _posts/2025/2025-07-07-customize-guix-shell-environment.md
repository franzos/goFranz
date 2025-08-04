---
title: "Customize Guix Shell Environment"
summary: "A short guide on how to set environment variables like OPENSSL_DIR within a Guix shell manifest for project-specific development environments."
layout: blog
source:
date: 2025-7-7 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - shell
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I run Guix on my laptop and do virtually all my development on it. Guix comes with a beautiful shell environment that allows you to cleanly isolate dependencies for specific projects. Unlike traditional distributions like Debian, Guix does things a little differently, and I sometimes find myself needing to customize the shell environment for specific projects.

## Shell Environments

Here's how you can spawn a Rust development environment:

```bash
guix shell rust rust-cargo gcc-toolchain openssl
```

The problem comes when any crate relies on `openssl`. The workaround is usually as simple as exporting an environment variable:

```bash
export OPENSSL_DIR=$(dirname $(dirname $(realpath $(which openssl))))
```

## Shell Environments from Manifests

This quickly gets repetitive. Luckily, Guix has a nice feature that allows you to write manifests, from which you can spawn shell environments like so:

```bash
guix shell -m manifest.scm
```

A manifest is a simple scheme file that lists all required packages. Here's an example:

```scheme
(specifications->manifest '("rust" "rust-cargo" "gcc-toolchain" "openssl"))
```

Now the idea is simple: why don't we use that manifest to also set the `OPENSSL_DIR` environment variable?

After some attempts, I came up with this:

```scheme
(use-modules (guix profiles)
             (guix packages)
             (guix search-paths)
             (gnu packages rust)
             (gnu packages rust-apps)
             (gnu packages commencement)
             (gnu packages tls))

;; Create a custom OpenSSL package that exports OPENSSL_DIR pointing to itself
(define openssl-with-env-dir
  (package
    (inherit openssl)
    (name "openssl")
    (native-search-paths
     (append (package-native-search-paths openssl)
             (list (search-path-specification
                    (variable "OPENSSL_DIR")
                    (files '("."))
                    (file-type 'directory)
                    (separator #f)))))))

;; Create a custom GCC package that exports CC
(define gcc-with-env-cc
  (package
    (inherit gcc-toolchain)
    (name "gcc-toolchain")
    (native-search-paths
     (append (package-native-search-paths gcc-toolchain)
             (list (search-path-specification
                    (variable "CC")
                    (files '("bin/gcc"))
                    (file-type 'regular)
                    (separator #f)))))))

(packages->manifest
 (list rust
       rust-cargo
       gcc-with-env-cc
       openssl-with-env-dir))
```

When you spawn a shell from this manifest, `OPENSSL_DIR` will point to the correct location.

## Conclusion

Guix _can_ get in the way sometimes, but if you have some patience to learn, these are one-time problems.