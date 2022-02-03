import { DecoratorHelper } from '../../libs/decorators/decorator.helper';

export const lifecycleCallback = (type: string) => {
    return (target: any, propertyKey: string): any => {
        DecoratorHelper.initializePropertyDecorator(target, propertyKey);

        const currentItems = DecoratorHelper.getMetadata(target.constructor, 'LifecycleCallbacks') || {};
        currentItems[type] = (currentItems[type] || []).filter((item) => (item !== propertyKey));
        currentItems[type].push(propertyKey);

        DecoratorHelper.setMetadata(target.constructor, 'LifecycleCallbacks', currentItems);

        return target;
    };
};

export const beforeCreate = () => lifecycleCallback('beforeCreate');
export const afterCreate = () => lifecycleCallback('afterCreate');
export const beforeUpdate = () => lifecycleCallback('beforeUpdate');
export const afterUpdate = () => lifecycleCallback('afterUpdate');
export const afterLoad = () => lifecycleCallback('afterLoad');
export const beforePopulate = () => lifecycleCallback('beforePopulate');
export const afterPopulate = () => lifecycleCallback('afterPopulate');
