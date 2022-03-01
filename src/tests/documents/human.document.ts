import { AbstractDocument } from '../../core/document/abstract.document';
import { document } from '../../core/document/decorators/document';
import { beforeCreate, beforeUpdate } from '../../core/document/decorators/lifecycle-callback';
import { property } from '../../core/document/decorators/property';

@document({
    collection: 'human',
    indexes: [
        { fields: { name: 1 }, options: { name: 'name-index' } },
        { fields: { age: 1 }, options: { name: 'age-index' } },
    ],
    schemaOptions: {
        shardKey: { gender: 'hashed' }
    }
})
export class HumanDocument extends AbstractDocument {
    @property()
    public name: string;

    @property()
    public age: number;

    @property()
    public gender: string;

    @property()
    public createdAt: Date;

    @property()
    public updatedAt: Date;

    @beforeCreate()
    public initGender() {
        this.gender = (Math.random() > .5)
            ? 'men'
            : 'woman';
    }

    @beforeCreate()
    public initCreatedAt() {
        this.createdAt = new Date();
    }

    @beforeUpdate()
    public initUpdatedAt() {
        this.updatedAt = new Date();
    }
}
