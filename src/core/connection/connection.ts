import { now } from 'microtime';
import * as mongoose from 'mongoose';
import { AbstractDocument } from "../document/abstract.document";

interface ConnectionOptions {
    uri: string;
    options?: mongoose.ConnectOptions;
    documents: Array<typeof AbstractDocument>;
}

export class Connection {
    public options: ConnectionOptions;
    public mongoose: mongoose.Mongoose;

    constructor(options: ConnectionOptions) {
        this.options = options;
    }

    public async connect() {
        const start = now();

        this.mongoose = await mongoose.connect(
            this.options.uri,
            this.options.options
        );

        console.log(`Connected to database (duration: ${now() - start}µs)`);

        const startInitialize = now();

        for (const document of this.options.documents) {
            const schema = document.getSchema();
            const name = document.getModelName();

            const model = this.mongoose.model(name, schema, name, {
                connection: this.mongoose.connection,
                overwriteModels: true
            });

            document.setModel(model);
            document.setMongoose(this.mongoose);
        }

        console.log(`Database initialized (duration: ${now() - startInitialize}µs)`);
    }

    public async createIndexes() {
        for (const document of this.options.documents) {
            const start = now();
            await document.createIndexes();
            const duration = now() - start;
            console.log(`Index ensured (document: ${document.getModelName()}, duration: ${duration}µs)`);
        }
    }

    public async syncIndexes() {
        for (const document of this.options.documents) {
            const start = now();
            await document.syncIndexes();
            const duration = now() - start;
            console.log(`Index synced  (document: ${document.getModelName()}, duration: ${duration}µs)`);
        }
    }

    public async disconnect() {
        await this.mongoose.disconnect();
    }

    public async stats() {
        return this.mongoose.connection.db.stats();
    }

    public async dropDatabase() {
        return this.mongoose.connection.db.dropDatabase();
    }
}
