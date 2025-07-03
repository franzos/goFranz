---
title: "How-To connect FreeIPA LDAP with Atlassian Crowd"
summary: "Guide to integrate FreeIPA LDAP authentication with Atlassian Crowd for SSO with Confluence and Jira applications."
layout: blog
date: 2018-06-17 00:00:00 +0200
category:
  - ldap
tags:
  - sso
  - confluence
  - jira
  - crowd
  - atlassian
  - ldap
  - freeipa
  - centos
---

## Instructions

This guide assumes that you have configured FreeIPA (default) and Crowd.

### Set-up

Here's what works:

- name, username, password, groups
- sync updates from LDAP
- write updates to LDAP from crowd (untested)

#### 1) FreeIPA

1. Add a new user, ex.: 'crowd' and assign a password
2. Make sure the user is in the group 'ipausers'

#### 2) Crowd

1. Add directory with the type 'Connector'
2. Give it a name and configure as follows

**Connector**

    Connector: Generic Directory Server
    URL: ldap://subdomain.domain.com:389/
    Base DN: dc=domain,dc=com
    Username: uid=[new IPA user, ex.: crowd],cn=users,cn=accounts,dc=domain,dc=com
    Password: [password of new IPA user]

    The remaining parameters are default.

**User Configuration**

    User DN: cn=accounts
    User object class: inetorgperson
    User object filter: (objectclass=inetorgperson)
    User name attribute: uid
    User name RDN attribute: cn
    User first name attribute: givenName
    User last name attribute: sn
    User display name attribute: displayName
    User email attribute: mail
    User group attribute: memberOf
    User password attribute: userPassword
    User unique identifier attribute: uidnumber (untested)

**Group configuration**

    Group DN: cn=accounts
    Group object class: ipausergroup
    Group object filter: (objectclass=ipausergroup)
    Group name attribute: cn
    Group description attribute: description
    Group members attribute: member

#### 3) Copy Crowd users to LDAP

1. [in Crowd] Users
2. Import users
3. Directory importer

That's it, pretty straight forward from here.

*Alternatively you can ignore the Crowd directory, as long as the users are in LDAP. If their Jira / Confluence name matches with the one in FreeIPA LDAP (user@company.com), they can login with their new LDAP details right away, and continue working under the same account.*

#### 3) Activate Directory

In order to use the newly added directory for authentication, here's what you do:

1. Applications
2. [Name of Application]
3. Directories and Groups
4. Add the newly created directory, and move it to the top (prioritize)

That's in. FreeIPA LDAP - Crowd - Jira / Confluence - Happiness

## What's next?

1. [Connect FreeIPA LDAP with Atlassian Crowd](/blog/connect-freeipa-ldap-with-atlassian-crowd/) *- You are here*
2. Configure FreeIPA LDAP with Matrix
3. [Configure FreeIPA with GitLab LDAP](/blog/connect-freeipa-ldap-with-gitlab/)
4. Jira 1-click installation script (MYSQL, HTTPS, NGINX reverse)
5. Confluence 1-click installation script (MYSQL, HTTPS, NGINX reverse)
