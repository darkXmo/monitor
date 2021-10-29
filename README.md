# ageis-monitor [![npm license](https://img.shields.io/npm/l/@xmon/monitor.svg?sanitize=true)](https://github.com/darkXmo/monitor/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@xmon/monitor.svg?sanitize=true)](https://www.npmjs.com/package/@xmon/monitor)

页面行为监控，目前可以监控事件包括

1. 点击事件（Click）
2. 页面加载（Load & Unload）
3. 特定行为（Action）
4. Axios 请求（Api）

5. 路由跳转（Router）

## 安装

```bash
# yarn
yarn add @xmon/monitor

# npm
npm install @xmon/monitor

# pnpm
pnpm install @xmon/monitor
```

## 使用方法

### 创建实例

```javascript
import { initMonitorVue } from "@xmon/monitor";
const monitor = initMonitor();
```

### 创建监听 Vue 的实例(Vue-Router)

```javascript
// 如果不需要监听Vue-Router的路由跳转事件，可以采用标准Monitor
import router from "@/router"; // 如果需要监听Vue-Router的路由跳转事件的话
import { initMonitorVue } from "@xmon/monitor";
const monitor = initMonitorVue(router);
```

### 开启监听事件

#### 监听页面加载 Load 和 Unload 事件

```javascript
monitor.monitorPage();

monitor.on("Load", (payload) => {
  // Do Something
  const href = payload.href;
});

monitor.on("Unload", (payload) => {
  // Do Something
  const href = payload.href;
});
```

> 由于 `Unload` 事件出现于标签页关闭或刷新时，所以某些行为可能会无法执行。

#### 监听页面加载 Click 事件

```javascript
// 需要传入 Filter 筛选要监听的 Dom
// 例如，该 filter 监听所有 class 包含 monitored 的Dom
const filter = (ele) => ele.classList.contains("monitored");
monitor.monitorClick(filter);
monitor.on("Click", (payload) => {
  // Do Something, For example
  const target = payload.target;
});
```

#### 监听特定行为

```javascript
// 传入需要监听的行为（需要将行为包装成函数）
const increase = Monitor.instance?.monitorEvent(
  () => {
    testMitt.emit("increase");
  },
  {
    something: "芜湖", // 如果需要向行为进行额外的信息封装，可以在此处传入任意键值对
    anything: "起飞",
  }
);
monitor.on("Click", (payload) => {
  // Do Something
  // 此时payload中封装了something和anything
  const something = payload.something;
  const anything = payload.anything;
});
```

#### 监听页面 Axios 请求 事件

```javascript
monitor.monitorPage();

monitor.on("Api", (payload) => {
  // Do Something
  const url = payload.url;
});
```

#### 监听页面加载 Router 跳转 事件

```javascript
monitor.monitorRouter();

monitor.on("Route", (payload) => {
  // Do Something
  const path = payload.from.url;
});
```

### Payload

Payload 指监听事件发生时携带的信息。即 `monitor.on("*", (payload) => { ... })` 中的 payload。
不同的事件具备不同的 payload 类型，携带不同的 payload 信息，如下所示。

#### 点击事件（Click）

```typescript
interface ClickPayload {
  target: HTMLElement; // 监听的对应 DOM
  time: Date; // 监听事件发生的时间
}
```

#### 页面加载（Load & Unload）

```typescript
interface LoadPayload {
  duration: number; // 从页面开启到页面关闭之间的间隔
  time: Date; // 监听页面事件发生时的时间
  href: string; // 监听事件发生时页面的Href（即Url地址）
}
```

#### 特定行为（Action）

```typescript
interface ActionPayload {
  origin: () => any; // 监听的行为对象
  time: Date; // 监听行为事件发生时的时间
  [K: string]: any; // 其它任意主动注入的数据
}
```

#### Axios 请求（Api）

```typescript
interface ApiPayload {
  time: Date; // axios Api请求发生时的时间
  url: string; // 请求的 url 地址
  config: AxiosRequestConfig; // 请求的 config 所有配置
  method: Method; // 请求方法，例如Get Post Put Delete (来自config)
  header: any; // 请求头 (来自config)
}
```

### 路由跳转（Router）

```typescript
interface RoutePayload {
  from: RouteLocationNormalized; // 同 router.beforeEach((from, to) => {}) 中的 from
  to: RouteLocationNormalized; // 同 router.beforeEach((from, to) => {}) 中的 to
  time: Date; // 监听Route页面跳转事件发生时的时间
}
```

### Examples

```javascript
// main.js
import router from "@/router"; // 如果需要监听Vue-Router的路由跳转事件的话
import { initMonitorVue } from "@xmon/monitor";
import initMonitorVue from "monitor.js";
const monitor = initMonitorVue(router);
```

```javascript
// monitor.js
const initBuried = (monitor) => {
  const filter = (ele: HTMLElement) => ele.classList.contains("monitored");
  monitor.monitorPage();
  monitor.monitorClick(filter);
  monitor.monitorRouter();
  monitor.on("Action", (payload) => {
    console.log(payload);
  });
  monitor.on("Click", (payload) => {
    console.log(payload.target, "click");
  });
  monitor.on("Route", (payload) => {
    console.log(payload, "Route");
  });
  monitor.on("Api", (payload) => {
    console.log(payload, "Api");
  });
  monitor.on("Load", (payload) => {
    console.log(payload, "Load");
  });

  monitor.on("Unload", (payload) => {
    console.log(payload, "Unload");
    const img = new Image(1, 1);
    img.src = `http://localhost:8080/user/test?duration=${payload.duration}`;
  });
};
```

创建实例(`initMonitor`)之后，在页面的任何地方都可以访问到实例 `monitor.instance` 。

例如 Vue 组件内

```vue
<script setup>
import monitor from "@xmon/monitor";
const num = ref(0);
const increase = monitor.instance?.monitorEvent(
  () => {
    num.value++;
  },
  {
    something: "芜湖",
    numValue: num.value,
  }
);
</script>
<template>
  <div class="component-a">
    <button @click="increase">+</button>
    <span>{{ num }}</span>
  </div>
</template>
```

或者其它 js 模块

```javascript
import axios from "axios";
import monitor from "@xmon/monitor";

const axiosInstance = axios.create({ ... });
monitor.instance?.monitorAxios(axiosInstance);
```

**当然，你需要保障先创建好实例，再访问实例**

> 由于 Unload 事件发生的时候，不允许发出 Axios 异步请求，但经测验，允许发送利用 Image 的 Get 请求，因此如果在 Unload 中有任何后端请求，尽可能采用这种方式。
> 如果希望发送携带内容的 Post 请求，应当采用使用原生的 XMLHttpRequest 对象，让请求同步。

## 开发指导

本项目采用 Typescript 进行开发，编译为带 `import` 和 `export` 的 `ES5` 模块。

项目利用 `Mitt` 来进行发布订阅，通过 `addEventListener` + `mitt.emit` 对 `Load` `Unload` `click` 事件进行订阅，利用 `axios` 和 `vueRouter` 的拦截器来实现 `Route` 和 `Api` 事件的订阅，对于特定的行为，则采用了将行为以函数的方式传入的方式来进行订阅。

订阅完成之后，通过 `Mitt.on` 的方式，对订阅的行为进行监控，当行为执行时，会触发 `on` 中注册的方法，以实现监听事件的回调反馈。
