import { Connection } from '../../core/connection/connection';
import { HumanDocument } from '../documents/human.document';

global.__connection = null;

export const connectDatabase = async (documents: Array<typeof HumanDocument>) => {
    const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/tests';

    global.__connection = new Connection({
        uri: connectionString,
        documents: documents,
        debug: true
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
