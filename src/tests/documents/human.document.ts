import { IsString } from 'class-validator';
import { document } from '../../core/document/decorators/document';
import { beforeCreate, beforeUpdate } from '../../core/document/decorators/lifecycle-callback';
import { property } from '../../core/document/decorators/property';
import { ref } from '../../core/document/decorators/ref';
import { BaseDocument } from '../../extra/base.document';

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
