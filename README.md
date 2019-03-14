# retire-scanner

A retire.js wrapper for programmatic use.

## Install
```
npm i -S retire-scanner
```

## Use
```js
const Scanner = require('retire-scanner');

(async () => {
  const scanner = new Scanner({ path: 'public' });
  const result = await scanner.scan();
  console.log(result);
})();

// { 
//  base64url: [ { severity: 'high', summary: 'Out-of-bounds Read' } ],
//  hoek:
//    [ { severity: 'low', summary: 'Prototype pollution attack' } ],
//  lodash:
//    [ { severity: 'low', summary: 'Prototype pollution attack' },
//      { severity: 'low', summary: 'Prototype pollution attack' } ]
// }
```

## Debug
Run the scanner in debug mode by prefixing `DEBUG=retire` to your node startup command. (e.g. `DEBUG=retire node scanner.js`).

## Requirements
`retire.js` binary needs to be globally installed and present.

Install `retire.js` with `npm i -g retire.js`.