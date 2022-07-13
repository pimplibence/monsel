import { faker } from '@faker-js/faker';
import { HumanDocument } from '../documents/human.document';

export const seedHumans = async (amount: number) => {
    for (const item of Array(amount).fill(0)) {
        const instance = new HumanDocument();

        instance.name = `${faker.name.firstName()} ${faker.name.lastName()}`;

        await instance.save();
    }
};
