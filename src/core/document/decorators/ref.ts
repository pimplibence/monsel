import * as mongoose from 'mongoose';
import { DecoratorHelper } from '../../libs/decorators/decorator.helper';
import { AbstractDocument } from '../abstract.document';

export const ref = (typeFn: () => typeof AbstractDocument, options?: mongoose.SchemaDefinitionProperty) => {
    return (target: any, propertyKey: string): any => {
        DecoratorHelper.initializePropertyDecorator(target, propertyKey);

        const schema: mongoose.Schema = DecoratorHelper.getMetadata(target.constructor, 'SchemaOptions') || {};

        schema[propertyKey] = {
            propertyKey: propertyKey,
            ref: typeFn(),
            multi: false,
            options: options
        };

        DecoratorHelper.setMetadata(target.constructor, 'SchemaOptions', schema);

        return target;
    };
};
