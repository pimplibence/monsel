import * as mongoose from 'mongoose';
import { DecoratorHelper } from '../../libs/decorators/decorator.helper';

export const property = (options?: mongoose.SchemaDefinitionProperty) => {
    return (target: any, propertyKey: string): any => {
        DecoratorHelper.initializePropertyDecorator(target, propertyKey);

        const schema: mongoose.Schema = DecoratorHelper.getMetadata(target.constructor, 'SchemaConfig') || {};

        schema[propertyKey] = { propertyKey: propertyKey, options: options };

        DecoratorHelper.setMetadata(target.constructor, 'SchemaConfig', schema);

        return target.constructor;
    };
};
