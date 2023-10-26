"use strict";
var _express = _interopRequireDefault(require("express"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var app = (0, _express["default"])();
const port = env.PORT || 3000;
app.listen(port);
console.log('Server listen on port', port);