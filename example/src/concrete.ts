export class TestConcreteClass {
    public static sa1: number;
    private static sa2: number;
    protected static sa3: number;

    public static a1: number;
    private static a2: number;
    protected static a3: number;

    public static get sc1(): number { return 1 }
    private static get sc2(): number { return 1 }
    protected static get sc3(): number { return 1 }

    public static set sd1(v: number) {}
    private static set sd2(v: number) {}
    protected static set sd3(v: number) {}

    public static se1(): void {}
    private static se2(): void {}
    protected static se3(): void {}

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
