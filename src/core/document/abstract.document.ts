import { ObjectId } from 'bson';
import { AggregateOptions, UpdateResult } from 'mongodb';
import * as mongoose from 'mongoose';
import { FilterQuery, PipelineStage, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { StaticDocument } from './static.document';

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

export class AbstractDocument extends StaticDocument {
    ////////////////////////////////////////
    //// Core Section ///////////////////
    //////////////////////////////////

    public static async bootFromDocument<T extends AbstractDocument>(document: mongoose.Document): Promise<T> {
        const instance = new (this as any)();
        instance._document = document;

        await instance.loadValuesFromDocument();
        await instance.executeLifecycleCallbackType('afterLoad');

        return instance;
    }

    private static async mapInstanceTree(instance: AbstractDocument, values: any) {
        const schemaConfig = instance.getSchemaConfig();

        for (const key in schemaConfig) {
            const schemaOption = schemaConfig?.[key];
            const ref: typeof AbstractDocument = schemaOption?.ref;
            const multi = schemaOption?.multi;

            if (!ref) {
                continue;
            }

            if (multi) {
                const mResult = [];

                for (const index in values?.[key] || []) {
                    mResult[index] = await AbstractDocument.mapInstanceTreeGetPropertyValue(values?.[key]?.[index], instance?.[key]?.[index], ref);
                }

                instance[key] = mResult;

                // instance[key] = await Promise.all(values?.[key]?.map((item, index) => this.mapInstanceTreeGetPropertyValue(item, instance?.[key]?.[index], ref)));
            } else {
                instance[key] = await AbstractDocument.mapInstanceTreeGetPropertyValue(values?.[key], instance?.[key], ref);
            }
        }
    }

    private static async mapInstanceTreeGetPropertyValue(mongooseDocument: mongoose.Document, notMongooseDocument: AbstractDocument, ref: typeof AbstractDocument) {
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

    ////////////////////////////////////////
    //// Repository Section /////////////
    //////////////////////////////////

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

    public static async syncIndexes() {
        const model = this.getModel();
        return model.syncIndexes();
    }

    public static async ensureIndexes() {
        const model = this.getModel();
        return model.ensureIndexes();
    }

    // Model.findByIdAndDelete()
    // Model.findByIdAndRemove()
    // Model.findByIdAndUpdate()
    // Model.findOneAndDelete()
    // Model.findOneAndRemove()
    // Model.findOneAndReplace()
    // Model.findOneAndUpdate()

    ////////////////////////////////////////
    //// Active Record Section //////////
    //////////////////////////////////

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

            const schemaConfig = this.getSchemaConfig();

            for (const key in schemaConfig) {
                const schemaDef = schemaConfig[key];

                /**
                 * These lines are crucial!!!
                 * - at this place, we can reassign properties to update to mongoose and it is necessary to use
                 *   the original document, because only this way can the mongoose ensure the proper deep population flow
                 * - we do not write own population flow, this is too much to implement and mongoose's solution is more than perfect for us
                 */

                /**
                 * If the property is scalar, we just reassign the value to mongoose document to save into database
                 */
                if (!schemaDef.ref) {
                    this._document[key] = this[key];
                }

                /**
                 * Magic happens here
                 * If it is a ref, we have to reassign the document property (and its proto) to mongoose, but we have to handle the array types
                 */
                if (schemaDef.ref) {
                    if (!schemaDef.multi) {
                        this._document[key] = this[key];
                    }

                    if (schemaDef.multi) {
                        this._document[key] = this[key].map((item) => item._document);
                    }
                }
                /**
                 * After those steps, we gonna create the instances again in "loadValuesFromDocument" from the mongoose document protos
                 */
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

        const schemaConfig = this.getSchemaConfig();

        for (const key in schemaConfig) {
            this[key] = this._document[key];
        }

        this._id = this._document._id;

        await AbstractDocument.mapInstanceTree(this, this._document);
    }

    ////////////////////////////////////////
    //// Lifecycle Callback Section /////
    //////////////////////////////////

    private async executeLifecycleCallbackType(type: string) {
        const config = (this.constructor as typeof AbstractDocument).getLifecycleCallbackConfig();
        const keys = config?.[type] || [];

        for (const key of keys) {
            await this[key]();
        }
    }
}
