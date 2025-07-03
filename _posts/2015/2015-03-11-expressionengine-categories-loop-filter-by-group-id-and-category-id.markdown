---
layout: blog
title:  "ExpressionEngine categories loop: Filter by group_id and category_id"
date:   2015-03-11 08:00:00
summary: "Only show catgories in category_group 2 and exclude category with category_id 68"
categories: ExpressionEngine
category:
  - dev
tags:
  - development
  - database
  - cms
version: 2.9.1
packages: ExpressionEngine
source:
sourcetitle:
---

In this example, we would like to achieve two things:

1. Only show categories in category_group 2
2. Exclude the category with category_id 68

```<div class="form-group">
  <label for="title">Categories</label>
  <select name="category[]" id="categories">
    {categories show_group="2"}
      {if {category_id} != 68}
        <option value="{category_id}"{selected}>
          {category_name}
        </option>
      {/if}
    {/categories}
  </select>
</div>
```
