---
title: "Accounting for busy people (with AI)"
layout: post
source:
date: 2023-03-21 0:00:00 +0000
category:
  - Tools
tags:
  - accounting
  - crypto
  - privacy
  - review
bg: austin-neill
bg-author: Austin Neill
author: Franz Geffke
---

Whether it's for your business, or personal finances, accounting is one of these necessary evils that can actually bring a lot of joy.

When you start working on your finances, the first important choice to make, is the tool to use. There's probably hundreds of options, most of which are 
- cumbersome to use
- not flexible enough
- too expensive
- put your data at risk
- don't support importing from your bank account

Granted, many of these tools make your life easier with automated data imports. It also means that you are giving a third-party (and anyone that hack's into them) access to all your bank accounts, or at least all your transactions, which expose you to any number of new problems.

More importantly, when times are tough, and you'd rather save that $$$ subscription fee, they are more than happy to delete your data.

## Beancount to rescue

I've recently come across a neat little double-entry accounting software that I probably wouldn't even mention here, if it wasn't for the huge advances on the part of ChatGPT (more on that later).

The accounting software is called Beancount and it's 

- entirely text based
- as secure as the data on your hard disk
- most certainly "compatible" with your bank account
- should still work in 50 years (on virtually every OS)
- will cost you as much, as you're willing to donate (money and time to improve it)

Now that everyone can be a "developer" (no, you still need me), it has suddenly become accessible to every person in the world, that's willing to put in some time to talk to ChatGPT (or any other similar language model), to write neat little python scripts that help you automate the import from your bank accounts, cryptocurrency wallets, or wherever else you have transactions that you need to digest.

### Interface

Beancount comes with a nice little web interface to browse trough your account ledger, and create trial balances, but most of the time you'll be spending in a text file (for ex. `my-accounts.beancount`). Here's what this looks like:

```
2022-01-01 open Equity:Transfers
2020-01-01 open Equity:Opening-Balances
2022-01-01 open Assets:Checking:RBS EUR
2022-01-01 open Expenses:Business:Service
2022-01-01 open Expenses:Business:Subscription

2022-07-01 * "Transfer to ..."
   Assets:Checking:RBS                      1000.0 EUR
   Equity:Opening-Balances

2022-07-04 * "Payment of ..."
   Assets:Checking:RBS                      -298.89 EUR
   Expenses:Business:Service

2022-07-11 * "Vodafone"
   Assets:Checking:RBS                      -30.0 EUR
   Expenses:Business:Subscription

2022-07-15 * "Transfer from ..."
   Assets:Checking:RBS                      50.0 EUR
   Equity:Transfers                         -50.0 EUR
```

I suppose it's already obvious what's happening here:

- I defined a new bank account at the top `Assets:Checking:RBS` and assigned `EUR` as currency. It could also be `USD`, `BTC` or whatever.
- There's two example expense categories `Expenses:Business:Service` and `Expenses:Business:Subscription`.
- In my case, `Equity:Transfers` tracks movements between accounts

Once you have a bunch of records, you can use the command line or web-interface to query the data:

```bash
$ bean-report my-accounts.beancount holdings

Account               Units  Currency  Cost Currency  Average Cost  Price  Book Value  Market Value
-------------------  ------  --------  -------------  ------------  -----  ----------  ------------
Assets:Checking:RBS  721.11       EUR            EUR                           721.11        721.11
-------------------  ------  --------  -------------  ------------  -----  ----------  ------------
```

To see your accounts in the browser:

```bash
$ bean-web my-accounts.beancount

Bottle v0.12.23 server starting up (using WSGIRefServer())...
Listening on http://localhost:8080/
Hit Ctrl-C to quit.
# open the given URL: http://localhost:8080/
```

There's many more options, but this is not the point of this post.

### Importing data

Now this is where it becomes interesting: Each of your accounts provides records in a different format. It's tricky, because there's literally millions of banks, and no accounting software on the planet, to support them all.

This is where you'd usually call the company (or a developer), to provide an integration - which they are happy to do, if you're willing to fork out an appropriate amount of money; Now that we have ChatGPT and many other AI language models, you don't have to anymore.

Here's what an export from your bank may look like. In my case, it's a `.csv` file.

| Date       | Description                            | Amount |
|------------|----------------------------------------|--------|
| 13-03-2023 | Imposto do Selo sobre comissão         | -0,26  |
| 13-03-2023 | Comissão de manutenção de conta pacote | -6,49  |
| 10-03-2023 | Transferência de Muster Gmbh           | 117,5  |
| 06-03-2023 | Postmarkapp                            | -9,45  |

_If you're an experienced developer, the following is not going to be interesting to you. Checkout [this](https://beancount.github.io/docs/importing_external_data.html) (beancount.github.io) advanced guide instead._

Now I can simply open ChatGPT and ask for some help:

> ChatGPT, write a python script to parse a CSV file with the following columns `Date`, `Description`, `Amount` and change the date format from `13-03-2023` to `2023-03-13`.

The bot will spit-out a python script with the following content and a helpful explanation (it will also guide you on how-to run this, if you ask):

```python
import csv
from datetime import datetime

# Open the CSV file for reading
with open('file.csv', 'r') as csvfile:

    # Create a CSV reader object
    csvreader = csv.reader(csvfile)

    # Skip the header row
    next(csvreader)

    # Loop through each row in the CSV file
    for row in csvreader:

        # Get the value of the Date column and convert it to the new date format
        date_str = row[0]
        date_obj = datetime.strptime(date_str, '%d-%m-%Y')
        new_date_str = date_obj.strftime('%Y-%m-%d')

        # Get the values of the Description and Amount columns
        description = row[1]
        amount = row[2]

        # Print the values with the new date format
        print(f"{new_date_str}: {description} - ${amount}")
```

> This script uses the datetime module to convert the date string from 13-03-2023 to a datetime object, and then uses the strftime method to format the date as 2023-03-13. The rest of the script is similar to the previous example, where we loop through each row in the CSV file, extract the values of the Description and Amount columns, and print them with the new date format.

Of course this might not be perfect, or give you exactly what you want right away, but it is certainly extremely valuable if you have little or no experience as a developer; plus, you can always ask for changes and explanation.

Now let's ask the bot to modify this, to actually write a file:

> ChatGPT, modify the script to add each row to an array of objects. Next, loop over the array, to write the data to a file with an empty line between each row.

```python
import csv
from datetime import datetime

# Open the CSV file for reading
with open('file.csv', 'r') as csvfile:

    # Create a CSV reader object
    csvreader = csv.reader(csvfile)

    # Skip the header row
    next(csvreader)

    # Create an empty list to hold the rows
    rows = []

    # Loop through each row in the CSV file
    for row in csvreader:

        # Get the value of the Date column and convert it to the new date format
        date_str = row[0]
        date_obj = datetime.strptime(date_str, '%d-%m-%Y')
        new_date_str = date_obj.strftime('%Y-%m-%d')

        # Get the values of the Description and Amount columns
        description = row[1]
        amount = row[2]

        # Create a dictionary for the row
        row_dict = {
            'Date': new_date_str,
            'Description': description,
            'Amount': amount
        }

        # Append the row dictionary to the rows list
        rows.append(row_dict)

# Open a file for writing
with open('output.txt', 'w') as outfile:

    # Loop through the rows list and write each row to the file
    for row in rows:

        # Write the row data to the file
        outfile.write(f"{row['Date']}: {row['Description']} - ${row['Amount']}\n")

        # Write an empty line between each row
        outfile.write('\n')
```

Yes, this is exactly what we want. So at this point:

1. We read the file you saved from your bank's website (`data.csv`)
2. We formatted the date, to follow the format Beancount expects
3. We've got an idea how'to write this to a file

If you remember the Beancount format, it might be obvious that whatever it's writing here, probably doesn't follow the correct format yet:

```
2022-07-15 * "Transfer from ..."
   Assets:Checking:RBS                      50.0 EUR
   Equity:Transfers                         -50.0 EUR
```

The Beancount manual contains much information and examples on how-to automate and remove duplicates, but for the sake of simplicity, we'll take a quick and obvious approach: We'll modify the lines the python script writes, to use the correct format instead.

**Before**

```python
# Open a file for writing
with open('output.txt', 'w') as outfile:

    # Loop through the rows list and write each row to the file
    for row in rows:

        # Write the row data to the file
        outfile.write(f"{row['Date']}: {row['Description']} - ${row['Amount']}\n")

        # Write an empty line between each row
        outfile.write('\n')
```

**After**

```python
# Open a file for writing
with open('output.txt', 'w') as outfile:

    # Loop through the rows list and write each row to the file
    for row in rows:

        # Write the row data to the file
        outfile.write(f"""{row['Date']} * {row['Description']}
   Assets:Checking:RBS                      {row['Amount']} EUR
   Expenses:Business:Service

""")
```

If we run this, `output.txt` should look like this:

```
2023-03-13 * "Imposto do Selo sobre comissão"
   Assets:Checking:RBS                      -0,26 EUR
   Expenses:Business:Service

2023-03-13 * "Comissão de manutenção de conta pacote"
   Assets:Checking:RBS                      -6,49 EUR
   Expenses:Business:Service

2023-03-10 * "Transferência de Muster Gmbh"
   Assets:Checking:RBS                      117,5 EUR
   Expenses:Business:Service

2023-03-06 * "Postmarkapp"
   Assets:Checking:RBS                      -9,45 EUR
   Expenses:Business:Service
```

There's still two problems here:

1. Dates should be sorted ascending
2. The amount should be `-0.26 EUR` instead of `-0,26 EUR`

Let's get the bot involved again with two more requests:

> ChatGPT, update the script to order `rows` by date (ascending) and convert the amount decimal separator from comma (`,`) to dot (`.`)

This will give you the whole python script again, so compare it to what you have, to identify the changes:

```python
import csv
from datetime import datetime

# Open the CSV file for reading
with open('file.csv', 'r') as csvfile:

    # Create a CSV reader object
    csvreader = csv.reader(csvfile)

    # Skip the header row
    next(csvreader)

    # Create an empty list to hold the rows
    rows = []

    # Loop through each row in the CSV file
    for row in csvreader:

        # Get the value of the Date column and convert it to the new date format
        date_str = row[0]
        date_obj = datetime.strptime(date_str, '%d-%m-%Y')
        new_date_str = date_obj.strftime('%Y-%m-%d')

        # Get the values of the Description and Amount columns
        description = row[1]
        amount_str = row[2]

        # Convert the amount decimal separator from comma to dot
        amount = float(amount_str.replace(',', '.'))

        # Create a dictionary for the row
        row_dict = {
            'Date': new_date_str,
            'Description': description,
            'Amount': amount
        }

        # Append the row dictionary to the rows list
        rows.append(row_dict)

# Sort the rows list by date (ascending)
rows.sort(key=lambda x: x['Date'])

# Open a file for writing
with open('output.txt', 'w') as outfile:

    # Loop through the rows list and write each row to the file
    for row in rows:

        # Write the row data to the file
        outfile.write(f"{row['Date']}: {row['Description']} - ${row['Amount']:.2f}\n")

        # Write an empty line between each row
        outfile.write('\n')
```

To be clear, here's what's important:

1. `amount = float(amount_str.replace(',', '.'))` will take care of that comma for us
   - You may have to manually tweak this to: `amount = float(amount.replace('.', '').replace(',', '.'))`
2. `rows.sort(key=lambda x: x['Date'])` will sort the rows

Make sure to integrate these changes with your script and run it again. The file `output.txt` should look like this:

```
2023-03-06 * "Postmarkapp"
   Assets:Checking:RBS                      -9.45 EUR
   Expenses:Business:Service

2023-03-10 * "Transferência de Muster Gmbh"
   Assets:Checking:RBS                      117.5 EUR
   Expenses:Business:Service

2023-03-13 * "Comissão de manutenção de conta pacote"
   Assets:Checking:RBS                      -6.49 EUR
   Expenses:Business:Service

2023-03-13 * "Imposto do Selo sobre comissão"
   Assets:Checking:RBS                      -0.26 EUR
   Expenses:Business:Service
```

At this point we've got properly formatted records that Beancount will read without complaints. Now you could further tweak the python script:

- Use categories other than `Expenses:Business:Service` depending on the description
- If your bank export provides other data like account numbers, you could draft your own descriptions
- Whatever else comes to mind ....

Once you're satisfied with the content of `output.txt`, you can copy the data to your accounts file `my-accounts.beancount`.

### Conclusion

This approach is far from perfect but as long as you're able to obtain a spreadsheet (excel, csv - and others) file from your bank, exchange or crypto wallet, you should be able to import and categorize years of records, in a couple of hours.

I'm certainly aware that ChatGPT is far from perfect at this moment, but never before has it been so easy to write scripts without having to learn programming. Yes, python is already a straight-forward language, but with the subtle help of ChatGTP, it becomes even more accessible and valuable.

The complete documentation can be found here: [beancount.github.io/docs](https://beancount.github.io/docs/index.html).

#### Notes

- If you're running guix or PantherX, you can install Beancount with `guix package -i beancount`. On most other systems, a `sudo -H python3 -m pip install beancount` should do the trick. Refer to the documentation for more information.
- I purposely tried to simplify my queries. It's useful to be familiar with terms like `array` or `object`, to write more precise prompts, but I might be wrong.
- I provide responses "as is". No effort has been made to improve the given code.
- I used "ChatGPT, ..." for clarity when I address the bot. There's no need to do this.
- The responses you get, are likely different.

**Enjoy the freedom ...**