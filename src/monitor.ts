import { RouteLocationNormalized, Router } from "vue-router";
import mitt from "mitt";

const ex: { instance: Monitor | null } = {
  instance: null,
};
export const monitorMitt = mitt<{
  Click: {
    target: EventTarget;
  };
  Load: {
    type: "load" | "unload";
  };
  Action: {
    origin: () => any;
    [K: string]: any;
  };
  Route: {
    from: RouteLocationNormalized;
    to: RouteLocationNormalized;
  };
}>();

export class Monitor {
  observableEvent: [] = [];

  /**
   * 传入需要监听的Click的特征
   */
  monitorClick(filter: (target: EventTarget | null) => HTMLElement | false) {
    document.body.addEventListener(
      "click",
      (e: MouseEvent) => {
        const targetElement = filter(e.target);
        if (targetElement) {
          monitorMitt.emit("Click", {
            target: targetElement,
          });
        }
      },
      {
        passive: true,
      }
    );
  }

  monitorPage() {
    window.addEventListener(
      "load",
      (e) => {
        monitorMitt.emit("Load", {
          type: "load",
        });
      },
      {
        passive: true,
      }
    );
    window.addEventListener("beforeunload", (e) => {
      monitorMitt.emit("Load", {
        type: "unload",
      });
    });
  }

  monitorEvent(fn: () => any, payload?: { [K: string]: any }): () => any {
    return () => {
      fn();
      monitorMitt.emit("Action", { ...payload, origin: fn });
    };
  }
  on = monitorMitt.on;
}

export class MonitorVue extends Monitor {
  private router: Router;
  constructor(router: Router) {
    super();
    this.router = router;
    this.monitorRouter();
  }
  monitorRouter() {
    this.router.beforeEach((to, from, next) => {
      monitorMitt.emit("Route", { from, to });
      next();
    });
  }
}

export const initMonitor = () => {
  return (ex.instance = new Monitor());
};

export const initMonitorVue = (router: Router) => {
  return (ex.instance = new MonitorVue(router));
};

export default ex;
