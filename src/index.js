import EventEmitter from 'eventemitter2';

class Realtime extends EventEmitter {
  constructor($rootScope, realtime, $q) {
    super();
    this.$rootScope = $rootScope;
    this.realtime = realtime;
    this.$q = $q;
    this.realtimeInstance = undefined;
    this._connectPromise = null;
  }

  _initEventsProxy() {
    this.realtimeInstance.on('message', (message) => {
      this.emit('message', MessageParser.parse(message));
      this.$rootScope.$digest();
    });
    [
      'open',
      'close',
      'create',
      'join',
      'left',
      'reuse',
      'receipt'
    ].forEach((event) =>
      this.realtimeInstance.on(event, (data) => {
        this.emit(event, data);
        this.$rootScope.$digest();
      })
    );
  }

  connect(options, callback = () => {}) {
    this._connectPromise = this.$q((resolve) => {
      this.realtimeInstance = this.realtime(options, (data) => {
        callback(data);
        resolve(data);
      });
      this._initEventsProxy();
    });
    return this._connectPromise;
  }

  _waitForConnect() {
    if (!this._connectPromise) {
      throw new Error('LeancloudRealtimeService.connect() never called.');
    } else {
      return this._connectPromise;
    }
  }

  close() {
    // TODO: sdk close 不会移除心跳
    this._waitForConnect().then(() => this.realtimeInstance.close());
  }

  room(options, callback = () => {}) {
    return this._waitForConnect().then(() => this.$q((resolve, reject) =>
      this.realtimeInstance.room(options, (originalConversation) => {
        if (!originalConversation) {
          reject(new Error('400: Conversation not exists on server.'));
        } else {
          this._conversationFactory(originalConversation).then((conversation) => {
            callback(conversation);
            resolve(conversation);
          });
        }
      })
    ));
  }

  conv(...args) {
    return this.room(...args);
  }

  queryConvs(options, callback = () => {}) {
    var result = this._waitForConnect().then(() => this.$q((resolve) => {
      this.realtimeInstance.query(options, (convs) => {
        resolve(convs);
      });
    })).then((convs) =>
      this.$q.all(convs.map((conv) => this.conv(conv.objectId)))
    );
    result.then((convs) => {
      callback(convs);
    });
    return result;
  }

  getMyConvs(callback) {
    return this.queryConvs({}, callback);
  }

  // deprecated, will be removed in v1.0
  query(...args) {
    return this.queryConvs(...args);
  }

  ping(clientIds, callback = () => {}) {
    return this.$q((resolve) => {
      this.realtimeInstance.ping(clientIds, (onlineClientIds) => {
        callback(onlineClientIds);
        resolve(onlineClientIds);
      });
    });
  }

  _conversationFactory(originalConversation) {
    return new Conversation(originalConversation, this.$rootScope, this.$q);
  }
}

class Conversation extends EventEmitter {
  constructor(originalConversation, $rootScope, $q) {
    super();
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
    }, (defaultValue, prop) => {
      if (originalConversation[prop] === undefined) {
        this[prop] = defaultValue;
      } else {
        this[prop] = originalConversation[prop];
      }
    });

    this._initEventsProxy();

    // TODO: members 应该是由 SDK 来维护的
    // SDK 中的 Conversation 封装把 members 等初始化的时候就能拿到的 members 信息都丢掉了
    // 这里只能异步再取一次
    return this.$q((resolve) => {
      this._list().then((members) => {
        this.members = members;
        resolve(this);
      });
    });
  }

  _initEventsProxy() {
    this.originalConversation.receive((message) => {
      this.emit('message', MessageParser.parse(message));
      this.$rootScope.$digest();
    });
    this.originalConversation.receipt((receipt) => {
      this.emit('receipt', receipt);
      this.$rootScope.$digest();
    });
  }

  // members 变成属性由 service 来维护，用户不再需要 list 方法
  _list() {
    return this.$q((resolve) => {
      this.originalConversation.list((members) => {
        resolve(members);
      });
    });
  }
  count(callback = () => {}) {
    return this.$q((resolve) => {
      this.originalConversation.count((amount) => {
        callback();
        resolve(amount);
      });
    });
  }
  log(options, callback) {
    if (callback === undefined) {
      [callback, options] = [options, {}];
    }
    return this.$q((resolve) => {
      this.originalConversation.log(options, (messages) => {
        messages = messages.map((message) => MessageParser.parse(message));
        if (typeof callback === 'function') {
          callback(messages);
        }
        resolve(messages);
      });
    });
  }
  join(callback = () => {}) {
    return this.$q((resolve) => {
      this.originalConversation.join(() => {
        callback();
        resolve();
      });
    });
  }
  leave(callback = () => {}) {
    return this.$q((resolve) => {
      this.originalConversation.leave(() => {
        callback();
        resolve();
      });
    });
  }
  add(clientIds, callback = () => {}) {
    return this.$q((resolve) => {
      this.originalConversation.add(clientIds, () => {
        callback();
        resolve();
      });
    });
  }
  remove(clientIds, callback = () => {}) {
    return this.$q((resolve) => {
      this.originalConversation.remove(clientIds, () => {
        callback();
        resolve();
      });
    });
  }
  send(message, callback = () => {}) {
    if (!(message instanceof Message)) {
      throw new TypeError(message + ' is not a Message');
    }
    var options = {
      r: message.needReceipt,
      transient: message.transient
    };
    return this.$q((resolve) => {
      this.originalConversation.send(message.toString(), options, () => {
        callback(message);
        resolve(message);
      });
    });
  }
  update(data, callback = () => {}) {
    return this.$q((resolve) => {
      this.originalConversation.update(data, () => {
        callback();
        resolve();
      });
    });
  }
  destroy() {
    // TODO: implement SDK 中的 Conversation::off 方法
  }
}

