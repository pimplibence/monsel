import { cloneDeep } from 'lodash';
import { DecoratorHelper } from '../../libs/decorators/decorator.helper';
import { BaseDocument } from '../base.document';

interface DocumentOptions {
    collection: string;
}

export const document = (options: DocumentOptions) => {
    return (target: typeof BaseDocument): any => {
        const parentOptions: DocumentOptions = DecoratorHelper.getParentMetadata(target, 'DocumentOptions');
        options.collection = options.collection || parentOptions.collection;
        DecoratorHelper.setMetadata(target, 'DocumentOptions', cloneDeep(options));

        const parentSchema = DecoratorHelper.getParentMetadata(target, 'SchemaOptions');
        const currentSchema = DecoratorHelper.getMetadata(target, 'SchemaOptions');
        const schema = { ...parentSchema, ...currentSchema };
        DecoratorHelper.setMetadata(target, 'SchemaOptions', schema);

        return target;
    };
};
