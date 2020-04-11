const axios = require('axios')
const { Base64 } = require('js-base64')

/**
 * The error structure returned when a network call fails
 */
class ResponseError extends Error {
  /**
   * Construct a new ResponseError
   * @param {string} message - an message to return instead of the the default error message
   * @param {string} path - the requested path
   * @param {Object} response - the object returned by Axios
   */
  constructor(message, path, response) {
    super(message);
    this.path = path;
    this.request = response.config;
    this.response = (response || {}).response || response;
    this.status = response.status;
  }
}

/**
 * Requestable wraps the logic for making http requests to the API
 */
class Requestable {
  /**
   * @prop {string} [username] - the Github username
   * @prop {string} [password] - the user's password
   */
  /**
                                     not provided request will be made unauthenticated
   * @param {string} [apiBase=https://api.github.com] - the base Github API URL
   * @param {string} [AcceptHeader=v3] - the accept header for the requests
   */
  constructor(username, password, apiBase, AcceptHeader) {
    this.__apiBase = apiBase || 'https://api.github.com';
    this.__auth = {
      username: username,
      password: password
    };
    this.__AcceptHeader = AcceptHeader || 'v3';

    this.__authorizationHeader = 'Basic ' + Base64.encode(username + ':' + password);
  }

  __getURL(path) {
    let url = path;

    if (path.indexOf('//') === -1) {
      url = this.__apiBase + path;
    }

    let newCacheBuster = 'timestamp=' + new Date().getTime();
    return url.replace(/(timestamp=\d+)/, newCacheBuster);
  }

  __getRequestHeaders(raw, AcceptHeader) {
    let headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/vnd.github.' + (AcceptHeader || this.__AcceptHeader),
    };

    if (raw) {
      headers.Accept += '.raw';
    }
    headers.Accept += '+json';

    if (this.__authorizationHeader) {
      headers.Authorization = this.__authorizationHeader;
    }

    return headers;
  }

  _request(method, path, data, raw) {
    const url = this.__getURL(path);

    const AcceptHeader = (data || {}).AcceptHeader;
    if (AcceptHeader) {
      delete data.AcceptHeader;
    }
    const headers = this.__getRequestHeaders(raw, AcceptHeader);

    let queryParams = {};

    const shouldUseDataAsParams = data && (typeof data === 'object') && methodHasNoBody(method);
    if (shouldUseDataAsParams) {
      queryParams = data;
      data = undefined;
    }

    const config = {
      url: url,
      method: method,
      headers: headers,
      params: queryParams,
      data: data,
      responseType: raw ? 'text' : 'json',
    };

    const requestPromise = axios(config).catch(callbackErrorOrThrow(path));

    return requestPromise;
  }

  /**
   * Make a request to an endpoint the returns 204 when true and 404 when false
   * @param {string} path - the path to request
   * @param {Object} data - any query parameters for the request
   * @param {Requestable.callback} cb - the callback that will receive `true` or `false`
   * @param {method} [method=GET] - HTTP Method to use
   * @return {Promise} - the promise for the http request
   */
  _request204or404(path, data, cb, method = 'GET') {
    return this._request(method, path, data)
      .then(function success(response) {
        if (cb) {
          cb(null, true, response);
        }
        return true;
      }, function failure(response) {
        if (response.response.status === 404) {
          if (cb) {
            cb(null, false, response);
          }
          return false;
        }

        if (cb) {
          cb(response);
        }
        throw response;
      });
  }
}

module.exports = Requestable;

// ////////////////////////// //
//  Private helper functions  //
// ////////////////////////// //
const METHODS_WITH_NO_BODY = ['GET', 'HEAD', 'DELETE'];
function methodHasNoBody(method) {
  return METHODS_WITH_NO_BODY.indexOf(method) !== -1;
}

function callbackErrorOrThrow(path) {
  return function handler(object) {
    let error;
    if (object.hasOwnProperty('config')) {
      const { response: { status, statusText }, config: { method, url } } = object;
      let message = (`${status} error making request ${method} ${url}: "${statusText}"`);
      error = new ResponseError(message, path, object);
      console.error(`${message} ${JSON.stringify(object.data)}`);
    } else {
      error = object;
    }
    throw error;
  };
}
