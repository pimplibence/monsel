import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';
import { FilterQuery, QueryOptions } from 'mongoose';
import { DecoratorHelper } from '../libs/decorators/decorator.helper';

export class AbstractDocument<T = {}> {
    public static getSchemaOptions(): any {
        return DecoratorHelper.getMetadata(this, 'SchemaOptions');
    }

    public static getModelName(): string {
        const options = this.getDocumentOptions();

        if (!options?.collection) {
            throw new Error('MissingCollectionName');
        }

        return options.collection;
    }

    public static getSchema(): mongoose.Schema {
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

        return new mongoose.Schema(schemaConstructorOptions);
    }

    public static getDocumentOptions(): any {
        return DecoratorHelper.getMetadata(this, 'DocumentOptions');
    }

    public static setMongoose(mongooseInstance: mongoose.Mongoose) {
        DecoratorHelper.setMetadata(this, 'Mongoose', mongooseInstance);
    }

    public static getMongoose(): mongoose.Mongoose {
        return DecoratorHelper.getMetadata(this, 'Mongoose');
    }

    public static setModel(model: mongoose.Model<any>) {
        DecoratorHelper.setMetadata(this, 'Model', model);
    }

    public static getModel(): mongoose.Model<any> {
        return DecoratorHelper.getMetadata(this, 'Model');
    }

    public static bootFromDocument(_document: mongoose.Document): AbstractDocument {
        const instance = new this();
        instance._document = _document;
        instance.loadValuesFromDocument();

        return instance;
    }

    ////////////////////////
    // REPOSITORY SECTION //
    ////////////////////////

    public static async find<T = {}>(filter: FilterQuery<any> = {}, options?: QueryOptions | null): Promise<(T & AbstractDocument)[]> {
        const model = this.getModel();

        const items = await model.find(filter, null, options);

        return items.map((item) => this.bootFromDocument(item) as any);
    }

    ///////////////////////////////
    // END OF REPOSITORY SECTION //
    ///////////////////////////////

    public _id: ObjectId | string;
    public _document: mongoose.Document;
    public _isInstance = true;

    constructor() {
        this.hideProperty('_document');
        this.hideProperty('_isInstance');
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

    protected loadValuesFromDocument(): any {
        if (!this._document) {
            return;
        }

        const schemaOptions = this.getSchemaOptions();

        for (const key in schemaOptions) {
            this[key] = this._document[key];
        }

        this._id = this._document._id;
    }

    protected hideProperty(property: string) {
        Object.defineProperty(this, property, {
            enumerable: false,
            configurable: true,
            writable: true,
        });
    }
}
