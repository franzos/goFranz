---
title: "Cloudfront Supports Functions"
layout: base
source:
date: 2025-6-24 0:00:00 +0000
category:
  - Tools
tags:
  - cloudfront
  - guix
author: Franz Geffke
---

Today I learned, that Cloudfront supports functions, which are lightweight, serverless functions that can be used to manipulate requests and responses at the edge.

I needed this to redirect old blog paths to new ones; I would have previously relied on S3 to handle this, but writing a bit of JS code is much more convenient.

```js
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri.startsWith('/gist/') || uri.startsWith('/dev/')) {
        var newUri = uri.replace(/^\/(gist|dev)\//, '/blog/');
        
        var response = {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { 'value': newUri }
            }
        };
        return response;
    }
    
    return request;
}
```