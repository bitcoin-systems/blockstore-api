export function printGsat(items) {

  const final: any = [];
  const filtered: any = items.filter((e) => e.isverified === 'true' && e.matchedtx);

  for (const tx of filtered) {

    if (tx) {

      const amount = tx.tokenvalueusd; 
      let tickets = 0;

      if (tx.txtype === 'bridge') {
        tickets = 0;
        if (amount >= 40) {
          // bonus
          tickets += 3;
        }
      }

      if (tx.txtype === 'lend' || tx.txtype === 'swap') {
        if (amount >= 10 && amount <= 100) {
          tickets = 1;
        } else if (amount >= 100 && amount <= 500) {
          tickets = 3;
        } else if (amount > 500) {
          tickets = 5;
        }
      }

      if (tx.tokenname === '243') {
        tx.tokenvalue = tx.tokenvalue / 10 ** 6;
        tx.tokenname = 'RBTC';
      }

      final.push({
        address: tx.address,
        tickets: tickets,
        amount: amount,
        token: `${String(tx.tokenvalue).slice(0, 8)} ${tx.tokenname}`,
        tx: tx.matchedtx,
        site: tx.partner,
        op: tx.txtype,
        date: tx.datetime
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
      table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 1rem;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    font-size: 0.875rem;
    color: #212529;
  }

  th, td {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    vertical-align: top;
  }

  thead {
    background-color: #f8f9fa;
  }

  tbody tr:nth-child(odd) {
    background-color: #f9f9f9;
  }

  tbody tr:hover {
    background-color: #f1f1f1;
  }

  th {
    font-weight: bold;
    text-align: left;
  }
</style>
 </head>
 <body>
   <div>
     <!--content-->
    <h1 style="text: center; margin: 10px"> Golden Sat Tracking Dashboard </h1> 
    <h3 style="text: center; margin: 10px"> Total: ${final.length} </h3> 
    <table style="width:100%">
      <tr>
        <th>Address</th>
        <th>Tickets</th>
        <th>Amount</th>
        <th>Token</th>
        <th>Tx Hash</th>
        <th>Site</th>
        <th>Date</th>
      </tr>
      ${final.map((it: any, i: number) => (`<tr>
        <td>${it.address}</td>
        <td>${it.tickets}</td>
        <td>$${it.amount}</td>
        <td>${it.token}</td>
        <td> <a target="_blank" href="https://rootstock.blockscout.com/tx/${it.tx}"> ${it.op} </a></td>
        <td>${it.site}</td>
        <td>${it.date}</td>
      </tr>`))}
    </table>
   </div>
 </body>
</html>

 `
  return data;
}