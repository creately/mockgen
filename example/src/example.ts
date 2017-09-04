export class TestClass {
    public a1: number;
    private a2: number;
    protected a3: number;

    constructor(
        public b1: number,
        private b2: number,
        protected b3: number,
    ) {}

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