import { faker } from '@faker-js/faker';
import { HumanDocument } from '../documents/human.document';

export const seedHumans = async (amount: number) => {
    for (const item of Array(amount).fill(0)) {
        const instance = new HumanDocument();

        instance.name = `${faker.person.firstName()} ${faker.person.lastName()}`;

        await instance.save();
    }
};
