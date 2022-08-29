import { now } from 'microtime';
import { CreateIndexesOptions } from 'mongodb';
import * as mongoose from 'mongoose';
import { AbstractDocument } from "../document/abstract.document";

interface ConnectionOptions {
    uri: string;
    options?: mongoose.ConnectOptions;
    documents: Array<typeof AbstractDocument>;
    debug?: boolean;
}

export class Connection {
    public options: ConnectionOptions;
    public mongoose: mongoose.Mongoose;

    constructor(options: ConnectionOptions) {
        this.options = options;

        /**
         * This is a very opinionated step!
         * By default, i think, this should be false
         */
        mongoose.set('strictQuery', false);
    }

    public async connect() {
        const start = now();

        this.mongoose = await mongoose.connect(
            this.options.uri,
            this.options.options
        );

        this._log(`Connected to database (duration: ${now() - start}µs)`);

        const startInitialize = now();

        for (const document of this.options.documents) {
            const schema = document.getSchema();
            const name = document.getModelName();

            if (!name) {
                throw new Error('UnableToInitializeADocumentWithoutCollectionName');
            }

            const model = this.mongoose.model(name, schema, name, {
                connection: this.mongoose.connection,
                overwriteModels: true
            });

            document.setModel(model);
            document.setMongoose(this.mongoose);
        }

        this._log(`Database initialized (duration: ${now() - startInitialize}µs)`);
    }

    public async disconnect() {
        await this.mongoose.disconnect();
    }

    public async createIndexes(options?: CreateIndexesOptions) {
        for (const document of this.options.documents) {
            const start = now();
            await document.createIndexes(options);
            const duration = now() - start;

            this._log(`Index ensured (document: ${document.getModelName()}, duration: ${duration}µs)`);
        }
    }

    public async syncIndexes(options?: mongoose.SyncIndexesOptions) {
        for (const document of this.options.documents) {
            const start = now();
            await document.syncIndexes(options);
            const duration = now() - start;

            this._log(`Index synced  (document: ${document.getModelName()}, duration: ${duration}µs)`);
        }
    }

    private _log(message: any) {
        if (!this.options.debug) {
            return;
        }

        console.log(message);
    }
}
