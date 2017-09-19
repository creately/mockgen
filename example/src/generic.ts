export class TestGenericClass<T> {
    public a1: T;
    private a2: T;
    protected a3: T;

    constructor(
        public b1: T,
        private b2: T,
        protected b3: T,
    ) {}

    public get c1(): T { return this.a1; }
    private get c2(): T { return this.a2; }
    protected get c3(): T { return this.a3; }

    public set d1(v: T) {}
    private set d2(v: T) {}
    protected set d3(v: T) {}

    public e1(): void {}
    private e2(): void {}
    protected e3(): void {}
}