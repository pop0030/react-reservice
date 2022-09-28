import { useEffect, useState } from 'react';

interface IServiceContext {}

interface IUpdaterFunction {
  (context: IServiceContext): void;
}

// eslint-disable-next-line @typescript-eslint/ban-types
class Service<P extends IServiceContext = {}> {
  /** Service context proxy object */
  private contextProxy = {} as P;

  /** Service listeners */
  private updaters = new Set<IUpdaterFunction>();

  getCurrentContext = () => {
    return { ...this.contextProxy };
  };

  /** Context getter, return context proxy object */
  get context() {
    return this.contextProxy;
  }

  /**
   * Context setter, store context values into context proxy object.
   * and set function will invoke dispatchHandlers function to trigger subscribe handlers.
   * */
  set context(value: P) {
    this.contextProxy = new Proxy(value, {
      set: (target, prop, value) => {
        try {
          this.queueCommand();
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          target[prop] = value;
        } catch {}

        return true;
      }
    });
  }

  private queueSequence = 0;

  private queueCommand = () => {
    new Promise((resolve) => {
      const currentSequence = this.queueSequence;
      this.queueSequence = this.queueSequence + 1;
      resolve(currentSequence);
    }).then((current) => {
      // only execute once
      if (current === 0) {
        this.dispatchUpdater();
      }
    });
  };

  private dispatchUpdater = () => {
    this.updaters.forEach((updater) => {
      updater?.(this.context);
    });

    // reset sequence
    this.queueSequence = 0;
  };

  public subscribe = (updater: IUpdaterFunction) => {
    this.updaters.add(updater);
  };

  public unsubscribe = (updater: IUpdaterFunction) => {
    this.updaters.delete(updater);
  };
}

export default Service;

const isEqual = (prev: unknown, next: unknown): boolean => {
  let prevValue = prev;
  let nextValue = next;

  if (prev instanceof Map) {
    prevValue = Object.fromEntries(prev);
  }

  if (next instanceof Map) {
    nextValue = Object.fromEntries(next);
  }

  if (prev instanceof Set) {
    prevValue = [...prev];
  }

  if (next instanceof Set) {
    nextValue = [...next];
  }

  return JSON.stringify(prevValue) === JSON.stringify(nextValue);
};

export type ServiceContext<S extends Service> = S['context'];

export interface IServiceSelector<S extends Service> {
  (context: ServiceContext<S>): Partial<ServiceContext<S>>;
}

/**
 * Service hook, accept a service instance as param.
 * @param serviceInstance - instance create from Service
 */
export const useService = <ServiceInstance extends Service, TSelected = unknown>(
  serviceInstance: ServiceInstance,
  selector: (context: ServiceContext<ServiceInstance>) => TSelected
): TSelected => {
  const _context = { ...serviceInstance.context };
  const [selectedValue, setSelectedValue] = useState<TSelected>(selector(_context));

  useEffect(() => {
    const updater = (context: ServiceContext<ServiceInstance>) => {
      const nextSelectedValue = selector({ ...context });
      if (!isEqual(selectedValue, nextSelectedValue)) {
        setSelectedValue(nextSelectedValue);
      }
    };

    serviceInstance.subscribe(updater);

    return () => serviceInstance.unsubscribe(updater);
  }, [selectedValue, selector, serviceInstance]);

  return selector(_context);
};

/**
 * Optimized Service Hook Selector Generator
 * @param subscriptionKeys - *Optional Optimization* pass in the keys for hook to subscribe for changes
 * @returns `selector` as required by `useService`
 */
 export const serviceSelector =
 <ServiceInstance extends Service, TSelected = unknown>(subscriptionKeys?: unknown[]) =>
 (context: ServiceContext<ServiceInstance>): TSelected => {
   if (subscriptionKeys === undefined) {
     return context as TSelected;
   }

   return subscriptionKeys.reduce<TSelected>(
     (accumulator, key) => ({ ...accumulator, [`${key}`]: context[key as keyof ServiceContext<ServiceInstance>] }),
     {} as TSelected
   );
 };