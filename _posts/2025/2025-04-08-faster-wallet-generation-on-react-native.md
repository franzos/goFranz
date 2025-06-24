---
title: "Generate ETH wallet 20x faster on React Native"
summary: "How to speed up wallet generation on React Native using ethers.js and react-native-quick-crypto."
layout: post
source:
date: 2025-4-8 0:00:00 +0000
category:
  - Tools
tags:
  - development
  - blockchain
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I'm developing a simple Ethereum wallet for use with a private network. A new user may either input a Mnemonic phrase, or generate a new wallet.

Out of the box, generating a new wallet easily takes ~30s+ on a Google Pixel 7, with ethers v6:

```js
import {HDNodeWallet} from 'ethers';

export const generateFirstWallet = async (): Promise<HDNodeWallet> => {
 return HDNodeWallet.createRandom(undefined, "m/44'/60'/0'/0/0");
};
```

Looking for a way to speed up the operation using native code, I found `react-native-quick-crypto`. I soon learned that it's easy to teach ethers, to use `react-native-quick-crypto` for crypto operations:

```js
// ethers.ts
import * as ethers from 'ethers';
import crypto from 'react-native-quick-crypto';

ethers.pbkdf2.register(
  (
    password: Uint8Array,
    salt: Uint8Array,
    iterations: number,
    keylen: number,
    algo: 'sha256' | 'sha512',
    // eslint-disable-next-line max-params
  ) => {
    const result = crypto.pbkdf2Sync(password, salt, iterations, keylen, algo);
    return ethers.hexlify(new Uint8Array(result));
  },
);

export * from 'ethers';
```

Now, just import the module instead of `ethers`:

```js
import {HDNodeWallet, Wallet} from '../ethers';

export const generateFirstWallet = async (): Promise<HDNodeWallet> => {
 return HDNodeWallet.createRandom(undefined, "m/44'/60'/0'/0/0");
};
```

Voila! It takes less than 2s now.

### Credits

-  [github.com/ethers-io/ethers.js/issues/2250](https://github.com/ethers-io/ethers.js/issues/2250#issuecomment-1599169934) 
