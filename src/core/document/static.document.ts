import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';
import { DecoratorHelper } from '../libs/decorators/decorator.helper';

export class StaticDocument {
    public _id: ObjectId | string;

    /**
     * Mongoose Document
     * - this odm will use this object to implement its behaviour. Thanks mongoose team, you are awesome <3
     */
    public _document: mongoose.Document;

    /**
     * This property helps to identify a Monsel document instance in future in Abstract document and beyond
     */
    public _isInstance = true;

    constructor() {
        this.hideProperty('_document');
        this.hideProperty('_isInstance');
    }

    /**
     * Returns with mongoose schema options
     */
    public static getSchemaOptions(): any {
        return DecoratorHelper.getMetadata(this, 'SchemaOptions');
    }

    /**
     * Returns with mongoose collection and model name
     * - collection name and model name always will be same
     */
    public static getModelName(): string {
        const options = this.getDocumentOptions();

        if (!options?.collection) {
            throw new Error('MissingCollectionName');
        }

        return options.collection;
    }

    /**
     * Generates a mongoose schema
     */
    public static getSchema(): mongoose.Schema {
        const documentOptions = this.getDocumentOptions();
        const options = this.getSchemaOptions();
        const schemaConstructorOptions = {};

        for (const key in options) {
            const item = options[key];

            if (!!item.ref) {
                const opts = {
                    ...item.options,
                    type: mongoose.Schema.Types.ObjectId,
                    ref: item.ref.getModelName()
                };

                schemaConstructorOptions[key] = item.multi
                    ? [opts]
                    : opts;
            }

            if (!item.ref) {
                schemaConstructorOptions[key] = item.options || { type: mongoose.Schema.Types.Mixed };
            }
        }

        const schema = new mongoose.Schema(schemaConstructorOptions);

        for (const index of documentOptions.indexes || []) {
            schema.index(index.fields, index.options || {});
        }

        return schema;
    }

    /**
     * Returns with @document decorator values
     */
    public static getDocumentOptions(): any {
        return DecoratorHelper.getMetadata(this, 'DocumentOptions');
    }

    /**
     * Set mongoose instance after connection
     *
     * @param mongooseInstance
     */
    public static setMongoose(mongooseInstance: mongoose.Mongoose) {
        DecoratorHelper.setMetadata(this, 'Mongoose', mongooseInstance);
    }

    /**
     * Returns with mongoose instance
     * - this instance alredy contains models
     */
    public static getMongoose(): mongoose.Mongoose {
        return DecoratorHelper.getMetadata(this, 'Mongoose');
    }

    /**
     * Set mongoose model after connection
     * @param model
     */
    public static setModel(model: mongoose.Model<any>) {
        DecoratorHelper.setMetadata(this, 'Model', model);
    }

    /**
     * Returns with mongoose model belongs to collection and document
     */
    public static getModel(): mongoose.Model<any> {
        return DecoratorHelper.getMetadata(this, 'Model');
    }

    public static getLifecycleCallbackConfig(): any {
        return DecoratorHelper.getMetadata(this, 'LifecycleCallbacks');
    }

    /**
     * Helper function to hide properties from instance proto
     *
     * @param property
     * @protected
     */
    protected hideProperty(property: string) {
        Object.defineProperty(this, property, {
            enumerable: false,
            configurable: true,
            writable: true,
        });
    }

    protected getSchemaOptions(): any {
        return DecoratorHelper.getMetadata(this.constructor, 'SchemaOptions');
    }

    protected getMongoose(): mongoose.Mongoose {
        return DecoratorHelper.getMetadata(this.constructor, 'Mongoose');
    }

    protected getModel(): mongoose.Model<any> {
        return DecoratorHelper.getMetadata(this.constructor, 'Model');
    }
}
