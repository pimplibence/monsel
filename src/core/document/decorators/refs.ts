import * as mongoose from 'mongoose';
import { DecoratorHelper } from '../../libs/decorators/decorator.helper';
import { BaseDocument } from '../base.document';

export const refs = (typeFn: () => typeof BaseDocument, options?: mongoose.SchemaDefinitionProperty) => {
    return (target: any, propertyKey: string): any => {
        DecoratorHelper.initializePropertyDecorator(target, propertyKey);

        const schema: mongoose.Schema = DecoratorHelper.getMetadata(target.constructor, 'SchemaOptions') || {};

        schema[propertyKey] = {
            propertyKey: propertyKey,
            ref: typeFn(),
            multi: true,
            options: options
        };

        DecoratorHelper.setMetadata(target.constructor, 'SchemaOptions', schema);

        return target;
    };
};
