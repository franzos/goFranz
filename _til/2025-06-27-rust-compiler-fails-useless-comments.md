---
title: "Rust Compiler Fails on Useless Comments"
layout: post
source:
date: 2025-6-24 0:00:00 +0000
category:
  - Tools
tags:
  - cloudfront
  - guix
author: Franz Geffke
---

Today I learned, that rust compiler will fail, if your comments are useless.

```bash
error: expected item after doc comment
   --> tests/subscription_paid_to_free_downgrade_test.rs:577:1
    |
442 | /// Test edge case: Multiple paid-to-free downgrade attempts
    | ------------------------------------------------------------ other attributes here
...
577 | /// Test edge case: Paid-to-free downgrade with immediate paid upgrade
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ this doc comment doesn't document anything
```