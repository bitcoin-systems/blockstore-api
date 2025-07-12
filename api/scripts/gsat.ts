export function printGsat(items) {

  const final = [];

  items.forEach(ele => {
    final.push(ele);
  });

  let data = `
  
  <html lang="en">
 <head>
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <title>g-sat</title>
 </head>
 <body>
   <div>
     <!--content-->
    <table>
      <tr>
        <th>Address</th>
        <th>Site</th>
        <th>Country</th>
      </tr>
      ${final.map((it: any) => (`<tr>
        <td>${it.address}</td>
        <td>${it.partner}</td>
      </tr>`))}
    </table>
   </div>
 </body>
</html>

 `
  return data;
}