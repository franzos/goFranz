---
layout: post
title:  "ExpressionEngine PHP Error: Non-static method should not be called statically"
date:   2015-04-09 08:00:00
summary: "Message: Non-static method Mx_calc::usage() should not be called statically, assuming $this from incompatible context"
categories: PHP
category:
  - dev
tags:
  - development
  - database
  - troubleshooting
version: 2.9.2
packages: PHP
source: "https://support.ellislab.com/bugs/detail/20352/plugins-through-php-warning-with-strict-errors-on"
sourcetitle: "Plugins through PHP warning with strict errors on…. "
---

### Problem

    A PHP Error was encountered
    Severity: 8192
    Message: Non-static method Mx_calc::usage() should not be called statically, assuming $this from incompatible context
    Filename: mx_calc/pi.mx_calc.php
    Line Number: 20

and

    A PHP Error was encountered
    Severity: Warning
    Message: Cannot modify header information - headers already sent by (output started at PATH/system/codeigniter/system/core/Exceptions.php:170)
    Filename: core/Common.php
    Line Number: 479

### Solution

In this case, we need to modify Mx_calc, as stated in the error message:

1. Go to /system/expressionengine/third_party/mx_calc/pi.mx_calc.php
2. Look for **function usage()** around line 61
3. Replace it with **public static function usage()**

#### Before

    function usage()
    {
    ob_start();
    ?>

#### After

    public static function usage()
    {
    ob_start();
    ?>
