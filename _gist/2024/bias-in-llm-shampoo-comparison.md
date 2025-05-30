---
title: "Bias in LLM (AI-) shampoo comparison"
summary: Using Claude 3.5 Sonnet to compare different shampoo brands by analyzing their ingredients, with prices ranging from €5 to €30 per bottle. When brand names were included in the analysis, expensive "professional" brands like Kerastase ranked highest, but when ingredients were analyzed blindly without brand names, more affordable (or less popular) options ranked better, suggesting potential bias in the LLM's initial assessment. The experiment highlights how LLMs might be influenced by brand recognition and marketing, rather than purely evaluating product ingredients and effectiveness.
layout: post
source:
date: 2024-12-24 0:00:00 +0000
category:
  - Tools
tags:
  - privacy
  - development
  - chatgpt
  - llms
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

I recently helped someone trying to find a new shampoo; Whatever they were using was not easily available and quite expensive. I figured I might try to use an LLM to help me do some of the research, and come up with a comparison of different products, and more importantly, the ingredients they are made of.

For this comparison, I relied on Claude 3.5 Sonnet.

### Approach

1. Select a bunch of shampoo, from low-end to high-end
2. Find the ingredients of each shampoo
3. Have Claude run a comparison

The price ranges from ~5 Euro to ~30 Euro a bottle, and my expectation was, that the more expensive shampoos wouldn't perform significantly better than the cheaper ones. Of course, there was no obvious way for me to validate the results, but it was nevertheless interesting, what Claude came up with.

### 1st try: Compare by brands and ingredients

- Kerastase Bain Thérapiste (Option 1)
- Redken All Soft Shampoo Shampoo (Option 2)
- Biolage Ultra Hydra Source (Option 3)
- Pantene Pro-V Daily Moisture Renewal (Option 4)
- Wella Professional Invigo (Option 5)
- Schwarzkopf Professional Bonacure (Option 6)
- TOGO Bed Head's Recovery (Option 7)
- Alfapart Milano Semi Di Lino (Option 8)
- Label.m Honey & Oat (Option 9)

For each, I provided the LLM with the complete list of ingredients, taken from the respective product page, in markdown format (I shortened the ingredient list for this example).:

```
# Kerastase Bain Thérapiste

Aqua / Water, Sodium Laureth Sulfate, Coco-Betaine, Glycerin, Glycol Distearate, Amodimethicone, Sodium Chloride, Imethicone, Ppg-5-Ceteth-20, Sodium Benzoate, Polyquaternium-6, Peg-150 Distearate, Salicylic Acid, ...

# Redken All Soft Shampoo

Aqua/Water/Eau , Sodium Laureth Sulfate , Sodium Chloride , Cocamidopropyl Betaine , Dimethicone , Parfum/Fragrance , Sodium Benzoate , Amodimethicone , Carbomer , Glycerin , Guar ...

# Biolage Ultra Hydra Source

Aqua / Water / Eau, Sodium Laureth Sulfate, Coco-Betaine, Glycol Distearate, Sodium Chloride, Cocamide Mea, Parfum / Fragrance, Sodium Benzoate, Hexylene Glycol, Guar Hydroxypropyltrimonium Chloride, ...

[... other options]
```

Claude happily produced a comparison, but the result was, that the most expensive "professional" brands came out at the top; In fact, the one shampoo were were trying to replace, was the top recommendation.

Of course, this could be factual, but I figured that there may be other reasons for the LLM to rank these products higher, including:
- Much more heavily marketed, and often featured as "top" in comparison
- Use of labels like "professional" or "salon" shampoo
- The price itself (the LLM does seem to have a rough idea, what these cost)

Here's the top 3:

