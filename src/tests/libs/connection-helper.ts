import { Connection } from '../../core/connection/connection';

global.__connection = null;

export const connectDatabase = async () => {
    const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://root:abcd1234@localhost:51301/tests?authSource=admin';

    global.__connection = new Connection({
        uri: connectionString,
        documents: [],
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

    await connection.dropDatabase();
    await disconnectDatabase();
};
