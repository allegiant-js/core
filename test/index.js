const Router = require('../router');
const { test } = require('tap');

const routes = [
    { method: 'GET',  uri: 'api/2' },
    { method: 'GET',  uri: '/api/1/' },
    { method: 'GET',  uri: '/' },
    { method: 'GET',  uri: '/users/:user/:thing' },
    { method: 'GET',  uri: '/users/:user/:thing/:another' },
    { method: 'POST', uri: '/users/:user/:thing/:another' },
    { method: 'GET',  uri: '/users/:user/:thing/another/test/:here' },
    { method: 'GET',  uri: '/static/robots.txt' },
    { method: 'GET',  uri: '/users/tim/lamp' },
    { method: 'GET',  uri: '/static/main/js/local/script.js' },
];

// -- GROUP: Non tagged uris
const checks = [    
    { method: 'GET', uri: 'api/2', expect: ['GET', '/api/2', [] ] },
    { method: 'GET', uri: '/api/1/', expect: ['GET', '/api/1', [] ] },
    { method: 'POST', uri: '/api/1/', expect: false },
    { method: 'GET', uri: '/', expect: [ 'GET', '', [] ] },
    { method: 'POST', uri: '/', expect: false },   
    { method: 'GET', uri: '/static/robots.txt', expect: [ 'GET', '/static/robots.txt', [] ] },
    { method: 'GET', uri: '/users/tim/lamp', expect: [ 'GET', '/users/tim/lamp', [] ] },
    { method: 'POST', uri: '/users/tim/lamp', expect: false },
    { method: 'GET', uri: '/static/main/js/local/script.js', 
      expect: [ 'GET', '/static/main/js/local/script.js', [] ] },
    { method: 'POST', uri: '/static/main/js/local/script.js', expect: false },
];

// -- GROUP: Tagged uris with strict match enabled
const strictParams = [
    // -- GROUP: Tagged params are optional and NOT counted as endpoints
    { method: 'GET', uri: '/users/12/pages', expect: false },
    { method: 'POST', uri: '/users/15/pages/book', expect: false },
    { method: 'GET', uri: '/users/12/book/another/test/author', expect: false }
    // -- END GROUP    
];

// -- GROUP: Tagged uris with strict match disabled
const nonStrictParams =  [
    // -- GROUP: Tagged params are optional and NOT counted as endpoints
    { method: 'GET', uri: '/users/12/pages', expect: [ 'GET', '/users', [ '12', 'pages' ] ] },
    { method: 'POST', uri: '/users/15/pages/book', 
      expect: [ 'POST', '/users', [ '15', 'pages', 'book' ] ] },

    { method: 'GET', uri: '/users/12/book/another/test/author',
      expect: [ 'GET', '/users/another/test', [ '12', 'book', 'author' ] ] },
    // -- END GROUP    
];

function handler() {
    console.log("-----------> Handler: ", Array.from(arguments)); // eslint-disable-line
    return Array.from(arguments)[2];
}

var router = new Router();

// Add routes
for (let i=0, max=routes.length; i < max; i++) {
    router.add(routes[i].method, routes[i].uri, handler);
}

test("Router: Adding routes", (t) => {
    var r = new Router();

    const getRoutes = {
        '/api/1/': handler,
        '/': handler,
        '/users/:user/:thing': handler,
        '/users/:user/:thing/:another': handler,
        '/users/:user/:thing/another/test/:here': handler,
        '/static/robots.txt': handler,
        '/users/tim/lamp': handler,
        '/static/main/js/local/script.js': handler
    };

    const postRoutes = {
        '/users/:user/:thing/:another': handler
    };

    t.doesNotThrow(() => r._addScan());
    r._addScan('GET', getRoutes);
    r._addScan('POST', postRoutes);
    r._addScan('GET', 'api/2', handler);

    t.deepEqual(router.getRoutes(), r.getRoutes());
    t.doesNotThrow(() => r.add('GET', '/api/1/', handler));
    t.throws(() => r.add('GET', '/api/1/', () => "different handler"),
             new Error("Route Error: Duplicate route detected: GET /api/1 in uri: /api/1/"), { skip: false });

    t.end();
});

test("Router: _getMethod return values", (t) => {
    const types = [ 'GET','POST','PUT','DELETE','HEAD','PATCH','CONNECT','OPTIONS' ];

    for (var i=0, max=types.length; i < max; i++) {
        t.equal(router._getMethod(types[i]), i, types[i]);
    }

    t.throws(() => router._getMethod('UNKNOWN'), 
             new Error("Route Error: Invalid method specified: 'UNKNOWN'"), { skip: false });
    t.end();
});

test('Router: Normal URIs', (t) => {
    var item, result;

    for (var i=0, max=checks.length; i < max; i++) {
        item = checks[i];
        result = router.route(item.method, item.uri);
        t.deepEqual(item.expect, typeof item.expect === "object" || Array.isArray(item.expect) ? result.params : result);
    }

    t.end();
});

test('Router: Taged Parameters, Strict', (t) => {
    var item, result;
    
    for (var i=0, max=strictParams.length; i < max; i++) {
        item = strictParams[i];
        result = router.route(item.method, item.uri);

        t.deepEqual(item.expect, typeof item.expect === "object" || Array.isArray(item.expect) ? result.params : result);
    }

    t.end();
});

test('Router: Taged Parameters, Non-Strict', (t) => {
    var item, result;
    router.strictParams(false);

    for (var i=0, max=nonStrictParams.length; i < max; i++) {
        item = nonStrictParams[i];
        result = router.route(item.method, item.uri);

        t.deepEqual(item.expect, typeof item.expect === "object" || Array.isArray(item.expect) ? result.params : result);
    }

    t.end();
});