```
I'll rank these products based on several key factors and provide an overall assessment.

### Ranking Criteria:
1. Ingredient Quality
2. Active Ingredients Concentration
3. Formulation Sophistication
4. Performance Reviews
5. Value for Money

### Overall Ranking (Best to Least):

1. **Kerastase Bain Thérapiste**
   - Pros:
     * High-quality active ingredients
     * Advanced formulation technology
     * Balanced pH levels
     * Professional-grade results
   - Cons:
     * Expensive
     * May be too rich for some hair types

2. **Redken All Soft Shampoo**
   - Pros:
     * Professional quality
     * Excellent moisturizing properties
     * Good balance of proteins and moisture
   - Cons:
     * Strong fragrance
     * Can be heavy for fine hair

3. **Schwarzkopf Professional Bonacure**
   - Pros:
     * Advanced amino acid complex
     * Professional formula
     * Good for damaged hair
   - Cons:
     * Results may take time to show
     * Specific variants needed for different concerns

[... other options]

### Final Verdict:
If budget isn't a concern, Kerastase remains the top choice due to its superior formulation and results. However, Redken All Soft Shampoo offers very similar benefits at a lower price point, making it an excellent alternative. Schwarzkopf Bonacure provides a good middle-ground option with professional-grade results.
```

The complete ranking looked like this:
1. Kerastase Bain Thérapiste
2. Redken All Soft Shampoo
3. Schwarzkopf Professional Bonacure
4. AlfaParf Milano Semi Di Lino
5. Wella Professional Invigo
6. Biolage Ultra Hydra Source
7. TIGI Bed Head Recovery
8. Label.m Honey & Oat
9. Pantene Pro-V Daily Moisture Renewal

I'm likely biased too, but when I read "advanced formulation", "professional-grade results" and "advanced amino acid complex", I can't help but feel funny.

### 2nd try: Compare by ingredients only

I figured I'd try this again but without specifically mentioning the shampoo names; Even though I'm aware, that the LLM is pretty good at guessing the brand and product from the ingredients, not providing the name, might shift the response.

Here's what I provided the LLM with (again, shortened, but in the same order):

```
# Option 1

Aqua / Water, Sodium Laureth Sulfate, Coco-Betaine, Glycerin, Glycol Distearate, Amodimethicone, Sodium Chloride, Imethicone, Ppg-5-Ceteth-20, Sodium Benzoate, Polyquaternium-6, Peg-150 Distearate, Salicylic Acid ...

# Option 2

Aqua/Water/Eau , Sodium Laureth Sulfate , Sodium Chloride , Cocamidopropyl Betaine , Dimethicone , Parfum/Fragrance , Sodium Benzoate , Amodimethicone , Carbomer , Glycerin , Guar ...

# Option 3

Aqua / Water / Eau, Sodium Laureth Sulfate, Coco-Betaine, Glycol Distearate, Sodium Chloride, Cocamide Mea, Parfum / Fragrance, Sodium Benzoate, Hexylene Glycol, Guar Hydroxypropyltrimonium Chloride, ...

[... other options]
```

First of all, I asked Claude to rank the products, based on the quality of ingredients sophistication of formulation, and number of benefits.

| Rank | Product | Key Strengths | Notable Ingredients | Best For |
|------|----------|----------------|-------------------|-----------|
| 1 | 9 | Most comprehensive formula, Rich in natural extracts, Contains fermented ingredients, Multiple beneficial oils | Colloidal Oatmeal, Seaweed Extracts, Honey, Chia Seed Extract, Fermented ingredients | All hair types, especially damaged or dry hair seeking intensive treatment |
| 2 | 8 | Sulfate-free, Advanced amino acid complex, UV protection, Smart hydrating system | Multiple amino acids, Complex sugar system, Hexyl nicotinate, Linseed extract | Sensitive scalps, color-treated hair |
| 3 | 2 | Good protein content, Advanced moisturizing, Strengthening properties | Aloe, Soy protein, Panthenyl phosphate, Hydrolyzed proteins | Weak or brittle hair needing protein |
| 4 | 1 | Rich in amino acids, Good smoothing properties, Moisturizing | Amodimethicone, Wheat protein, Multiple amino acids | Frizzy hair needing smoothing |
| 5 | 6 | Gentle sulfate-free formula, Good amino acid content, Balanced cleansing | Soy amino acids, Wheat amino acids, Gentle surfactants | Sensitive scalps, daily use |
| 6 | 7 | Decent moisturizing, Added shine, Standard cleansing | Cactus extract, Mica, Glycerin | Normal to dry hair |
| 7 | 5 | Basic conditioning, Contains vitamins, Simple formula | Panthenol, Vitamin E, Goji extract | Normal hair, basic conditioning |
| 8 | 3 | Simple formula, Natural oils, Basic cleansing | Aloe, Apricot kernel oil, Theobroma butter | Normal to oily hair |
| 9 | 4 | Basic cleansing, Simple formula, Limited treatment | Panthenol, Basic surfactants, Minimal actives | Normal hair, basic cleansing |

