---
title: "How-To connect FreeIPA LDAP with GitLab"
layout: post
date: 2018-07-24 00:00:00 +0200
category:
  - ldap
tags:
  - sso
  - gitlab
  - ldap
  - freeipa
  - centos
---

## Instructions

This guide assumes that you have configured FreeIPA (default) and GitLab (Omni).

### Set-up

Here's what works:

- name, username, password
- sync updates from LDAP
- email should be set after first login via LDAP

#### 1) FreeIPA

1. Add a new user, ex.: 'crowd' and assign a password
2. Make sure the user is in the group 'ipausers'

#### 2) GitLab

Open the config

`nano /etc/gitlab/gitlab.rb`

and look for the following section, and adjust accordingly.

    gitlab_rails['ldap_enabled'] = true
    gitlab_rails['ldap_servers'] = YAML.load <<-'EOS'
      main: # 'main' is the GitLab 'provider ID' of this LDAP server
        label: 'LDAP'
        host: 'ipa.domain.com'
        port: 389
        uid: 'uid'
        bind_dn: 'uid=[new IPA user, ex.: crowd],cn=users,cn=accounts,dc=domain,dc=com'
        password: '[password of new IPA user]'
        encryption: 'plain' # "start_tls" or "simple_tls" or "plain"
        verify_certificates: true
        base: 'dc=domain,dc=com'
        attributes:
          username: ['uid']
          email: ['mail']
          name: 'displayName'
          first_name: 'givenName'
          last_name: 'sn'
    EOS

and run `gitlab-ctl reconfigure` to make sure the settings take effect.

#### 3) Login to GitLab via LDAP

1. Select 'LDAP' on the login screen
2. Enter your username, not email
3. After successful login, enter your Email in the profile field

## What's next?

1. [Connect FreeIPA LDAP with Atlassian Crowd](/dev/connect-freeipa-ldap-with-atlassian-crowd/)
2. Configure FreeIPA LDAP with Matrix
3. [Configure FreeIPA with GitLab LDAP](/dev/connect-freeipa-ldap-with-gitlab/) *- You are here*
4. Jira 1-click installation script (MYSQL, HTTPS, NGINX reverse)
5. Confluence 1-click installation script (MYSQL, HTTPS, NGINX reverse)
