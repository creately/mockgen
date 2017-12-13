import { TestAbstractClass } from './abstract';
import { TestConcreteClass } from './concrete';

export class TestInheritedClass extends TestConcreteClass {
    // override
    public e1(): void {}
}