The ranking changed significantly:

| Product Name | First Ranking | New Ranking | Change |
|--------------|---------------|-------------|--------|
| Label.m Honey & Oat | 8 | 1 | ↑7 |
| AlfaParf Milano Semi Di Lino | 4 | 2 | ↑2 |
| Redken All Soft Shampoo | 2 | 3 | ↓1 |
| Kerastase Bain Thérapiste | 1 | 4 | ↓3 |
| Schwarzkopf Professional Bonacure | 3 | 5 | ↓2 |
| TIGI Bed Head Recovery | 7 | 6 | ↑1 |
| Wella Professional Invigo | 5 | 7 | ↓2 |
| Biolage Ultra Hydra Source | 6 | 8 | ↓2 |
| Pantene Pro-V Daily Moisture Renewal | - | 9 | - |

Notably, the most expensive shampoo, Kerastase Bain Thérapiste, dropped from the top spot to 4th place, and Label.m Honey & Oat, which previously ranked last, moved to the top spot.

### 3rd try: Cheapest vs. most expensive

Next step, I thought I'd try to compare Kerastase Bain Thérapiste with the two cheaper options (Wella Professional Invigo, Schwarzkopf Professional Bonacure), to work out how these compare without the noise of the other products.

> Can you provide me a markdown table of this comparison? Include more differentiating factors and try to rank them, and assign a percentage how much better each is.

```
# Option 1

Aqua / Water, Sodium Laureth Sulfate, Coco-Betaine, Glycerin, Glycol Distearate, Amodimethicone, Sodium Chloride, Imethicone, Ppg-5-Ceteth-20, Sodium Benzoate, Polyquaternium-6, Peg-150 Distearate, Salicylic Acid ...

# Option 5

Aqua/Water/Eau, Stearyl Alcohol, Cetyl Alcohol, Stearamidopropyl Dimethylamine, Panthenol, Parfum/Fragrance, Phenoxyethanol, Dicetyldimonium Chloride, Glutamic Acid, Tocopheryl Acetate ...

# Option 6

Aqua (Water, Eau), Cocamidopropyl Betaine, Sodium Methyl Cocoyl Taurate, Coco-Glucoside, Sodium Chloride, Sodium Methyl 2-Sulfolaurate, PEG-120 Methyl Glucose Dioleate, Hydroxypropyl Guar Hydroxypropyltrimonium ...
```

| Factor | Option 1 | Option 5 | Option 6 | Winner (% better) |
|---------|-----------|-----------|-----------|-----------------|
| **Cleansing Power** | Strong (SLS-based) | Mild | Moderate | Option 1 (30%) |
| **Gentleness** | Moderate | High | Highest | Option 6 (25%) |
| **Conditioning** | Moderate | High | Moderate | Option 5 (40%) |
| **Amino Acid Content** | Good (5 types) | Low (1 type) | Excellent (6+ types) | Option 6 (35%) |
| **Scalp Care** | Good (Salicylic Acid) | Basic | Good (Multiple amino acids) | Option 1 (20%) |
| **Moisture Retention** | Moderate (Glycerin) | High (Multiple alcohols) | Moderate | Option 5 (45%) |
| **Natural Ingredients** | Moderate | Low | Moderate | Option 6 (15%) |
| **Preservative System** | Better (fewer) | Harsh (Parabens) | Better (natural) | Option 1/6 tie (25%) |
| **pH Balance** | Good | Good | Excellent | Option 6 (15%) |
| **Environmental Impact** | Moderate | Poor | Better | Option 6 (30%) |
| **Hair Repair** | Good | Very Good | Good | Option 5 (35%) |
| **Fragrance/Allergens** | More | Moderate | Less | Option 6 (20%) |

