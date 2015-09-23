/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x13, _x14, _x15) { var _again = true; _function: while (_again) { var object = _x13, property = _x14, receiver = _x15; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x13 = parent; _x14 = property; _x15 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _eventemitter2 = __webpack_require__(1);

	var _eventemitter22 = _interopRequireDefault(_eventemitter2);

	var Realtime = (function (_EventEmitter) {
	  _inherits(Realtime, _EventEmitter);

	  function Realtime($rootScope, realtime, $q) {
	    _classCallCheck(this, Realtime);

	    _get(Object.getPrototypeOf(Realtime.prototype), 'constructor', this).call(this);
	    this.$rootScope = $rootScope;
	    this.realtime = realtime;
	    this.$q = $q;
	    this.realtimeInstance = undefined;
	    this._connectPromise = null;
	  }

	  _createClass(Realtime, [{
	    key: '_initEventsProxy',
	    value: function _initEventsProxy() {
	      var _this = this;

	      this.realtimeInstance.on('message', function (message) {
	        _this.emit('message', MessageParser.parse(message));
	        _this.$rootScope.$digest();
	      });
	      ['open', 'close', 'create', 'join', 'left', 'invited', 'kicked', 'membersjoined', 'membersleft', 'reuse', 'receipt'].forEach(function (event) {
	        return _this.realtimeInstance.on(event, function (data) {
	          _this.emit(event, data);
	          _this.$rootScope.$digest();
	        });
	      });
	    }
	  }, {
	    key: 'connect',
	    value: function connect(options) {
	      var _this2 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      this._connectPromise = this.$q(function (resolve) {
	        _this2.realtimeInstance = _this2.realtime(options, function (data) {
	          callback(data);
	          resolve(data);
	        });
	        _this2._initEventsProxy();
	      });
	      return this._connectPromise;
	    }
	  }, {
	    key: '_waitForConnect',
	    value: function _waitForConnect() {
	      if (!this._connectPromise) {
	        throw new Error('LeancloudRealtimeService.connect() never called.');
	      } else {
	        return this._connectPromise;
	      }
	    }
	  }, {
	    key: 'close',
	    value: function close() {
	      var _this3 = this;

	      // TODO: sdk close 不会移除心跳
	      this._waitForConnect().then(function () {
	        return _this3.realtimeInstance.close();
	      });
	    }
	  }, {
	    key: 'room',
	    value: function room(options) {
	      var _this4 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      return this._waitForConnect().then(function () {
	        return _this4.$q(function (resolve, reject) {
	          return _this4.realtimeInstance.room(options, function (originalConversation) {
	            if (!originalConversation) {
	              reject(new Error('400: Conversation not exists on server.'));
	            } else {
	              _this4._conversationFactory(originalConversation).then(function (conversation) {
	                callback(conversation);
	                resolve(conversation);
	              });
	            }
	          });
	        });
	      });
	    }
	  }, {
	    key: 'conv',
	    value: function conv() {
	      return this.room.apply(this, arguments);
	    }
	  }, {
	    key: 'queryConvs',
	    value: function queryConvs(options) {
	      var _this5 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      var result = this._waitForConnect().then(function () {
	        return _this5.$q(function (resolve) {
	          _this5.realtimeInstance.query(options, function (convs) {
	            resolve(convs);
	          });
	        });
	      }).then(function (convs) {
	        return _this5.$q.all(convs.map(function (conv) {
	          return _this5.conv(conv.objectId);
	        }));
	      });
	      result.then(function (convs) {
	        callback(convs);
	      });
	      return result;
	    }
	  }, {
	    key: 'getMyConvs',
	    value: function getMyConvs(callback) {
	      return this.queryConvs({}, callback);
	    }

	    // deprecated, will be removed in v1.0
	  }, {
	    key: 'query',
	    value: function query() {
	      return this.queryConvs.apply(this, arguments);
	    }
	  }, {
	    key: 'ping',
	    value: function ping(clientIds) {
	      var _this6 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      return this.$q(function (resolve) {
	        _this6.realtimeInstance.ping(clientIds, function (onlineClientIds) {
	          callback(onlineClientIds);
	          resolve(onlineClientIds);
	        });
	      });
	    }
	  }, {
	    key: '_conversationFactory',
	    value: function _conversationFactory(originalConversation) {
	      return new Conversation(originalConversation, this.$rootScope, this.$q);
	    }
	  }]);

	  return Realtime;
	})(_eventemitter22['default']);

	var Conversation = (function (_EventEmitter2) {
	  _inherits(Conversation, _EventEmitter2);

	  function Conversation(originalConversation, $rootScope, $q) {
	    var _this7 = this;

	    _classCallCheck(this, Conversation);

	    _get(Object.getPrototypeOf(Conversation.prototype), 'constructor', this).call(this);
	    this.originalConversation = originalConversation;
	    this.$rootScope = $rootScope;
	    this.$q = $q;

	    // lm、transient、muted 字段被 sdk 丢掉了
	    angular.forEach({
	      'id': undefined,
	      'name': undefined,
	      'attr': undefined,
	      'members': [],
	      'lastMessageTime': 0,
	      'muted': false
	    }, function (defaultValue, prop) {
	      if (originalConversation[prop] === undefined) {
	        _this7[prop] = defaultValue;
	      } else {
	        _this7[prop] = originalConversation[prop];
	      }
	    });

	    this._initEventsProxy();

	    // TODO: members 应该是由 SDK 来维护的
	    // SDK 中的 Conversation 封装把 members 等初始化的时候就能拿到的 members 信息都丢掉了
	    // 这里只能异步再取一次
	    return this.$q(function (resolve) {
	      _this7._list().then(function (members) {
	        _this7.members = members;
	        resolve(_this7);
	      });
	    });
	  }

	  _createClass(Conversation, [{
	    key: '_initEventsProxy',
	    value: function _initEventsProxy() {
	      var _this8 = this;

	      this.originalConversation.receive(function (message) {
	        _this8.emit('message', MessageParser.parse(message));
	        _this8.$rootScope.$digest();
	      });
	      this.originalConversation.receipt(function (receipt) {
	        _this8.emit('receipt', receipt);
	        _this8.$rootScope.$digest();
	      });
	    }

	    // members 变成属性由 service 来维护，用户不再需要 list 方法
	  }, {
	    key: '_list',
	    value: function _list() {
	      var _this9 = this;

	      return this.$q(function (resolve) {
	        _this9.originalConversation.list(function (members) {
	          resolve(members);
	        });
	      });
	    }
	  }, {
	    key: 'count',
	    value: function count() {
	      var _this10 = this;

	      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

	      return this.$q(function (resolve) {
	        _this10.originalConversation.count(function (amount) {
	          callback();
	          resolve(amount);
	        });
	      });
	    }
	  }, {
	    key: 'log',
	    value: function log(options, callback) {
	      var _this11 = this;

	      if (callback === undefined) {
	        var _ref = [options, {}];
	        callback = _ref[0];
	        options = _ref[1];
	      }
	      return this.$q(function (resolve) {
	        _this11.originalConversation.log(options, function (messages) {
	          messages = messages.map(function (message) {
	            return MessageParser.parse(message);
	          });
	          if (typeof callback === 'function') {
	            callback(messages);
	          }
	          resolve(messages);
	        });
	      });
	    }
	  }, {
	    key: 'join',
	    value: function join() {
	      var _this12 = this;

	      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

	      return this.$q(function (resolve) {
	        _this12.originalConversation.join(function () {
	          callback();
	          resolve();
	        });
	      });
	    }
	  }, {
	    key: 'leave',
	    value: function leave() {
	      var _this13 = this;

	      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

	      return this.$q(function (resolve) {
	        _this13.originalConversation.leave(function () {
	          callback();
	          resolve();
	        });
	      });
	    }
	  }, {
	    key: 'add',
	    value: function add(clientIds) {
	      var _this14 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      return this.$q(function (resolve) {
	        _this14.originalConversation.add(clientIds, function () {
	          callback();
	          resolve();
	        });
	      });
	    }
	  }, {
	    key: 'remove',
	    value: function remove(clientIds) {
	      var _this15 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      return this.$q(function (resolve) {
	        _this15.originalConversation.remove(clientIds, function () {
	          callback();
	          resolve();
	        });
	      });
	    }
	  }, {
	    key: 'send',
	    value: function send(message) {
	      var _this16 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      if (!(message instanceof Message)) {
	        throw new TypeError(message + ' is not a Message');
	      }
	      var options = {
	        r: message.needReceipt,
	        transient: message.transient
	      };
	      return this.$q(function (resolve) {
	        _this16.originalConversation.send(message.toString(), options, function () {
	          callback(message);
	          resolve(message);
	        });
	      });
	    }
	  }, {
	    key: 'update',
	    value: function update(data) {
	      var _this17 = this;

	      var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	      return this.$q(function (resolve) {
	        _this17.originalConversation.update(data, function () {
	          callback();
	          resolve();
	        });
	      });
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy() {
	      // TODO: implement SDK 中的 Conversation::off 方法
	    }
	  }]);

	  return Conversation;
	})(_eventemitter22['default']);

	var Message = (function () {
	  function Message(messageContent) {
	    var mataData = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    _classCallCheck(this, Message);

	    {
	      if (typeof content === 'string') {
	        this.content = messageContent;
	      }
	      if (mataData.fromPeerId) {
	        mataData.from = mataData.fromPeerId;
	      }
	      if (mataData.msgId) {
	        mataData.id = mataData.msgId;
	      }
	      angular.extend(this, {
	        id: undefined,
	        cid: null,
	        timestamp: Date.now(),
	        from: undefined,
	        needReceipt: false,
	        transient: false
	      }, mataData);
	    }
	  }

	  _createClass(Message, [{
	    key: 'toString',
	    value: function toString(data) {
	      return JSON.stringify(data || this.content);
	    }
	  }], [{
	    key: 'validate',
	    value: function validate() {
	      return true;
	    }
	  }, {
	    key: 'parse',
	    value: function parse(content, metaData) {
	      if (typeof content === 'string') {
	        return new Message(content, metaData);
	      }
	    }
	  }]);

	  return Message;
	})();

	var TypedMessage = (function (_Message) {
	  _inherits(TypedMessage, _Message);

	  function TypedMessage(content, mataData) {
	    _classCallCheck(this, TypedMessage);

	    _get(Object.getPrototypeOf(TypedMessage.prototype), 'constructor', this).call(this, null, mataData);
	    this.content = content;
	    this.content.type = 0;
	  }

	  _createClass(TypedMessage, [{
	    key: 'toString',
	    value: function toString(data) {
	      return _get(Object.getPrototypeOf(TypedMessage.prototype), 'toString', this).call(this, angular.extend({
	        _lctext: this.content.text,
	        _lcattrs: this.content.attr,
	        _lctype: this.content.type
	      }, data));
	    }
	  }], [{
	    key: 'validate',
	    value: function validate(content, metaData) {
	      if (_get(Object.getPrototypeOf(TypedMessage), 'validate', this).call(this, content, metaData)) {
	        return typeof content._lctype === 'number';
	      }
	    }
	  }, {
	    key: 'parse',
	    value: function parse(content, metaData) {
	      return new TypedMessage({
	        text: content._lctext,
	        attr: content._attrs
	      }, metaData);
	    }
	  }]);

	  return TypedMessage;
	})(Message);

	var TextMessage = (function (_TypedMessage) {
	  _inherits(TextMessage, _TypedMessage);

	  function TextMessage(content, mataData) {
	    _classCallCheck(this, TextMessage);

	    if (typeof content === 'string') {
	      content = {
	        text: content
	      };
	    }
	    _get(Object.getPrototypeOf(TextMessage.prototype), 'constructor', this).call(this, content, mataData);
	    this.content.type = -1;
	  }

	  _createClass(TextMessage, [{
	    key: 'toString',
	    value: function toString(data) {
	      return _get(Object.getPrototypeOf(TextMessage.prototype), 'toString', this).call(this, data);
	    }
	  }], [{
	    key: 'validate',
	    value: function validate(content, metaData) {
	      if (_get(Object.getPrototypeOf(TextMessage), 'validate', this).call(this, content, metaData)) {
	        return content._lctype === -1;
	      }
	      // 兼容现在的 sdk
	      return content.msg.type === 'text';
	    }
	  }, {
	    key: 'parse',
	    value: function parse(content, metaData) {
	      // 兼容现在的 sdk
	      if (content.msg.type === 'text') {
	        return new TextMessage(content.msg, content);
	      }
	      return new TextMessage(content, metaData);
	    }
	  }]);

	  return TextMessage;
	})(TypedMessage);

	var MessageParser = (function () {
	  function MessageParser() {
	    _classCallCheck(this, MessageParser);
	  }

	  _createClass(MessageParser, null, [{
	    key: 'parse',
	    value: function parse(message) {
	      // 这里 sdk 已经包了一层，这里的实现是为了替代这一层包装
	      // 暂时先用 sdk 包装后的 message
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = this._messageClasses[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var Klass = _step.value;

	          try {
	            var messageCopy = angular.copy(message);
	            if (Klass.validate(messageCopy)) {
	              var result = Klass.parse(messageCopy);
	              if (result !== undefined) {
	                return result;
	              }
	            }
	          } catch (e) {}
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator['return']) {
	            _iterator['return']();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'register',
	    value: function register(messageClass) {
	      if (messageClass && messageClass.parse && messageClass.toString) {
	        this._messageClasses.unshift(messageClass);
	      } else {
	        throw new TypeError('Invalid messageClass.');
	      }
	    }
	  }]);

	  return MessageParser;
	})();

	MessageParser._messageClasses = [];
	[Message, TypedMessage, TextMessage].forEach(function (Klass) {
	  return MessageParser.register(Klass);
	});

	angular.module('leancloud-realtime', []).provider('LCRealtimeFactory', function () {
	  var realtime;
	  if (window && window.AV) {
	    realtime = window.AV.realtime;
	  }

	  this.setRealtime = function (r) {
	    return realtime = r;
	  };

	  this.$get = function ($rootScope, $q) {
	    return function LCRealtimeFactory() {
	      if (!realtime) {
	        throw new Error('realtime not found window.AV.realtime. It can also be configed via realtimeFactoryProvider.setRealtime().');
	      }
	      return new Realtime($rootScope, realtime, $q);
	    };
	  };
	  this.$get.$injects = ['$rootScope', '$q'];
	}).provider('LCRealtimeMessageParser', function () {
	  this.register = MessageParser.register.bind(MessageParser);
	  this.$get = function () {};
	}).value('LCMessage', Message).value('LCTypedMessage', TypedMessage).value('LCTextMessage', TextMessage);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * EventEmitter2
	 * https://github.com/hij1nx/EventEmitter2
	 *
	 * Copyright (c) 2013 hij1nx
	 * Licensed under the MIT license.
	 */
	;!function(undefined) {

	  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
	    return Object.prototype.toString.call(obj) === "[object Array]";
	  };
	  var defaultMaxListeners = 10;

	  function init() {
	    this._events = {};
	    if (this._conf) {
	      configure.call(this, this._conf);
	    }
	  }

	  function configure(conf) {
	    if (conf) {

	      this._conf = conf;

	      conf.delimiter && (this.delimiter = conf.delimiter);
	      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
	      conf.wildcard && (this.wildcard = conf.wildcard);
	      conf.newListener && (this.newListener = conf.newListener);

	      if (this.wildcard) {
	        this.listenerTree = {};
	      }
	    }
	  }

	  function EventEmitter(conf) {
	    this._events = {};
	    this.newListener = false;
	    configure.call(this, conf);
	  }

	  //
	  // Attention, function return type now is array, always !
	  // It has zero elements if no any matches found and one or more
	  // elements (leafs) if there are matches
	  //
	  function searchListenerTree(handlers, type, tree, i) {
	    if (!tree) {
	      return [];
	    }
	    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
	        typeLength = type.length, currentType = type[i], nextType = type[i+1];
	    if (i === typeLength && tree._listeners) {
	      //
	      // If at the end of the event(s) list and the tree has listeners
	      // invoke those listeners.
	      //
	      if (typeof tree._listeners === 'function') {
	        handlers && handlers.push(tree._listeners);
	        return [tree];
	      } else {
	        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
	          handlers && handlers.push(tree._listeners[leaf]);
	        }
	        return [tree];
	      }
	    }

	    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
	      //
	      // If the event emitted is '*' at this part
	      // or there is a concrete match at this patch
	      //
	      if (currentType === '*') {
	        for (branch in tree) {
	          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
	            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
	          }
	        }
	        return listeners;
	      } else if(currentType === '**') {
	        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
	        if(endReached && tree._listeners) {
	          // The next element has a _listeners, add it to the handlers.
	          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
	        }

	        for (branch in tree) {
	          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
	            if(branch === '*' || branch === '**') {
	              if(tree[branch]._listeners && !endReached) {
	                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
	              }
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
	            } else if(branch === nextType) {
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
	            } else {
	              // No match on this one, shift into the tree but not in the type array.
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
	            }
	          }
	        }
	        return listeners;
	      }

	      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
	    }

	    xTree = tree['*'];
	    if (xTree) {
	      //
	      // If the listener tree will allow any match for this part,
	      // then recursively explore all branches of the tree
	      //
	      searchListenerTree(handlers, type, xTree, i+1);
	    }

	    xxTree = tree['**'];
	    if(xxTree) {
	      if(i < typeLength) {
	        if(xxTree._listeners) {
	          // If we have a listener on a '**', it will catch all, so add its handler.
	          searchListenerTree(handlers, type, xxTree, typeLength);
	        }

	        // Build arrays of matching next branches and others.
	        for(branch in xxTree) {
	          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
	            if(branch === nextType) {
	              // We know the next element will match, so jump twice.
	              searchListenerTree(handlers, type, xxTree[branch], i+2);
	            } else if(branch === currentType) {
	              // Current node matches, move into the tree.
	              searchListenerTree(handlers, type, xxTree[branch], i+1);
	            } else {
	              isolatedBranch = {};
	              isolatedBranch[branch] = xxTree[branch];
	              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
	            }
	          }
	        }
	      } else if(xxTree._listeners) {
	        // We have reached the end and still on a '**'
	        searchListenerTree(handlers, type, xxTree, typeLength);
	      } else if(xxTree['*'] && xxTree['*']._listeners) {
	        searchListenerTree(handlers, type, xxTree['*'], typeLength);
	      }
	    }

	    return listeners;
	  }

	  function growListenerTree(type, listener) {

	    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

	    //
	    // Looks for two consecutive '**', if so, don't add the event at all.
	    //
	    for(var i = 0, len = type.length; i+1 < len; i++) {
	      if(type[i] === '**' && type[i+1] === '**') {
	        return;
	      }
	    }

	    var tree = this.listenerTree;
	    var name = type.shift();

	    while (name) {

	      if (!tree[name]) {
	        tree[name] = {};
	      }

	      tree = tree[name];

	      if (type.length === 0) {

	        if (!tree._listeners) {
	          tree._listeners = listener;
	        }
	        else if(typeof tree._listeners === 'function') {
	          tree._listeners = [tree._listeners, listener];
	        }
	        else if (isArray(tree._listeners)) {

	          tree._listeners.push(listener);

	          if (!tree._listeners.warned) {

	            var m = defaultMaxListeners;

	            if (typeof this._events.maxListeners !== 'undefined') {
	              m = this._events.maxListeners;
	            }

	            if (m > 0 && tree._listeners.length > m) {

	              tree._listeners.warned = true;
	              console.error('(node) warning: possible EventEmitter memory ' +
	                            'leak detected. %d listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit.',
	                            tree._listeners.length);
	              console.trace();
	            }
	          }
	        }
	        return true;
	      }
	      name = type.shift();
	    }
	    return true;
	  }

	  // By default EventEmitters will print a warning if more than
	  // 10 listeners are added to it. This is a useful default which
	  // helps finding memory leaks.
	  //
	  // Obviously not all Emitters should be limited to 10. This function allows
	  // that to be increased. Set to zero for unlimited.

	  EventEmitter.prototype.delimiter = '.';

	  EventEmitter.prototype.setMaxListeners = function(n) {
	    this._events || init.call(this);
	    this._events.maxListeners = n;
	    if (!this._conf) this._conf = {};
	    this._conf.maxListeners = n;
	  };

	  EventEmitter.prototype.event = '';

	  EventEmitter.prototype.once = function(event, fn) {
	    this.many(event, 1, fn);
	    return this;
	  };

	  EventEmitter.prototype.many = function(event, ttl, fn) {
	    var self = this;

	    if (typeof fn !== 'function') {
	      throw new Error('many only accepts instances of Function');
	    }

	    function listener() {
	      if (--ttl === 0) {
	        self.off(event, listener);
	      }
	      fn.apply(this, arguments);
	    }

	    listener._origin = fn;

	    this.on(event, listener);

	    return self;
	  };

	  EventEmitter.prototype.emit = function() {

	    this._events || init.call(this);

	    var type = arguments[0];

	    if (type === 'newListener' && !this.newListener) {
	      if (!this._events.newListener) { return false; }
	    }

	    // Loop through the *_all* functions and invoke them.
	    if (this._all) {
	      var l = arguments.length;
	      var args = new Array(l - 1);
	      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	      for (i = 0, l = this._all.length; i < l; i++) {
	        this.event = type;
	        this._all[i].apply(this, args);
	      }
	    }

	    // If there is no 'error' event listener then throw.
	    if (type === 'error') {

	      if (!this._all &&
	        !this._events.error &&
	        !(this.wildcard && this.listenerTree.error)) {

	        if (arguments[1] instanceof Error) {
	          throw arguments[1]; // Unhandled 'error' event
	        } else {
	          throw new Error("Uncaught, unspecified 'error' event.");
	        }
	        return false;
	      }
	    }

	    var handler;

	    if(this.wildcard) {
	      handler = [];
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
	    }
	    else {
	      handler = this._events[type];
	    }

	    if (typeof handler === 'function') {
	      this.event = type;
	      if (arguments.length === 1) {
	        handler.call(this);
	      }
	      else if (arguments.length > 1)
	        switch (arguments.length) {
	          case 2:
	            handler.call(this, arguments[1]);
	            break;
	          case 3:
	            handler.call(this, arguments[1], arguments[2]);
	            break;
	          // slower
	          default:
	            var l = arguments.length;
	            var args = new Array(l - 1);
	            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	            handler.apply(this, args);
	        }
	      return true;
	    }
	    else if (handler) {
	      var l = arguments.length;
	      var args = new Array(l - 1);
	      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

	      var listeners = handler.slice();
	      for (var i = 0, l = listeners.length; i < l; i++) {
	        this.event = type;
	        listeners[i].apply(this, args);
	      }
	      return (listeners.length > 0) || !!this._all;
	    }
	    else {
	      return !!this._all;
	    }

	  };

	  EventEmitter.prototype.on = function(type, listener) {

	    if (typeof type === 'function') {
	      this.onAny(type);
	      return this;
	    }

	    if (typeof listener !== 'function') {
	      throw new Error('on only accepts instances of Function');
	    }
	    this._events || init.call(this);

	    // To avoid recursion in the case that type == "newListeners"! Before
	    // adding it to the listeners, first emit "newListeners".
	    this.emit('newListener', type, listener);

	    if(this.wildcard) {
	      growListenerTree.call(this, type, listener);
	      return this;
	    }

	    if (!this._events[type]) {
	      // Optimize the case of one listener. Don't need the extra array object.
	      this._events[type] = listener;
	    }
	    else if(typeof this._events[type] === 'function') {
	      // Adding the second element, need to change to array.
	      this._events[type] = [this._events[type], listener];
	    }
	    else if (isArray(this._events[type])) {
	      // If we've already got an array, just append.
	      this._events[type].push(listener);

	      // Check for listener leak
	      if (!this._events[type].warned) {

	        var m = defaultMaxListeners;

	        if (typeof this._events.maxListeners !== 'undefined') {
	          m = this._events.maxListeners;
	        }

	        if (m > 0 && this._events[type].length > m) {

	          this._events[type].warned = true;
	          console.error('(node) warning: possible EventEmitter memory ' +
	                        'leak detected. %d listeners added. ' +
	                        'Use emitter.setMaxListeners() to increase limit.',
	                        this._events[type].length);
	          console.trace();
	        }
	      }
	    }
	    return this;
	  };

	  EventEmitter.prototype.onAny = function(fn) {

	    if (typeof fn !== 'function') {
	      throw new Error('onAny only accepts instances of Function');
	    }

	    if(!this._all) {
	      this._all = [];
	    }

	    // Add the function to the event listener collection.
	    this._all.push(fn);
	    return this;
	  };

	  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	  EventEmitter.prototype.off = function(type, listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('removeListener only takes instances of Function');
	    }

	    var handlers,leafs=[];

	    if(this.wildcard) {
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
	    }
	    else {
	      // does not use listeners(), so no side effect of creating _events[type]
	      if (!this._events[type]) return this;
	      handlers = this._events[type];
	      leafs.push({_listeners:handlers});
	    }

	    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
	      var leaf = leafs[iLeaf];
	      handlers = leaf._listeners;
	      if (isArray(handlers)) {

	        var position = -1;

	        for (var i = 0, length = handlers.length; i < length; i++) {
	          if (handlers[i] === listener ||
	            (handlers[i].listener && handlers[i].listener === listener) ||
	            (handlers[i]._origin && handlers[i]._origin === listener)) {
	            position = i;
	            break;
	          }
	        }

	        if (position < 0) {
	          continue;
	        }

	        if(this.wildcard) {
	          leaf._listeners.splice(position, 1);
	        }
	        else {
	          this._events[type].splice(position, 1);
	        }

	        if (handlers.length === 0) {
	          if(this.wildcard) {
	            delete leaf._listeners;
	          }
	          else {
	            delete this._events[type];
	          }
	        }
	        return this;
	      }
	      else if (handlers === listener ||
	        (handlers.listener && handlers.listener === listener) ||
	        (handlers._origin && handlers._origin === listener)) {
	        if(this.wildcard) {
	          delete leaf._listeners;
	        }
	        else {
	          delete this._events[type];
	        }
	      }
	    }

	    return this;
	  };

	  EventEmitter.prototype.offAny = function(fn) {
	    var i = 0, l = 0, fns;
	    if (fn && this._all && this._all.length > 0) {
	      fns = this._all;
	      for(i = 0, l = fns.length; i < l; i++) {
	        if(fn === fns[i]) {
	          fns.splice(i, 1);
	          return this;
	        }
	      }
	    } else {
	      this._all = [];
	    }
	    return this;
	  };

	  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

	  EventEmitter.prototype.removeAllListeners = function(type) {
	    if (arguments.length === 0) {
	      !this._events || init.call(this);
	      return this;
	    }

	    if(this.wildcard) {
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

	      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
	        var leaf = leafs[iLeaf];
	        leaf._listeners = null;
	      }
	    }
	    else {
	      if (!this._events[type]) return this;
	      this._events[type] = null;
	    }
	    return this;
	  };

	  EventEmitter.prototype.listeners = function(type) {
	    if(this.wildcard) {
	      var handlers = [];
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
	      return handlers;
	    }

	    this._events || init.call(this);

	    if (!this._events[type]) this._events[type] = [];
	    if (!isArray(this._events[type])) {
	      this._events[type] = [this._events[type]];
	    }
	    return this._events[type];
	  };

	  EventEmitter.prototype.listenersAny = function() {

	    if(this._all) {
	      return this._all;
	    }
	    else {
	      return [];
	    }

	  };

	  if (true) {
	     // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return EventEmitter;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    // CommonJS
	    exports.EventEmitter2 = EventEmitter;
	  }
	  else {
	    // Browser global.
	    window.EventEmitter2 = EventEmitter;
	  }
	}();


/***/ }
/******/ ]);