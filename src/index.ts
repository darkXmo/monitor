import mitt from "mitt";
import {
  AxiosInstance,
  Payload,
  MonitorRoute,
  NavigationGuardNext,
} from "./index.interface";

const ex: { instance: Monitor | null } = {
  instance: null,
};

export const monitorMitt = mitt<{
  Click: Payload.ClickPayload;
  Load: Payload.LoadPayload;
  Unload: Payload.LoadPayload;
  Action: Payload.ActionPayload;
  Route: Payload.RoutePayload;
  Api: Payload.ApiPayload;
}>();

export class Monitor {
  observableEvent: [] = [];

  /**
   * 传入需要监听的Click的特征
   */
  monitorClick(filter: (target: HTMLElement) => boolean) {
    const primaryFilter = (ele: EventTarget | null): HTMLElement | false => {
      if (ele && ele instanceof HTMLElement) {
        if (filter(ele)) {
          return ele;
        } else if (ele.localName !== "body") {
          return primaryFilter(ele.parentElement);
        }
      }
      return false;
    };
    document.body.addEventListener(
      "click",
      (e: MouseEvent) => {
        const targetElement = primaryFilter(e.target);
        if (targetElement) {
          monitorMitt.emit("Click", {
            target: targetElement,
            time: new Date(),
          });
        }
      },
      {
        passive: true,
      }
    );
  }

  monitorPage() {
    let start: Date = new Date();
    window.addEventListener(
      "load",
      () => {
        monitorMitt.emit("Load", {
          duration: 0,
          time: new Date(),
          href: window.location.href,
        });
      },
      {
        passive: true,
      }
    );
    monitorMitt.on("Load", (e) => {
      start = new Date();
    });
    window.addEventListener("beforeunload", (e) => {
      monitorMitt.emit("Unload", {
        href: window.location.href,
        duration: new Date().getTime() - start.getTime(),
        time: new Date(),
      });
    });
    monitorMitt.on("Unload", (e) => {
      start = new Date();
    });
  }

  monitorEvent<T extends { [K: string]: any } = { [K: string]: any }>(
    fn: () => any,
    payload?: T
  ): () => any {
    return () => {
      fn();
      monitorMitt.emit("Action", { ...payload, origin: fn, time: new Date() });
    };
  }

  monitorAxios(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use(
      (config) => {
        monitorMitt.emit("Api", {
          time: new Date(),
          url: config.url,
          method: config.method,
          header: config.headers,
          config,
        });
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
  }

  on = monitorMitt.on;
}

export class MonitorVue extends Monitor {
  private router: any;
  constructor(router: any) {
    super();
    this.router = router;
  }
  monitorRouter() {
    this.router.beforeEach(
      (to: MonitorRoute, from: MonitorRoute, next: NavigationGuardNext) => {
        monitorMitt.emit("Route", { from, to, time: new Date() });
        next();
      }
    );
  }
}

export const initMonitor = () => {
  return (ex.instance = new Monitor());
};

export const initMonitorVue = (router: {
  beforeEach: (guard: any) => () => void;
  push: any;
  afterEach: (guard: any) => () => void;
  [K: string]: any;
}) => {
  if (router.afterEach && router.push) {
    return (ex.instance = new MonitorVue(router));
  }
  throw new Error(
    "initMonitorVue is supposed to received a VueRouter Instance"
  );
};

export default ex;