class Message {
  constructor(messageContent, mataData = {}) {
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
  toString(data) {
    return JSON.stringify(data || this.content);
  }
  static validate() {
    return true;
  }
  static parse(content, metaData) {
    if (typeof content === 'string') {
      return new Message(content, metaData);
    }
  }
}

class TypedMessage extends Message {
  constructor(content, mataData) {
    super(null, mataData);
    this.content = content;
    this.content.type = 0;
  }
  toString(data) {
    return super.toString(angular.extend({
      _lctext: this.content.text,
      _lcattrs: this.content.attr,
      _lctype: this.content.type
    }, data));
  }
  static validate(content, metaData) {
    if (super.validate(content, metaData)) {
      return typeof content._lctype === 'number';
    }
  }
  static parse(content, metaData) {
    return new TypedMessage({
      text: content._lctext,
      attr: content._attrs
    }, metaData);
  }
}
class TextMessage extends TypedMessage {
  constructor(content, mataData) {
    if (typeof content === 'string') {
      content = {
        text: content
      };
    }
    super(content, mataData);
    this.content.type = -1;
  }
  toString(data) {
    return super.toString(data);
  }
  static validate(content, metaData) {
    if (super.validate(content, metaData)) {
      return content._lctype === -1;
    }
    // 兼容现在的 sdk
    return content.msg.type === 'text';
  }
  static parse(content, metaData) {
    // 兼容现在的 sdk
    if (content.msg.type === 'text') {
      return new TextMessage(content.msg, content);
    }
    return new TextMessage(content, metaData);
  }
}

class MessageParser {
  static parse(message) {
    // 这里 sdk 已经包了一层，这里的实现是为了替代这一层包装
    // 暂时先用 sdk 包装后的 message
    for (var Klass of this._messageClasses) {
      try {
        if (Klass.validate(message)) {
          let result = Klass.parse(message);
          if (result !== undefined) {
            return result;
          }
        }
      } catch (e) {}
    }
  }
  static register(messageClass) {
    if (messageClass && messageClass.parse && messageClass.toString) {
      this._messageClasses.unshift(messageClass);
    } else {
      throw new TypeError('Invalid messageClass.');
    }
  }
}
MessageParser._messageClasses = [];
[Message, TypedMessage, TextMessage].forEach((Klass) => MessageParser.register(Klass));

angular.module('leancloud-realtime', [])
  .provider('LCRealtimeFactory', function() {
    var realtime;
    if (window && window.AV) {
      realtime = window.AV.realtime;
    }

    this.setRealtime = (r) => realtime = r;

    this.$get = ($rootScope, $q) => function LCRealtimeFactory() {
      if (!realtime) {
        throw new Error('realtime not found window.AV.realtime. It can also be configed via realtimeFactoryProvider.setRealtime().');
      }
      return new Realtime($rootScope, realtime, $q);
    };
    this.$get.$injects = ['$rootScope', '$q'];
  })
  .provider('LCRealtimeMessageParser', function() {
    this.register = MessageParser.register.bind(MessageParser);
    this.$get = function() {};
  })
  .value('LCMessage', Message)
  .value('LCTypedMessage', TypedMessage)
  .value('LCTextMessage', TextMessage);
