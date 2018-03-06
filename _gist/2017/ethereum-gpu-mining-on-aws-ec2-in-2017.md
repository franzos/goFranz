---
title: "Ethereum GPU mining on AWS EC2 in 2017"
layout: post
source:
date: 2017-02-03 08:00:00 +0200
category:
  - Cryptocurrency
tags:
  - crypto
  - mining
  - aws
  - ethereum
bg: ferdinand-stohr
bg-author: Ferdinand Stohr
author: Franz Geffke
---

Cryptocurrency mining is as popular as ever, as it in theory allows you to turn idle computing resources into a passive income. The problem is, that these days you require extremely powerful, specifically optimized hardware as well as access to very cheap or even free electricity.

## Testing on EC2

To determine just how difficult mining has become, I've decided to run a GPU miner on an Amazon AWS EC2 g2.8xlarge. This particular cloud instance is significantly faster than the hardware most people have at home, yet it is not specifically optimized for Cryptocurrency mining - the ideal candidate.

### Specs & Details

- High Frequency Intel Xeon E5-2670 (Sandy Bridge) Processors (32 vCPU)
- 4x NVIDIA GRID K520 (1,536 CUDA cores and 4GB of video memory)
- 60GB of Memory, 2x120GB of SSD Storage
- The Server costs $2.6 per hour ($62.4/day; $1860/month)
- 1 Ethereum sells for $10.76 (2017-02-03)

_Tip: With AWS EC2 spot pricing, you can get the server for around $0.4777 / hour, depending on time of day, region and availability zone. That's $343,94 / month._

### Results

![EC2 Hash Rate](/assets/content/ethereum-gpu-mining-on-aws-ec2-in-2017_01.png)

The hash rate of the EC2 server fluctuates between 23.3 MH/s and 47.7 MH/s. I suspect the performance varies based on what other users do on this shared, EC2 server. In any case, the results give us a good idea of what to expect when you run a miner on hardware that's not specifically designed for mining.

![EC2 Hash Rate](/assets/content/ethereum-gpu-mining-on-aws-ec2-in-2017_02.png)

Based on average hash rate of 28 MH/s, each EC server would generate around 0.0045 Ether ($0.05) in income per hour. That means, *over the course of a month you'd make $34.84 (3.25 Ether)*.

### Conclusion

Unless the USD - ETH exchange rate increases by at least 1000%, mining on AWS EC2 remains unprofitable.

<hr>

**Update: 2017-02-14**

After around a week of EC2 mining, I have now shut down all AWS server. The Spot pricing I've been pursuing helped keep cost down but remains too expensive to be profitable.

![EC2 Hash Rate](/assets/content/ethereum-gpu-mining-on-aws-ec2-in-2017_03.png)

| Paid On                   | From Block | To Block | Duration [h] | Amount      |
|---------------------------|------------|----------|--------------|-------------|
| 2017-02-13T18:08:44 | 3176203    | 3176833  | 2.6          | 0.09699 ETH |
| 2017-02-13T15:33:08 | 3175670    | 3176197  | 2.2          | 0.09554 ETH |
| 2017-02-13T13:18:20 | 3175075    | 3175662  | 2.2          | 0.09745 ETH |
| 2017-02-13T11:06:35 | 3174454    | 3175067  | 2.4          | 0.09614 ETH |
| 2017-02-13T08:42:46 | 3173879    | 3174450  | 2.3          | 0.1004 ETH  |
| 2017-02-13T06:27:19 | 3173352    | 3173865  | 2            | 0.09774 ETH |
| 2017-02-13T04:28:20 | 3172641    | 3173349  | 3.1          | 0.09724 ETH |
| 2017-02-13T01:24:22 | 3171962    | 3172630  | 2.7          | 0.0955 ETH  |
| 2017-02-12T22:43:51 | 3171360    | 3171955  | 2.4          | 0.0962 ETH  |
| 2017-02-12T20:18:45 | 3170701    | 3171333  | 2.4          | 0.09535 ETH |
| 2017-02-12T17:54:44 | 3170230    | 3170697  | 1.9          | 0.09745 ETH |
| 2017-02-12T15:59:33 | 3169628    | 3170216  | 2.5          | 0.09691 ETH |
| 2017-02-12T13:29:43 | 3169141    | 3169617  | 1.9          | 0.10045 ETH |
| 2017-02-12T11:34:53 | 3168562    | 3169138  | 2.3          | 0.10078 ETH |
| 2017-02-12T09:14:53 | 3168014    | 3168556  | 2.2          | 0.0972 ETH  |
| 2017-02-12T07:03:15 | 3167437    | 3167999  | 2.2          | 0.09754 ETH |
| 2017-02-12T04:48:24 | 3166852    | 3167434  | 2.4          | 0.09501 ETH |
| 2017-02-12T02:21:34 | 3166292    | 3166838  | 2.1          | 0.09638 ETH |
| 2017-02-12T00:14:57 | 3165750    | 3166277  | 2.1          | 0.09927 ETH |
| 2017-02-11T22:10:29 | 3165252    | 3165747  | 1.9          | 0.09592 ETH |

