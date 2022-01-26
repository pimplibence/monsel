import 'reflect-metadata';

export abstract class DecoratorHelper {
    public static initializePropertyDecorator(target: any, key: any): void {
        Object.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            writable: true,
        });
    }

    public static getMetadata(target: any, key: string): any {
        return Reflect.getOwnMetadata(key, target) || {};
    }

    public static getParentMetadata(target: any, key: string): any {
        return Reflect.getOwnMetadata(key, Object.getPrototypeOf(target)) || {};
    }

    public static setMetadata(target: any, key: string, value: any): void {
        Reflect.defineMetadata(key, value, target);
    }
}
