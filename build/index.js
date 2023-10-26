"use strict";
import app from './app';
var _express = _interopRequireDefault(require("express"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var app = (0, _express["default"])();
const port = app.get('port');
app.listen(port);
console.log('Server listen on port 3000');