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
        this.mongoose = await mongoose.connect(
            this.options.uri,
            this.options.options
        );

        for (const document of this.options.documents) {
            const schema = document.getSchema();
            const name = document.getModelName();

            const model = this.mongoose.model(name, schema, name, {
                connection: this.mongoose.connection,
                overwriteModels: true
            });

            document.setModel(model);
            document.setMongoose(this.mongoose);

            await document.ensureIndexes();
            await document.syncIndexes();
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
