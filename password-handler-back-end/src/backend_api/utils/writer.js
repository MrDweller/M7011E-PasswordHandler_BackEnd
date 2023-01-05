var ResponsePayload = function (code, payload) {
  this.code = code;
  this.payload = payload;
}

exports.respondWithCode = function (code, payload) {
  return new ResponsePayload(code, payload);
}

var writeJson = exports.writeJson = function (response, arg1, arg2) {
  var code;
  var payload;

  if (arg1 && arg1 instanceof ResponsePayload) {
    writeJson(response, arg1.payload, arg1.code);
    return;
  }

  if (arg2 && Number.isInteger(arg2)) {
    code = arg2;
  }
  else {
    if (arg1 && Number.isInteger(arg1)) {
      code = arg1;
    }
  }
  if (code && arg1) {
    payload = arg1;
  }
  else if (arg1) {
    payload = arg1;
  }

  if (!code) {
    // if no response code given, we default to 200
    code = 200;
  }
  if (typeof payload === 'object') {
    payload = JSON.stringify(payload, null, 2);
  }
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.end(payload);
}

var writeHeaders = exports.writeHeaders = function (response, headers, code) {
  response.writeHead(code, headers);
  response.end();
}

var writeHeadersAndJson = exports.writeHeadersAndJson = function (response, headers, payload, code) {
  headers['Content-Type'] = 'application/json';
  response.writeHead(code, headers);
  payload = JSON.stringify(payload, null, 2);
  response.end(payload);
}

var writeErrorCode = exports.writeErrorCode = function (res, response) {
  if (Number.isInteger(response)){
    writeHeaders(res, null, response);
  }
  else {
    writeHeaders(res, null, 400);

  }
}