export abstract class TestAbstractClass {
    public pubp1: number;
    private prip2: number;
    protected prop3: number;

    public abstract apubp1: number;
    protected abstract aprop2: number;

    constructor(
        public pubparamp1: number,
        private priparamp2: number,
        protected proparamp3: number,
    ) {}

    public abstract get apubget1(): number;
    protected abstract get aproget2(): number;

    public abstract set apubset1(v: number);
    protected abstract set aproset2(v: number);

    public abstract apubmeth1(): void;
    protected abstract aprometh2(): void;

    public get cpubget1(): number { return 1 }
    private get cpriget2(): number { return 1 }
    protected get cproget3(): number { return 1 }

    public set dpubset1(v: number) {}
    private set dpriset2(v: number) {}
    protected set dproset3(v: number) {}

    public epubmeth1(): void {}
    private eprimeth2(): void {}
    protected eprometh3(): void {}
}