<hr>

**Update: 2017-05-22**

As of today, Ethereum is valued at 1 ETH = 173.8 USD. However, due to enormous demand, EC2 spot pricing is nowhere near what I paid in early 2017. **Mining on AWS EC2 is and will remain unprofitable - forever.**

**Monthly cost**: $1860
<br>**Mining revenue**: $220 _(assuming 44 MH/s)_
<br>**Profit**: $ -1640

<hr>

**Update: 2017-07-09**

Ethereum dual-mining profitability comparison (late June 2017). Keep in mind that as more miners join the network, and the Ethereum price fluctuates, so will your payout / return of investment.

| Measured       | by Card | by Month | by Month DUAL | total DUAL    | % of Baseline |
|----------------|---------|----------|---------------|---------------|---------------|
| SIA            | 5,70    | 1,154    | 381 €         |               | 46.23%        |
| ZEC            | 1,490.4 | 298.08   | 373 €         |               | 45.23%        |
| ETH            | 112     | 22.4     | 601 €         |               | 73.02%        |
| ETH (ZEC) Dual | 104     | 20.8     | 558 €         |               |               |   
| ZEC (ETH) Dual | 20.2    | 4.04     | 5 €           | 564 €         | 68.41%        |
| ETH (SIA) Dual | 103     | 20.6     | 553 €         |               |               |
| SIA (ETH) Dual | 4,100   | 820      | 271 €         | 824 €         | 100.00%       |
| ETH (DEC) Dual | 109     | 21.8     | 585 €         |               |               |
| DEC (ETH) Dual | 3,274   | 654.8    | 164 €         | 749 €         | 90.93%        |

<hr>

**Update: 2017-12-16**

Ethereum is valued at 1 ETH = 706 USD.

**Monthly cost**: $1,860
<br>**Mining revenue**: $115.14 _(assuming 44 MH/s)_
<br>**Profit**: $ -1,744.86

**Mining on AWS EC2 is still, and will remain unprofitable - forever.**

<hr>

**Update: 2018-01-31**

Amazon's latest EC2 P3 generation features up to [8x Nvidia Tesla V100](https://aws.amazon.com/blogs/aws/new-amazon-ec2-instances-with-up-to-8-nvidia-tesla-v100-gpus-p3/) GPU's. The V100 (5,120 CUDA cores) is significantly more powerful than the previous generation NVIDIA GRID K520 (1,536 CUDA cores), however the high-end EC2 p3.16xlarge also costs significantly more.

EC2 p3.16xlarge
- 8x V100 with 5,120 CUDA core each
- $24.48 per hour, $587.52 per day
- Reported ETH hash rate of 90.58 MH/s per card (724.64 MH/s combined)

**Monthly cost**: $17,625.6
<br>**Mining revenue**: $2,009.36 _(assuming 724.64 MH/s)_
<br>**Profit**: $ -15,616.24

<hr>

## Q&A

If you have a question, I'd prefer you leave a [comment](#comments) below.

#### EC2 Elastic GPU service

> What about using the recently launched Amazon EC2 Elastic GPU service. What is the potential for mining with this service? - M.

The Amazon [EC2 Elastic GPU services](https://aws.amazon.com/ec2/elastic-gpus/details/) comes with a number of severe limitations, that make it unsuitable for mining cryptocurrency. Here's what I've noticed:

1. The GPU is attached via network (latency, bandwidth usage)
2. You can attach only 1x Elastic GPU to each EC2 instance
3. This services requires a special driver which only supports OpenGL 4.2

#### Dual-Mining

> What is Dual-Mining? What is considered baseline, the AWS instance cost? - D.

DUAL stands for dual-mining. That means, that you are concurrently mining 2 or more currencies. For example, you could be mining Ethereum (ETH) and Siacoin (SC) together, thus making a higher profit compared to only mining Ethereum. The baseline is ETH + SIA, so mining only ETH would generate around 27% less profit.

<hr>

Appreciate the time I spend on this? Send a thanks to (ETH):
*0x031FE3346207DEF2EB9dDc4b19A621a85B554D9f*
