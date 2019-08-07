"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var utils = _interopRequireWildcard(require("./utils"));

var authorizationEndpoint = '/authorization';
var responseType = 'code';
var redirectUri = window.location.origin;

module.exports =
/*#__PURE__*/
function () {
  function AppID(clientID, discoveryUrl) {
    (0, _classCallCheck2["default"])(this, AppID);
    this.clientID = clientID;
    this.discoveryUrl = fetch(discoveryUrl);
  } // init() {
  // 	this.clientID = clientID;
  // 	this.discoveryUrl = fetch(discoveryUrl);
  // 	console.log(this.discoveryUrl);
  // }

  /**
   * ```js
   * await appid.signinWithPopup();
   * ```
   * A promise to ID token payload by default and access token. If there is an error in the callback, reject the promise with the error
   */


  (0, _createClass2["default"])(AppID, [{
    key: "signinWithPopup",
    value: function () {
      var _signinWithPopup = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var popup, challenge_method, code_verifier, code_challenge, authUrl, authCode, token;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // open popup
                popup = utils.openPopup();
                challenge_method = 'sh256';
                code_verifier = utils.randomString();
                code_challenge = code_verifier;
                authUrl = encodeURI(authorizationEndpoint + "?client_id=" + this.clientID + // "?code_challenge=" + code_challenge +
                // "?challenge_method=" + challenge_method +
                "&response_type=" + responseType + // "&redirect_uri=" + redirectUri +
                "&scope=" + 'openid');
                _context.next = 7;
                return utils.loginWidget(popup, authUrl);

              case 7:
                authCode = _context.sent;
                _context.next = 10;
                return utils.exchangeTokens(this.discoveryUrl.token_endpoint, authCode);

              case 10:
                token = _context.sent;

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function signinWithPopup() {
        return _signinWithPopup.apply(this, arguments);
      }

      return signinWithPopup;
    }()
  }]);
  return AppID;
}();