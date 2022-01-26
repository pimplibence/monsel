import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';
import { PopulateOptions, QueryOptions } from 'mongoose';
import { AbstractDocument } from './abstract.document';

export class BaseDocument extends AbstractDocument<BaseDocument> {
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

    //////////////////////
    // POPULATE SECTION //
    //////////////////////

    public async populate(options: PopulateOptions | PopulateOptions[]) {
        await this._document.populate(options);
        await this.loadValuesFromDocument();

        this.loadAfterPopulateDeep(this, this._document);
    }

    private loadAfterPopulateDeep(instance: BaseDocument, values: any) {
        const schemaOptions = instance.getSchemaOptions();

        for (const key in schemaOptions) {
            const schemaOption = schemaOptions?.[key];
            const ref: typeof BaseDocument = schemaOption?.ref;
            const multi = schemaOption?.multi;

            if (!ref) {
                continue;
            }

            instance[key] = multi
                ? values?.[key]?.map((item, index) => this.loadAfterPopulateDeepChildMapper(values?.[key]?.[index], instance?.[key]?.[index], ref))
                : this.loadAfterPopulateDeepChildMapper(values?.[key], instance?.[key], ref);
        }
    }

    private loadAfterPopulateDeepChildMapper(mongooseDocument: mongoose.Document, notMongooseDocument: BaseDocument, ref: typeof BaseDocument) {
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
}
