import { ObjectId } from 'bson';
import { UpdateResult } from 'mongodb';
import * as mongoose from 'mongoose';
import { FilterQuery, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
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

    /**
     * Makes a document instance from a mongoose document
     *
     * @param document
     */
    public static bootFromDocument<T extends AbstractDocument>(document: mongoose.Document): T {
        const instance = new (this as any)();
        instance._document = document;
        instance.loadValuesFromDocument();

        return instance;
    }

    ////////////////////////
    // REPOSITORY SECTION //
    ////////////////////////

    public static async count(filter: FilterQuery<any> = {}, options?: QueryOptions | null): Promise<number> {
        const model = this.getModel();

        return model.count(filter);
    }

    public static async find<T extends AbstractDocument>(filter: FilterQuery<any> = {}, options?: QueryOptions | null): Promise<T[]> {
        const model = this.getModel();

        const documents = await model.find(filter, null, options);

        return documents.map((document) => this.bootFromDocument<T>(document));
    }

    public static async findMany<T extends AbstractDocument>(filter: FilterQuery<any> = {}, options?: QueryOptions | null): Promise<T[]> {
        return this.find(filter, options);
    }

    public static async findOne<T extends AbstractDocument>(filter: FilterQuery<any> = {}, options?: QueryOptions | null): Promise<T | null> {
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

    public static async paginate<T extends AbstractDocument>(filter: FilterQuery<any> = {}, options?: PaginateOptions | null): Promise<PaginateResponse<T>> {
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

    public static async updateMany(filter: FilterQuery<any> = {}, update: UpdateQuery<any> = {}, options?: QueryOptions | null): Promise<UpdateResult> {
        const model = this.getModel();

        return model.updateMany(filter, update, options);
    }

    public static async updateOne(filter: FilterQuery<any> = {}, update: UpdateQuery<any> = {}, options?: QueryOptions | null): Promise<UpdateResult> {
        const model = this.getModel();

        return model.updateOne(filter, update, options);
    }

    // Model.deleteMany()
    // Model.deleteOne()
    // Model.findByIdAndDelete()
    // Model.findByIdAndRemove()
    // Model.findByIdAndUpdate()
    // Model.findOneAndDelete()
    // Model.findOneAndRemove()
    // Model.findOneAndReplace()
    // Model.findOneAndUpdate()
    // Model.replaceOne()

    ///////////////////////////////
    // END OF REPOSITORY SECTION //
    ///////////////////////////////

    public _id: ObjectId | string;
    protected _document: mongoose.Document;
    protected _isInstance = true;

    constructor() {
        this.hideProperty('_document');
        this.hideProperty('_isInstance');
    }

    /////////////////////
    // THE MIGHTY SAVE //
    /////////////////////

    public async save(options?: QueryOptions): Promise<this> {
        const model = this.getModel();

        const isCreate = !this._document?._id;

        if (isCreate) {
            const instance = new model(this);
            this._document = await instance.save(options);

            this.loadValuesFromDocument();
        }

        if (!isCreate) {
            const schemaOptions = this.getSchemaOptions();

            for (const key in schemaOptions) {
                this._document[key] = this[key];
            }

            this._document = await this._document.save();

            this.loadValuesFromDocument();
        }

        return this;
    }

    ////////////////////////////
    // END OF THE MIGHTY SAVE //
    ////////////////////////////

    //////////////////////
    // POPULATE SECTION //
    //////////////////////

    public async populate(options: PopulateOptions | PopulateOptions[]) {
        await this._document.populate(options);
        await this.loadValuesFromDocument();

        this.loadAfterPopulateDeep(this, this._document);
    }

    private loadAfterPopulateDeep(instance: AbstractDocument, values: any) {
        const schemaOptions = instance.getSchemaOptions();

        for (const key in schemaOptions) {
            const schemaOption = schemaOptions?.[key];
            const ref: typeof AbstractDocument = schemaOption?.ref;
            const multi = schemaOption?.multi;

            if (!ref) {
                continue;
            }

            instance[key] = multi
                ? values?.[key]?.map((item, index) => this.loadAfterPopulateDeepChildMapper(values?.[key]?.[index], instance?.[key]?.[index], ref))
                : this.loadAfterPopulateDeepChildMapper(values?.[key], instance?.[key], ref);
        }
    }

    private loadAfterPopulateDeepChildMapper(mongooseDocument: mongoose.Document, notMongooseDocument: AbstractDocument, ref: typeof AbstractDocument) {
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

    /////////////////////////////
    // END OF POPULATE SECTION //
    /////////////////////////////

    /////////////
    // HELPERS //
    /////////////

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

    ////////////////////
    // END OF HELPERS //
    ////////////////////
}
