import { IsString } from 'class-validator';
import { document } from '../../src/core/document/decorators/document';
import { beforeCreate, beforeUpdate } from '../../src/core/document/decorators/lifecycle-callback';
import { property } from '../../src/core/document/decorators/property';
import { ref } from '../../src/core/document/decorators/ref';
import { BaseDocument } from '../../src/extra/base.document';

@document({
    collection: 'human',
    indexes: []
})
export class HumanDocument extends BaseDocument {
    @IsString()
    @property()
    public name: string;

    @property()
    public random: number;

    @ref(() => HumanDocument)
    public brother: HumanDocument;

    @beforeCreate()
    @beforeUpdate()
    public initRandom() {
        this.random = Math.random();
    }
}
