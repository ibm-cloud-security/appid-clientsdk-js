(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";module.exports=function(){openPopup=function(){var e=e.open("www.google.com","popup","left=100,top=100,width=400,height=600,resizable,scrollbars=yes,status=1");return e},loginWidget=function(o,e){return o.location.href=e,new Promise(function(n,t){window.addEventListener("message",function(e){if(e.data&&"authorization_response"===e.data.type){if(o.close(),e.data.response.error)return t(e.data.response);n(e.data.response)}})})},randomString=function(){var n="",t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~.";return window.crypto.getRandomValues(new Uint8Array(43)).forEach(function(e){return n+=t[e%t.length]}),n}};
},{}]},{},[1]);
