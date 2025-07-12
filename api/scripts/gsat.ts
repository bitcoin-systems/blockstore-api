export function printGsat(items) {

  const final = [];
  const filtered = items.filter((e) => e.isVerified && e.matchedTx);

  const grouped = Object.groupBy(filtered, item => item.matchedTx);

  for (const key in grouped) {
    const itemsData = grouped[key];

    if (itemsData.length) {
      const tx = itemsData[0];

      const amount = tx.tokenValueUSD; 
      let tickets = 0;

      if (tx.txType === 'swap') {
        tickets = Math.min(Math.floor(amount / 50), 5);
        if (amount > 500) {
          // bonus
          tickets += 10;
        }
      }

      if (tx.txType === 'lend') {
        if (amount >= 10 && amount <= 100) {
          tickets = 1;
        } else if (amount >= 101 && amount <= 500) {
          tickets = 3;
        } else if (amount > 500) {
          tickets = 5;
        }
      }

      final.push({
        address: tx.address,
        tickets: tickets,
        amount: amount,
        tx: tx.matchedTx,
        site: tx.partner,
        op: tx.txType,
        date: tx.date
      });
    }
  }

  let data = `
  
  <html lang="en">
 <head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <title>g-sat</title>
   <style>
    table, th, td {
      border:1px solid black;
    }
</style>
 </head>
 <body>
   <div>
     <!--content-->
    <table style="width:100%">
      <tr>
        <th>Address</th>
        <th>Tickets</th>
        <th>Amount</th>
        <th>tx</th>
        <th>Site</th>
        <th>Op</th>
        <th>Date</th>
      </tr>
      ${final.map((it: any) => (`<tr>
        <td>${it.address}</td>
        <td>${it.tickets}</td>
        <td>${it.amount}</td>
        <td>${it.matchedTx}</td>
        <td>${it.site}</td>
        <td>${it.op}</td>
        <td>${it.date}</td>
      </tr>`))}
    </table>
   </div>
 </body>
</html>

 `
  return data;
}