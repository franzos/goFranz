---
title: "Ethereum GPU mining on AWS EC2 in 2017"
layout: page
source:
date: 2017-01-01 00:00:00 +0200
categories:
- mining
- test
bg: ferdinand-stohr
bg-author: Ferdinand Stohr
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
