import { Connection } from '../../core/connection/connection';
import { AbstractDocument } from '../../core/document/abstract.document';

global.__connection = null;

export const connectDatabase = async (documents: Array<typeof AbstractDocument>) => {
    const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/monsel';

    global.__connection = new Connection({
        uri: connectionString,
        documents: documents,
        debug: false
    });

    await global.__connection.connect();
    await global.__connection.createIndexes();
    await global.__connection.syncIndexes();
};

export const getConnection = (): Connection => {
    return global.__connection;
};

export const disconnectDatabase = async () => {
    const connection = getConnection();
    await connection.disconnect();
};

export const resetDatabase = async () => {
    const connection = getConnection();

    await connection.mongoose.connection.db.dropDatabase();
    await disconnectDatabase();
};
