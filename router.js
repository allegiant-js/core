const TYPE_DEF = 0;
const TYPE_VAR = 1;

const METHOD_GET = 0;
const METHOD_POST = 1;
const METHOD_PUT = 2;
const METHOD_DELETE = 3;
const METHOD_HEAD = 4;
const METHOD_PATCH = 5;
const METHOD_CONNECT = 6;
const METHOD_OPTIONS = 7;

class Router {
    constructor() {
        this._routes={};
        this._callbacks=[];
        this.tagParamEndPoints = false;
        this.strictParams();
    }

    _getType(item) {
        var type=TYPE_DEF;
        
        if (item[0] == ':')
            type = TYPE_VAR;

        return ({
            type: type,
            frag: item
        });
    }

    _getMethod(method) {
        switch (method) {
            case 'GET':
                return METHOD_GET;
            case 'POST':
                return METHOD_POST;
            case 'PUT':
                return METHOD_PUT;                
            case 'DELETE':
                return METHOD_DELETE;
            case 'HEAD':
                return METHOD_HEAD;
            case 'PATCH':
                return METHOD_PATCH;
            case 'CONNECT':
                return METHOD_CONNECT;
            case 'OPTIONS':
                return METHOD_OPTIONS;
            default:
                throw new Error("Route Error: Invalid method specified: '" + method + "'");
        }
    }

    _pieces(uri) {
        var str = uri[0] === '/' ? uri.slice(1) : uri;
        str = str[str.length-1] === '/' ? str.slice(0, -1) : str;

        return str.split('/');
    }

    _tokens(uri) {
        return this._pieces(uri).map(item => this._getType(item));
    }
    
    strictParams(enabled=true) {
        this.strictParamsEnabled = enabled;
    }

    add(method, uri, handler) {
        var toks = this._tokens(uri);
        var path = '', 
            item,
            i, max,
            params=[],
            current=this._routes;

        for (i=0, max=toks.length; i < max; i++) {
            item = toks[i];

            switch(item.type) {
                case TYPE_DEF:
                    if (path == '' && item.frag == '')
                        continue;

                    if (!current[item.frag])
                        current[item.frag] = {};

                    current = current[item.frag];
                    path += '/' + item.frag;
                break;
                case TYPE_VAR:
                    if (this.tagParamEndPoints) {
                        if (!current.__v)
                            current.__v = {};

                        if (current.__v.name && current.__v.name != item.frag.slice(1))
                            throw new Error("Route Error: different fragments at " + item.frag + 
                                             " in " + uri);

                        current = current.__v;
                        current.name = item.frag.slice(1);
                        params.push(current.name);
                    } else {
                        params.push(item.frag.slice(1));
                    }
                break;
                default:
                    throw new Error("Route Error: unknown fragment at " + item.frag + " in " + uri);
            }
        }

        if (!current['__c'])
            current['__c'] = {};

        var methods, index=-1, methodIndex;
        if (!Array.isArray(method)) {
            methods = [method];
        } else {
            //creates an array with unique values only
            methods = Array.from(new Set(method));
        }

        //console.log("--- Methods: ", methods);

        for (i=0, max=methods.length; i < max; i++) {
            method=methods[i];
            methodIndex = this._getMethod(method);

            index = this._callbacks.indexOf(handler);
            if (typeof current.__c[methodIndex] === 'undefined') {                
                if (index < 0) {
                    index = this._callbacks.length;
                    this._callbacks.push(handler);
                }

                current.__c[methodIndex] = index;
            } else if (index === -1 || index !== current.__c[methodIndex]) {
                throw new Error("Route Error: Duplicate route detected: " + method + " " + path + " in uri: " + uri);
            }
        }
    }

    _addScan(method, uri, handler=false) {
        if (typeof method === 'undefined') 
            return this;

        if (handler === false && typeof(uri) === 'object') {
            for (var path in uri) {
                if (!uri.hasOwnProperty(path)) continue;

                this.add(method, path, uri[path]);
            }

            return this;
        }

        this.add(method, uri, handler);
    }

    route(method, uri) {
        var toks = this._pieces(uri),
            path = '',
            item,
            params = this.tagParamEndPoints ? {} : [],
            current = this._routes,
            methodIndex = this._getMethod(method);

        for (var i=0, max=toks.length; i < max; i++) {
            item = toks[i];

            if (item == '') { // this shouldn't happen unless it's the end of a path, and only the root
                break;
            } else if (current[item]) {
                current = current[item];
                path += '/' + item;
            } else if (this.tagParamEndPoints) {
                if (current.__v) {
                    current = current.__v;
                    params[current.name] = item;
                    path += '/:' + current.name;
                } else {
                    return false;
                }
            } else {
                params.push(item);
            }
        }

        if (!current['__c'] || typeof current['__c'][methodIndex] != 'number')
            return false;

        var index = current.__c[methodIndex];
        var cb = this._callbacks[index];

        if (this.strictParamsEnabled && params.length != cb.length)
            return false;

        return {
            handler: cb,
            params: [method, path, params]
        };
    }

    getRoutes() {
        return this._routes;
    }
}

exports = module.exports = Router;