```
**Best Suited For:**
- Option 1: Oily hair, dandruff-prone scalp (80% effective)
- Option 5: Damaged, dry, or chemically treated hair (85% effective)
- Option 6: Sensitive scalp, balanced hair needs (90% effective)

**Overall Ranking:**
1. Option 6 (Best for most users - most balanced formula)
2. Option 5 (Best for specific hair concerns)
3. Option 1 (Best for deep cleansing needs)
```

Based on this, the ranking looks like this now:

1. Schwarzkopf Professional Bonacure (Option 6)
2. Wella Professional Invigo (Option 5)
3. Kerastase Bain Thérapiste (Option 1)

One would expect the shampoo that's almost 6-10 times more expensive, to be significantly better, but this comparison suggests otherwise. Of course, I'll have to take this with a huge grain of salt:
- It would be difficult, or impossible for me to validate the results
- Option 1, may actually have better quality ingredients
- Or maybe, the ingredients are simply more expensive

In simple terms, you may buy an olive oil from a family farm, that's 10x more expensive than a quality one from the supermarket, but you may have a hard time telling the difference unless you're familiar with the product - and even then, the price may not speak for the quality, but rather the fact, that the operation is small, and does not benefit from economies of scale.

Of course in the case of shampoo Option 1, it's likely to be a function of marketing; Here in France, a lot of hair salons carry Kerastase, and only Kerastase.

A quick look at Google Trends, shows a similar picture:

<img src="/assets/images/gist/bias-in-llm-shampoo-comparison-google-trends.png">

I only compared brands and not specific products, but it's clear that Kerastase is either more popular or more heavily marketed, than the other brands.

### Pricing

Lastly, I looked up the pricing on idealo.de, to compare ranking by ingredients, versus pricing of smaller and larger bottles.

What stands out is, that products like Label.m and Alfaparf are more, or equally expensive as Kerastase in the ~250-300ml packaging, but significantly cheaper in the 1l packaging.

| Product | Cost per ml (€) | Quality Rank | Brand | Value Score | Notes |
|---------|----------------|--------------|--------|--------------|--------|
| Kerastase (Opt 1) | 0.075 (250ml), 0.099 (450ml) | 4 | Luxury | Low | Highest price, mid-tier quality |
| Label.m (Opt 9) | 0.063 (300ml), 0.039 (1L) | 1 | Professional | Excellent | Best quality, reasonable price especially in 1L |
| Alfaparf (Opt 8) | 0.060 (250ml), 0.036 (1L) | 2 | Professional | Very Good | High quality, good price in 1L |
| Redken (Opt 2) | 0.044 (300ml) | 3 | Professional | Good | Mid-range price, good quality |
| Pantene (Opt 5) | 0.017 (400ml) | 7 | Drugstore | Fair | Low price, basic quality |
| Schwarzkopf (Opt 6) | 0.027 (250ml), 0.015 (1L) | 5 | Unknown | Good | Lowest price, decent quality |

```
Key Observations:
1. Biggest price gap: Kerastase (0.099€/ml) vs Option 6 (0.015€/ml) - nearly 7x difference
2. Best value for money: Label.m and Alfaparf in 1L sizes
3. Most expensive: Kerastase, with questionable value given its quality ranking
4. Most economical: Schwarzkopf and Pantene, with expected lower quality
5. Professional brands (Label.m, Alfaparf, Redken) offer better quality-to-price ratio
```

If there's any truth to the comparison Claude produced here, it would seem that you're better off sticking to the cheaper options (~5 Euro a bottle), or go for the 1l bottles of the more expensive brands, if you're looking for more quality ingredients.

### Conclusion

I'm not sure there's any real value in this comparison, or if these results hold up, but it was nevertheless interesting, how differently Claude will rank products, depending on how you present them.