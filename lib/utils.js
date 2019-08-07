"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomString = exports.exchangeTokens = exports.loginWidget = exports.openPopup = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var openPopup = function openPopup() {
  var window = window.open('www.google.com', 'popup', 'left=100,top=100,width=400,height=600,resizable,scrollbars=yes,status=1');
  return window;
};

exports.openPopup = openPopup;

var loginWidget = function loginWidget(popup, url) {
  popup.location.href = url;
  return new Promise(function (resolve, reject) {
    window.addEventListener('message', function (e) {
      if (!e.data || e.data.type !== 'authorization_response') {
        return;
      }

      popup.close();

      if (e.data.response.error) {
        return reject(e.data.response);
      }

      resolve(e.data.response);
    });
  });
};

exports.loginWidget = loginWidget;

var exchangeTokens =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(endpoint, authCode) {
    var tokens;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch(endpoint, {
              method: 'POST',
              body: JSON.stringify(_objectSpread({
                grant_type: 'authorization_code',
                redirect_uri: window.location.origin
              }, options)),
              headers: {
                'Content-type': 'application/json'
              }
            });

          case 2:
            tokens = _context.sent;
            return _context.abrupt("return", tokens);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function exchangeTokens(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.exchangeTokens = exchangeTokens;

var randomString = function randomString() {
  var random = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.';
  var array = window.crypto.getRandomValues(new Uint8Array(43));
  array.forEach(function (v) {
    return random += characters[v % characters.length];
  });
  return random;
};

exports.randomString = randomString;