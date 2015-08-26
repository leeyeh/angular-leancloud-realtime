angular-leancloud-realtime
====
Angular module for LeanCloud Realtime SDK.

本模块在 leancloud-realtime SDK 的基础上添加了以下特性：

- 不再需要手动触发 angular 的 `$digests()`
- Promise 支持
- 自定义消息类型支持

## 安装
1. [安装 leancloud-realtime SDK](https://leancloud.cn/docs/js_realtime.html#安装与配置)，确保可以直接访问到 `window.AV.realtime`。
2. `bower install angular-leancloud-realtime --save`，然后在页面中引入 `bower_components/angular-leancloud-realtime/dist/index.js`。

## 使用
```javascript
// 添加为 myApp 的依赖
angular.module('myApp', ['angular-leancloud-realtime'])
// 调用模块提供的 LCRealtimeFactory 方法生成一个 Realtime 实例，将该实例注册为 realtimeInstance
.factory('realtimeInstance', function (LCRealtimeFactory) {
  return LCRealtimeFactory();
})
// 在 controller 中注入 realtimeInstance
.controller('myController', function(realtimeInstance) {
  // myController logic
  realtimeInstance.connect({
    appId: 'appId',
    clientId: 'clientId'
  });
});
```

## 自定义类型消息
模块中内置了以下几种消息：

- `LCMessage`：所有消息的基类
- `LCTypedMessage`：富媒体消息基类，继承自 `LCMessage`
- `LCTextMessage`，文本类型消息，继承自 `LCTypedMessage`

自定义类型消息同样需要是 `LCMessage` 的子类并分别实现以下几个方法来完成消息的编码与解码：

### 编码
- `toString(data) : String`
编码消息，消息最终需要编码为字符串进行传输，SDK 在发送消息前会调用该方法进行编码。data 为子类调用该方法时传入的参数。下面的例子是 `LCTypedMessage` 的 `toString()` 方法实现：
```javascript
  toString(data) {
    return super.toString(angular.extend({
      _lctext: this.content.text,
      _lcattrs: this.content.attr,
      _lctype: this.content.type
    }, data));
  }
```

### 解码
对于收到的消息字符串，SDK 将其解析为 content 与 metaData 两部分信息，然后通过 `validate()` 与 `parse()` 方法将其解析为合适的类型消息。

- `validate(content, metaData) : Boolean`
静态方法，验证一个消息是否是当前类型的消息，SDK 会依次调用已注册的 Message 类的 `validate()` 方法直到找到第一个返回 true 的 Message 类。
- `parse(content, metaData) : Message`
静态方法，接收消息的 content 与 metaData，返回当前类型消息的实例。SDK 在找到匹配的 Message 类后会调用该方法进行实例化。

自定义类型消息需要通过 [`LCRealtimeMessageParser.register()`](#registermessage) 方法进行注册。


## API
绝大部分的 API 与用法都与 leancloud-realtime SDK 保持一致，除了以下几处区别：

* 不再支持链式调用（所有返回 `this` 的 API 现在均不会返回 `this`）。
* 所有异步 API 均返回 Promise。
* Conversation 现在是个 EventEmmiter（增加了 `on`、`off` 等接口），`message` 与 `receipt` 事件代替了原来的`receive()` 与 `receipt()` 方法。
* 增加了 Message 相关的类。
* 调用 `LCRealtimeFactory()` 实例化 realtimeInstance 时不会自动连接 server，需要调用其 `connect()` 方法。
* `realtimeInstance.query()` 拆分为两个独立的 API `realtimeInstance.queryConvs()` 与 `realtimeInstance.getMyConvs()`。
* 移除了 `conversation.list()`，请直接访问 `conversation.members`，SDK 会保持用户列表最新 // TODO

### LCRealtimeFactory() : Realtime
工厂方法，得到一个 Realtime 实例

### Realtime
#### connect(options[, callback]) : Promise
连接后端服务器，options 参数见 [https://leancloud.cn/docs/js_realtime.html#AV_realtime](https://leancloud.cn/docs/js_realtime.html#AV_realtime)

#### close()
主动关闭连接。

#### on()、once()、off() ...
see [eventemitter2](https://www.npmjs.com/package/eventemitter2) 及 [事件列表](https://leancloud.cn/docs/js_realtime.html#全局事件)。

#### conv(options[, callback]) : Promise
查询一个指定 ID 的对话 / 新建一个对话，options 参见 [https://leancloud.cn/docs/js_realtime.html#RealtimeObject_conv](https://leancloud.cn/docs/js_realtime.html#RealtimeObject_conv)。
返回一 Promise resolved with a `Conversation`。如果查询的 conversation 不存在，Promise 会被 rejected。

#### room(options[, callback]) : Promise
Alias of `conv()`

#### getMyConvs([callback]) : Promise
获取包含当前用户的对话列表，返回一 Promise resolved with an array of `Conversation`s。

#### queryConvs(optoins[, callback]) : Promise
查询满足条件的对话，options 参见 [https://leancloud.cn/docs/js_realtime.html#RealtimeObject_query-1](https://leancloud.cn/docs/js_realtime.html#RealtimeObject_query-1)。
返回一 Promise resolved with an array of `Conversation`s。

#### query()
Alias of `queryConvs()`，deprecated，不推荐使用。

#### ping(clientIds, callback) : Promise
批量查询用户的在线状态，参数说明参见 [https://leancloud.cn/docs/js_realtime.html#RealtimeObject_ping](https://leancloud.cn/docs/js_realtime.html#RealtimeObject_ping)。

### Conversation
#### id : String
#### name : String
#### attr : Object
#### members : Array of String

#### add(clientId[, callback]) : Promise
#### remove(clientId[, callback]) : Promise
#### join([callback]) : Promise
#### leave([callback]) : Promise
参见 [对应 SDK 文档](https://leancloud.cn/docs/js_realtime.html#RoomObject_add)。

#### count([callback]) : Promise
获取当前会话的人数，仅对暂态会话有效，Promise resolved with a `Number`。

#### log(options[, callback]) : Promise
获取对话的历史消息，options 参见 [https://leancloud.cn/docs/js_realtime.html#RoomObject_log-1](https://leancloud.cn/docs/js_realtime.html#RoomObject_log-1)。
返回一 Promise resolved with an array of `Message`s。

#### send(message : Message[, callback]) : Promise
发送消息，Promise resolved with a `Message`。

#### on()、once()、off() ...
see [eventemitter2](https://www.npmjs.com/package/eventemitter2)

派发的事件如下：
##### message
会话中收到新消息，回调参数为收到的消息（`Message`）。
##### receipt
会话中收到消息已读的回执，回调参数是 ack。// FIXME

### LCRealtimeMessageParser
#### register(Message)
注册消息类型，Message 必须是 LCMessage 的子类。后注册的消息类型在解析时有较高的优先级。

### LCMessage
内置的消息基类，上文中提到的 `Message` 类指的即是该类或该类的子类。
`toString()`、`validate()`、`parse()`方法参见上文 [自定义类型消息](#自定义类型消息) 章节，不再列出，下同。
#### id
消息 ID
#### cid
消息所在的对话 ID
#### timestamp
消息发送时间安，毫秒。
#### from
发送者 ID
#### needReceipt
是否需要回执
#### transient
是否是暂态消息

### LCTypedMessage
除了继承自 `LCMessage` 的属性，还有：
#### content.attr
消息附带的额外的信息

### LCTextMessage
除了继承自 `LCTypedMessage` 的属性，还有：
#### content.text
文本内容
#### content.type
-1


## Build
```bash
npm install
npm run-script build -- --watch
```

## LICENSE

MIT
