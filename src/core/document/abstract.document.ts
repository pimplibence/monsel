import { ObjectId } from 'bson';
import { AggregateOptions, UpdateResult } from 'mongodb';
import * as mongoose from 'mongoose';
import { FilterQuery, PipelineStage, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { DecoratorHelper } from '../libs/decorators/decorator.helper';

export interface PaginateOptions extends QueryOptions {
    page?: number;
    skip?: never;
}

export interface PaginateResponse<T extends AbstractDocument> {
    total: number;
    current: number;
    page: number;
    limit: number;
    skip: number;
    items: T[];
}

export abstract class AbstractDocument {
    public _id: ObjectId | string;
    public _document: mongoose.Document;
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
     * Makes a document instance from a mongoose document
     *
     * @param document
     */
    public static async bootFromDocument<T extends AbstractDocument>(document: mongoose.Document): Promise<T> {
        const instance = new (this as any)();
        instance._document = document;

        await instance.loadValuesFromDocument();
        await instance.executeLifecycleCallbackType('afterLoad');

        return instance;
    }

    public static async count<T extends AbstractDocument>(filter: FilterQuery<T> = {}, options?: QueryOptions | null): Promise<number> {
        const model = this.getModel();

        return model.count(filter);
    }

    public static async findMany<T extends AbstractDocument>(filter: FilterQuery<T> = {}, options?: QueryOptions | null): Promise<T[]> {
        const model = this.getModel();

        const documents = await model.find(filter, null, options);

        for (const index in documents) {
            documents[index] = await this.bootFromDocument<T>(documents[index]);
        }

        return documents;
    }

    public static async findOne<T extends AbstractDocument>(filter: FilterQuery<T> = {}, options?: QueryOptions | null): Promise<T | null> {
        const model = this.getModel();

        const document = await model.findOne(filter, null, options);

        if (!document) {
            return null;
        }

        return this.bootFromDocument<T>(document);
    }

    public static async findById<T extends AbstractDocument>(id: any, options?: QueryOptions | null): Promise<T | null> {
        const model = this.getModel();

        const document = await model.findById(id, null, options);

        if (!document) {
            return null;
        }

        return this.bootFromDocument<T>(document);
    }

    public static async paginate<T extends AbstractDocument>(filter: FilterQuery<T> = {}, options?: PaginateOptions | null): Promise<PaginateResponse<T>> {
        const page = options?.page || 0;
        const limit = options?.limit || 0;
        const skip = page * limit;

        const total = await this.count(filter);

        const items = await this.findMany<T>(filter, {
            ...options,
            skip: skip,
            limit: limit
        });

        return {
            total: total,
            current: items.length,
            page: page,
            limit: limit,
            skip: skip,
            items: items
        };
    }

    public static async updateMany<T extends AbstractDocument>(filter: FilterQuery<T> = {}, update: UpdateQuery<T> = {}, options?: QueryOptions | null): Promise<UpdateResult> {
        const model = this.getModel();

        return model.updateMany(filter, update, options);
    }

    public static async updateOne<T extends AbstractDocument>(filter: FilterQuery<T> = {}, update: UpdateQuery<T> = {}, options?: QueryOptions | null): Promise<UpdateResult> {
        const model = this.getModel();

        return model.updateOne(filter, update, options);
    }

    public static async deleteMany<T extends AbstractDocument>(filter: FilterQuery<T> = {}, options?: QueryOptions | null): Promise<any> {
        const model = this.getModel();

        return model.deleteMany(filter, options);
    }

    public static async deleteOne<T extends AbstractDocument>(filter: FilterQuery<T> = {}, options?: QueryOptions | null): Promise<any> {
        const model = this.getModel();

        return model.deleteOne(filter, options);
    }

    public static async aggregate<T extends AbstractDocument>(pipeline?: PipelineStage[], options?: AggregateOptions): Promise<any[]> {
        const model = this.getModel();

        return model.aggregate<mongoose.Document>(pipeline, options);
    }

    public static async aggregateAndMapResults<T extends AbstractDocument>(pipeline?: PipelineStage[], options?: AggregateOptions): Promise<T[]> {
        const model = this.getModel();

        const items = await model.aggregate<any>(pipeline, options);

        for (const index in items) {
            items[index] = await this.bootFromDocument<T>(items[index]);
        }

        return items;
    }

    // Model.findByIdAndDelete()
    // Model.findByIdAndRemove()
    // Model.findByIdAndUpdate()
    // Model.findOneAndDelete()
    // Model.findOneAndRemove()
    // Model.findOneAndReplace()
    // Model.findOneAndUpdate()

    public static async syncIndexes() {
        const model = this.getModel();
        return model.syncIndexes();
    }

    public async save(options?: QueryOptions): Promise<this> {
        const model = this.getModel();

        const isCreate = !this._document?._id;

        if (isCreate) {
            await this.executeLifecycleCallbackType('beforeCreate');

            const instance = new model(this);
            this._document = await instance.save(options);

            await this.loadValuesFromDocument();
            await this.executeLifecycleCallbackType('afterCreate');
        }

        if (!isCreate) {
            await this.executeLifecycleCallbackType('beforeUpdate');

            const schemaOptions = this.getSchemaOptions();

            for (const key in schemaOptions) {
                this._document[key] = this[key];
            }

            this._document = await this._document.save();
            await this.loadValuesFromDocument();
            await this.executeLifecycleCallbackType('afterUpdate');
        }

        return this;
    }

    public async populate(options: PopulateOptions | PopulateOptions[]): Promise<void> {
        await this.executeLifecycleCallbackType('beforePopulate');

        await this._document.populate(options);
        await this.loadValuesFromDocument();

        await this.executeLifecycleCallbackType('afterPopulate');
    }

    public async syncIndexes() {
        const model = this.getModel();
        return model.syncIndexes();
    }

    private getSchemaOptions(): any {
        return DecoratorHelper.getMetadata(this.constructor, 'SchemaOptions');
    }

    private getMongoose(): mongoose.Mongoose {
        return DecoratorHelper.getMetadata(this.constructor, 'Mongoose');
    }

    private getModel(): mongoose.Model<any> {
        return DecoratorHelper.getMetadata(this.constructor, 'Model');
    }

    /**
     * Crucial method!
     * This method loads and build the entire instance of document from mongoose document
     *
     * @protected
     */
    private async loadValuesFromDocument(): Promise<void> {
        if (!this._document) {
            return;
        }

        const schemaOptions = this.getSchemaOptions();

        for (const key in schemaOptions) {
            this[key] = this._document[key];
        }

        this._id = this._document._id;

        await this.mapInstanceTree(this, this._document);
    }

    /**
     * Helper function to hide properties from instance proto
     *
     * @param property
     * @protected
     */
    private hideProperty(property: string) {
        Object.defineProperty(this, property, {
            enumerable: false,
            configurable: true,
            writable: true,
        });
    }

    /**
     * This methods maps recursively the raw document and build the populated instances if it is possible
     *
     * @param instance
     * @param values
     * @private
     */
    private async mapInstanceTree(instance: AbstractDocument, values: any) {
        const schemaOptions = instance.getSchemaOptions();

        for (const key in schemaOptions) {
            const schemaOption = schemaOptions?.[key];
            const ref: typeof AbstractDocument = schemaOption?.ref;
            const multi = schemaOption?.multi;

            if (!ref) {
                continue;
            }

            if (multi) {
                const mResult = [];

                for (const index in values?.[key] || []) {
                    mResult[index] = await this.mapInstanceTreeGetPropertyValue(values?.[key]?.[index], instance?.[key]?.[index], ref);
                }

                instance[key] = mResult;

                // instance[key] = await Promise.all(values?.[key]?.map((item, index) => this.mapInstanceTreeGetPropertyValue(item, instance?.[key]?.[index], ref)));
            } else {
                instance[key] = await this.mapInstanceTreeGetPropertyValue(values?.[key], instance?.[key], ref);
            }
        }
    }

    private async mapInstanceTreeGetPropertyValue(mongooseDocument: mongoose.Document, notMongooseDocument: AbstractDocument, ref: typeof AbstractDocument) {
        if (!mongooseDocument) {
            return null;
        }

        // has _isInstance property -> Already mapped
        if (notMongooseDocument?._isInstance) {
            return mongooseDocument;
        }

        // string -> Not populated
        if (typeof mongooseDocument === 'string') {
            return mongooseDocument;
        }

        // instanceof ObjectId -> Not populated and it`s a simple ObjectId
        if (mongooseDocument instanceof ObjectId) {
            return mongooseDocument;
        }

        // Its a null -> Nothing to map
        if (!mongooseDocument) {
            return mongooseDocument;
        }

        return ref.bootFromDocument(mongooseDocument);
    }

    private async executeLifecycleCallbackType(type: string) {
        const config = (this.constructor as typeof AbstractDocument).getLifecycleCallbackConfig();
        const keys = config?.[type] || [];

        for (const key of keys) {
            await this[key]();
        }
    }
}
