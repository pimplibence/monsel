import { IsString, Min } from 'class-validator';
import { document } from '../../core/document/decorators/document';
import { beforeCreate, beforeUpdate } from '../../core/document/decorators/lifecycle-callback';
import { property } from '../../core/document/decorators/property';
import { BaseDocument } from '../../extra/base.document';

@document({
    collection: 'human',
    indexes: []
})
export class HumanDocument extends BaseDocument {
    @IsString()
    @property()
    public name: string;

    @Min(0)
    @property()
    public age: number;

    @property()
    public random: number;

    @beforeCreate()
    @beforeUpdate()
    public initRandom() {
        this.random = Math.random();
    }
}
