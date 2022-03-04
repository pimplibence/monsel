import { cloneDeep } from 'lodash';
import * as mongoose from 'mongoose';
import { IndexDefinition, IndexOptions } from 'mongoose';
import { DecoratorHelper } from '../../libs/decorators/decorator.helper';
import { AbstractDocument } from '../abstract.document';

interface Index {
    fields: IndexDefinition;
    options?: IndexOptions;
}

interface DocumentOptions {
    collection?: string;
    indexes?: Index[];
    schemaOptions?: mongoose.SchemaOptions;
}

export const document = (options: DocumentOptions = {}) => {
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

        options.schemaOptions = {
            ...(parentOptions?.schemaOptions || {}),
            ...(options?.schemaOptions || {})

            // TODO -> Merge shardKey
            // TODO -> Merge collation
            // TODO -> Investigation to explain which fields has to be handled here
        };

        DecoratorHelper.setMetadata(target, 'DocumentOptions', cloneDeep(options));

        /**
         * Schema Config
         *
         * You have to answer -> How to merge parent config into current config
         */
        const parentSchemaConfig = DecoratorHelper.getParentMetadata(target, 'SchemaConfig');
        const currentSchemaConfig = DecoratorHelper.getMetadata(target, 'SchemaConfig');
        const schemaConfig = { ...parentSchemaConfig, ...currentSchemaConfig };

        DecoratorHelper.setMetadata(target, 'SchemaConfig', schemaConfig);

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
