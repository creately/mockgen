export abstract class TestAbstractClass {
    public a1: number;
    private a2: number;
    protected a3: number;

    public abstract aa1: number;
    protected abstract aa3: number;

    constructor(
        public b1: number,
        private b2: number,
        protected b3: number,
    ) {}

    public abstract get ac1(): number;
    protected abstract get ac3(): number;

    public abstract set ad1(v: number);
    protected abstract set ad3(v: number);

    public abstract ae1(): void;
    protected abstract ae3(): void;

    public get c1(): number { return 1 }
    private get c2(): number { return 1 }
    protected get c3(): number { return 1 }

    public set d1(v: number) {}
    private set d2(v: number) {}
    protected set d3(v: number) {}

    public e1(): void {}
    private e2(): void {}
    protected e3(): void {}
}
