import * as mongoose from 'mongoose';
import { BaseDocument } from '../document/base.document';

interface ConnectionOptions {
    uri: string;
    options?: mongoose.ConnectOptions;
    documents: Array<typeof BaseDocument>;
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
            await this.addDocument(document);
        }
    }

    private async addDocument(document: typeof BaseDocument) {
        const schema = document.getSchema();
        const name = document.getModelName();

        const model = this.mongoose.model(name, schema, name, {
            connection: this.mongoose.connection
        });

        document.setMongoose(this.mongoose);
        document.setModel(model);

        await model.syncIndexes();
    }
}
