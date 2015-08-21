angular-leancloud-realtime
====
Angular module for LeanCloud Realtime SDK.

## 安装
1. [安装 leancloud-realtime SDK](https://leancloud.cn/docs/js_realtime.html#安装与配置)，确保可以直接访问到 `window.AV.realtime`。
2. `bower install angular-leancloud-realtime --save`，然后在页面中引入 `bower_components/angular-leancloud-realtime/dist/index.js`。
3. 添加 `leancloud-realtime` 为你的 Angular 应用的依赖模块。

## 使用
```javascript
// 添加为 myApp 的依赖
angular.module('myApp', ['angular-leancloud-realtime'])
// 调用模块提供的 LCRealtimeFactory 方法生成一个 Realtime 实例，将该实例注册为 realtimeInstance
.factory('realtimeInstance', function (LCRealtimeFactory) {
  return LCRealtimeFactory();
})
// 在 controller 中注入 realtimeInstance
.controller('myController', ['realtimeInstance', function(realtimeInstance) {
  // myController logic
  realtimeInstance.connect({
    appId: 'appId',
    clientId: 'clientId'
  });
}]);
```

## API
绝大部分的 API 都与 leancloud-realtime SDK 保持一致，除了以下几处区别

* 所有返回 `this` 的 API 现在均不会返回 `this`
* 所有异步 API 均返回 Promise
* Conversation 现在是个 EventEmmiter（增加了 `on`、`off` 等接口）
* 增加了 Message 相关的类。
* 调用 `LCRealtimeFactory()` 实例化 realtimeInstance 时不会自动连接 server，需要调用其 `connect()` 方法。

### 详细文档
TODO

## LICENSE

MIT
