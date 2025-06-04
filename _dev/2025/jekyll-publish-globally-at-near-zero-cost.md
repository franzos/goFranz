---
title: "Jekyll: Publish Globally at Near-Zero Cost"
summary: "How to use Jekyll to publish content globally, in multiple languages, with virtually no maintenance or vendor lock-in and at near zero-cost."
layout: post
source:
date: 2025-5-30 0:00:00 +0000
category:
  - Tools
tags:
  - jekyll
  - aws
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Static site generators like Jekyll are great tools for companies to publish content globally, in multiple languages, with virtually no maintenance or vendor lock-in and at near zero-cost. In this post, I hope to share some ideas that are easy to replicate across various platforms, and needs.

Ingredients:
1. A static site generator
2. A code editor
3. A git hosting service; ideally with built-in CI/CD like GitLab
2. A hosting platform like AWS S3 with CloudFront

### 1. Static Site Generator

For this particular client, we've been relying on Jekyll from the very start. Initially we've only had a German website, but soon started adding new countries, with more languages; For example:

- Germany (de): `.de`
- Austria (de): `.at`
- Spain (es): `.es`
- France (fr): `.fr`
- Europe (en): `.eu` - A more "global" version

#### Configuration

Each country and language, runs on their own domain, and comes with their own Jekyll configuration that defines the most important, global parameters like:

- Site ID (for contat forms)
- Site name
- Social media links
- Translated navigation
- Contract information

Here's an excerpt for Germany:

```yaml
lang: de
country: de
identifier: de-de
id: 3

# Output settings
# this is for the homepage
show_presse_international: true
show_presse_internal: true

# Generate entries dated in the future
future: true

navigation:
  - title: Unternehmen
    url: /unternehmen/
    section: company
    dropdown: true
  - title: Services & Produkte
    url: /services-und-produkte/
    section: services
    dropdown: true
  - title: Standorte
    url: /standorte/
    section: standorte
  - title: Franchise
    url: /franchise/
    section: franchise
  - title: Download
    url: /download/
    section: downloads
    dropdown: true

links:
  aktuelles: /unternehmen/aktuelles/
  internes: /unternehmen/aktuelles/

collections:
  pages:
    sort_by: position
    output: true
  presse:
    sort_by: date
    output: true
    permalink: /presse/:name/
  presse_international:
    sort_by: date
  jobs:
    output: true
    permalink: /unternehmen/jobs/:title/
  franchise:
    sort_by: position
    output: true

defaults:
  - scope:
      path: "_presse/de-de"
    values:
      identifier: "de-de"
  - scope:
      path: "_pages/de-de"
    values:
      identifier: "de-de"
  - scope:
      path: "_jobs/de-de"
    values:
      identifier: "de-de"
```

and France:

```yaml
lang: fr
country: fr
identifier: fr-fr
id: 37

# Output settings
# this is for the homepage
show_presse_international: true
show_presse_internal: true

# Generate entries dated in the future
future: true

navigation:
  - title: Entreprise
    url: /entreprise/
    section: company
    dropdown: true
  - title: Services et produits
    url: /services-et-produits/
    section: services
    dropdown: true
  - title: Sites
    url: /sites/
    section: standorte
  - title: Télécharger
    url: /telecharger/
    section: downloads
    dropdown: true

collections:
  pages:
    sort_by: position
    output: true
  presse:
    sort_by: date
    output: true
    permalink: /press/:name/
  presse_international:
    sort_by: date
  jobs:
    output: true
    permalink: /entreprise/offres-demploi/:title/
  franchise:
    sort_by: position
    output: true

links:
  aktuelles: /entreprise/actualites/
  internes: /entreprise/actualites/

defaults:
  - scope:
      path: "_presse/fr-fr"
    values:
      identifier: "fr-fr"
  - scope:
      path: "_pages/fr-fr"
    values:
      identifier: "fr-fr"
  - scope:
      path: "_jobs/fr-fr"
    values:
      identifier: "fr-fr"
```

Here's what this looks like, in all it's glory:

![Jekyll: Publish Globally at Near-Zero Cost](/assets/images/dev/jekyll-publish-globally-at-near-zero-cost_config.png)

#### Translations and Content

For translations, we've chosen a very rudimentary approach which could be improved, but has worked well enough over the years.

There's a `translation.yml` that contains global translations like salutations, common headings and such:

```yaml
land:
  de: Land
  es: País
  en: Country
  se: Land
  fi: Maa
  et: Riik
  fr: Pays
mobil:
  de: Mobil
  es: Móvil
  en: Mobile
  se: Mobil
  fi: Matkapuhelin
  et: Mobiil
  fr: Mobile
telefon:
  de: Telefon
  es: Teléfono
  en: Telephone
  se: Telefon
  fi: Puhelin
  et: Telefon
  fr: Téléphone
```

Each country has folders for things like pages (`_pages`), press releases (`_presse`) and jobs (`_jobs`):

![Jekyll: Publish Globally at Near-Zero Cost](/assets/images/dev/jekyll-publish-globally-at-near-zero-cost_pages.png)

Here's what pages look like in Germany:

![Jekyll: Publish Globally at Near-Zero Cost](/assets/images/dev/jekyll-publish-globally-at-near-zero-cost_pages_germany.png)

Pages are totally flexible in what they contain; Most are markdown formatted, others are HTML. Here's a really simple example for a contact page:

