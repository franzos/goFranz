---
title: "Supercharge Guix Shell with direnv"
summary: "How to automatically activate Guix shell environments when entering a project directory using direnv."
layout: blog
source:
date: 2025-12-07 0:00:00 +0000
category:
  - Tools
tags:
  - guix
  - shell
  - direnv
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

In a [previous post](/blog/customize-guix-shell-environment), I showed how to customize Guix shell environments using manifests. The approach works, but requires you to manually run `guix shell -m manifest.scm` every time you enter a project. That gets old fast.

Enter direnv.

## What is direnv?

direnv is a shell extension that loads and unloads environment variables based on the current directory. When you `cd` into a project with an `.envrc` file, direnv automatically sets up the environment. When you leave, it cleans up.

For Guix users, this means automatic shell environments per project - no more typing `guix shell` every time.

## Setup

First, install direnv. On Guix, add it to your profile or system packages:

```scheme
(packages
 (cons* direnv
        ;; your other packages
        %base-packages))
```

Then, hook direnv into your shell. Add the following to your `.bashrc`:

```bash
# direnv (.envrc)
_direnv_hook() {
  local previous_exit_status=$?;
  trap -- '' SIGINT;
  eval "$(direnv export bash)";
  trap - SIGINT;
  return $previous_exit_status;
};
if [[ ";${PROMPT_COMMAND[*]:-};" != *";_direnv_hook;"* ]]; then
  if [[ "$(declare -p PROMPT_COMMAND 2>&1)" == "declare -a"* ]]; then
    PROMPT_COMMAND=(_direnv_hook "${PROMPT_COMMAND[@]}")
  else
    PROMPT_COMMAND="_direnv_hook${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
  fi
fi
```

Restart your shell or run `source ~/.bashrc`.

## Simple Example

For projects with straightforward dependencies, a one-liner `.envrc` does the trick:

```bash
# Guix development environment with node and pnpm
eval "$(guix shell node pnpm --search-paths)"
```

When you `cd` into this directory, direnv will prompt you to allow the `.envrc`:

```bash
direnv: error .envrc is blocked. Run `direnv allow` to approve its content.
```

Run `direnv allow` once, and you're set. Every subsequent visit automatically loads the environment.

## Complex Example with Manifests

For projects with custom package configurations (like the OpenSSL trick from my previous post), combine direnv with a manifest:

Create a `manifest.scm`:

```scheme
(use-modules (guix profiles)
             (guix packages)
             (guix search-paths)
             (gnu packages node)
             (gnu packages rust)
             (gnu packages commencement)
             (gnu packages tls)
             (gnu packages databases))

;; Create a custom OpenSSL package that exports OPENSSL_DIR
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

;; Create a custom GCC package that exports CC and LD_LIBRARY_PATH
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
                    (separator #f))
                   (search-path-specification
                    (variable "LD_LIBRARY_PATH")
                    (files '("lib"))
                    (file-type 'directory)
                    (separator ":")))))))

(packages->manifest
 (list node
       pnpm
       rust
       (list rust "cargo")
       rust-analyzer
       gcc-with-env-cc
       openssl-with-env-dir
       postgresql))
```

Then reference it in your `.envrc`:

```bash
# Guix development environment
if [[ -d /run/current-system ]]; then
  eval "$(guix shell -m manifest.scm --search-paths)"
fi
```

The `/run/current-system` check ensures this only runs on Guix systems - useful if you share your project with developers on other distros.

## Conclusion

The combination of direnv and Guix shell environments removes the friction from project-specific tooling. You define your dependencies once, and they're automatically available whenever you work on the project.
