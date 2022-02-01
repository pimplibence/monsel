import { cloneDeep } from 'lodash';
import { IndexDefinition, IndexOptions } from 'mongoose';
import { DecoratorHelper } from '../../libs/decorators/decorator.helper';
import { AbstractDocument } from '../abstract.document';

interface Index {
    fields: IndexDefinition;
    options?: IndexOptions;
}

interface DocumentOptions {
    collection: string;
    indexes?: Index[];
}

export const document = (options: DocumentOptions) => {
    return (target: typeof AbstractDocument): any => {
        /**
         * Document Options
         */

        const parentOptions: DocumentOptions = DecoratorHelper.getParentMetadata(target, 'DocumentOptions');

        options.collection = options.collection || parentOptions.collection;

        options.indexes = [
            ...(parentOptions?.indexes || []),
            ...(options?.indexes || [])
        ];

        DecoratorHelper.setMetadata(target, 'DocumentOptions', cloneDeep(options));

        /**
         * Schema Options
         */

        const parentSchema = DecoratorHelper.getParentMetadata(target, 'SchemaOptions');
        const currentSchema = DecoratorHelper.getMetadata(target, 'SchemaOptions');

        const schema = { ...parentSchema, ...currentSchema };

        DecoratorHelper.setMetadata(target, 'SchemaOptions', schema);

        /**
         * Lifecycle Callbacks
         */

        const parentLifecycleCallbacks = DecoratorHelper.getParentMetadata(target, 'LifecycleCallbacks');
        const currentLifecycleCallbacks = DecoratorHelper.getMetadata(target, 'LifecycleCallbacks');

        const lcKeys = Object.keys({ ...parentLifecycleCallbacks, ...currentLifecycleCallbacks });
        const lifecycleCallbacks = {};

        for (const key of lcKeys) {
            lifecycleCallbacks[key] = [
                ...(parentLifecycleCallbacks?.[key] || []),
                ...(currentLifecycleCallbacks?.[key] || []),
            ];
        }

        DecoratorHelper.setMetadata(target, 'LifecycleCallbacks', lifecycleCallbacks);

        return target;
    };
};