```markdown
---
layout: page
title: Kontakt
cover: 'kontakt.jpg'
enquiryForm: false
permalink: /kontakt/
---
{% raw %}{%
  include templates/text.html
  content="Sie haben Fragen zu unseren Services oder hätten gerne mehr Infos? Benutzen Sie dafür gerne dieses Formular. Wir bemühen uns, Ihnen innerhalb von zwei Arbeitstagen zu antworten, bzw. Kontakt zu Ihnen aufzunehmen. Selbstverständlich können Sie auch unsere Hotline <a href='tel:0800 000000'>0800 000000</a> nutzen."  
%}

{%
  include templates/text.html
  content="Mit einem * Sternchen gekennzeichnete Felder sind Pflichtfelder."  
%}

{% include snippets/form_contact.html %}{% endraw %}
```

and a tank you page:

```markdown
---
layout: page_md
title: "Vielen Dank"
cover: 'kontakt.jpg'
enquiryForm: false
serviceCloud: false
permalink: /danke/
lang: de
---

### Vielen Dank für Ihre Nachricht.

Wir werden uns in Kürze bei Ihnen melden. 
```

#### Themes

As you've probably noticed, we also added the option to use HTML templates, that are easy to edit globally.

```markdown
{% raw %}{%
  include templates/text.html
  content="Mit einem * Sternchen gekennzeichnete Felder sind Pflichtfelder."  
%}{% endraw %}
```

is a very simple template which looks like this:

```html
<div class="content">
  <p>{{ include.content }}</p>
</div>
```

There's more complex examples, like:

```html
<article class="media is-center mt-1">
  <figure class="media-left">
    <p class="image is-24x24">
      <img src="{{ site.url }}/assets/images/icons/zeit.png">
    </p>
  </figure>
  <div class="media-content">
    <div class="content list-item">
      <p>
        <span class="item-label"><b>{{ include.date }}</b></span>
        <span class="item-content">{{ include.content }}</span>
      </p>
    </div>
  </div>
</article>
```

The goal was, to make it easy to make changes across countries, without having to modify the content. We've also found that it's somewhat easier for non-technical users, to learn the liquid syntax, rather than to work with HTML directly. A preview of the individual templates is available, and looks like this:

![Jekyll: Publish Globally at Near-Zero Cost](/assets/images/dev/jekyll-publish-globally-at-near-zero-cost_templates.png)

### 2. Code Editor

To keep the cognitive load low, we've decided to use GitLab built-in editor to modify the content. This has worked surprisingly well, and comes with the benefit that every change translates into a git commit, and can be automatically deployed to a preview environment. More on this later.

### 3. Git Hosting Service

As mentioned, we've decided to use GitLab because it comes with all the features we needed:

- Editor
- CI/CD
- Merge requests (for review workflows)
- Issues (for tracking requests)

Even though GitLab itself is quite heavy, the instance hosts many other repositories, so the cost is negligible (less than 10 EUR per month).

Here's what the usual workflow looks like:

1. Editor makes a change via the built-in editor
2. Change is committed to the repository
3. A deployment pipeline is triggered to a preview environment `preview.domain.com`

Once the editor is happy, they can deploy the changes to the individual countries:

![Jekyll: Publish Globally at Near-Zero Cost](/assets/images/dev/jekyll-publish-globally-at-near-zero-cost_deployment.png)

The `.gitlab-ci.yml` file contains the deployment pipelines for each country, and the preview environment:

```yaml
filtafry_at:
  stage: deploy
  script:
    - export CI_ENVIRONMENT_NAME="$(echo "$CI_ENVIRONMENT_NAME")"
    - npm ci --cache .npm --prefer-offline
    - npm run build:production
    - export AWS_S3_BUCKET=www.filtafry.at
    - export AWS_AWS_CLOUDFRONT_DISTRIBUTION_ID
    - export AWS_ACCESS_KEY_ID="$(echo "$AWS_ACCESS_KEY_ID")"
    - export AWS_SECRET_ACCESS_KEY="$(echo "$AWS_SECRET_ACCESS_KEY")"
    - aws s3 sync _site/ s3://${AWS_S3_BUCKET} --delete
    - aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
  environment:
    name: austria_de
    url: https://www.filtafry.at
  when: manual
  only:
    - master

preview_filtafry_at:
  stage: deploy
  script:
    - export CI_ENVIRONMENT_NAME="$(echo "$CI_ENVIRONMENT_NAME")"
    - npm ci --cache .npm --prefer-offline
    - npm run build:production
    - export AWS_S3_BUCKET=preview.filtafry.at
    - export AWS_ACCESS_KEY_ID="$(echo "$AWS_ACCESS_KEY_ID")"
    - export AWS_SECRET_ACCESS_KEY="$(echo "$AWS_SECRET_ACCESS_KEY")"
    - aws s3 sync _site/ s3://${AWS_S3_BUCKET} --delete
  environment:
    name: preview_austria_de
    url: http://preview.filtafry.at
  when: manual
  only:
    - master
```

The deployment automatically invalidates the CloudFront cache, so that the changes are immediately visible.

### 4. Hosting Platform

For the hosting, we've chosen AWS S3 with CloudFront. The domains, buckets and distributions are configured manually, since they don't change often; This is all pretty standard stuff, so I won't go into details here. The cost for individual countries amounts to a few cents per month, depending on traffic.

Forms are handled via [Formshive](/work/rusty-forms/).

### Summary

We've been working with this setup for a number of years now:
- None of these sites have ever been down
- They always load fast (straight from CDN)
- Google indexes them without issues