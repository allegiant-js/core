# core

> Small modular, effective app framework.
>> There be 🐲 here! The API and functionality are being cemented, anything before a 1.0.0 release is subject to change.

[![Npm Version](https://img.shields.io/npm/v/@allegiant/core.svg)](https://www.npmjs.com/package/@allegiant/core)
[![Build Status](https://travis-ci.org/allegiant-js/core.svg?branch=master)](https://travis-ci.org/allegiant-js/core.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/allegiant-js/core/badge.svg?branch=master)](https://coveralls.io/github/allegiant-js/core?branch=master)


## Installation

```
npm install @allegiant/core --save
```

## Usage
```js
const App = require('@allegiant/core');

var server = App.create('http://localhost:7000');
server.get('/', function() {
    this.content = "<h1>It just works!</h1>";
    return 200;
})
.start();
```

More examples can be found by checking out the [examples](https://github.com/allegiant-js/examples) repository.

### Copyright & License

Copyright &copy; 2017 Allegiant. Distributed under the terms of the MIT License, see [LICENSE](https://github.com/allegiant-js/core/blob/master/LICENSE)

Availble via [npm](https://www.npmjs.com/package/@allegiant/core) or [github](https://github.com/allegiant-js/core).
