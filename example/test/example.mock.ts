import { TestClass } from '../src/example';

export class MockTestClass extends TestClass {
    public $createGetterForA1() {
        return spyOnProperty( this as any, 'a1', 'get' );
    }
    public $getA2() {
        return ( this as any ).a2;
    }
    public $createGetterForA2() {
        return spyOnProperty( this as any, 'a2', 'get' );
    }
    public $getA3() {
        return ( this as any ).a3;
    }
    public $createGetterForA3() {
        return spyOnProperty( this as any, 'a3', 'get' );
    }
    public $createGetterForC1() {
        return spyOnProperty( this as any, 'c1', 'get' );
    }
    public $getC2() {
        return ( this as any ).c2;
    }
    public $createGetterForC2() {
        return spyOnProperty( this as any, 'c2', 'get' );
    }
    public $getC3() {
        return ( this as any ).c3;
    }
    public $createGetterForC3() {
        return spyOnProperty( this as any, 'c3', 'get' );
    }
    public $createSetterForD1() {
        return spyOnProperty( this as any, 'd1', 'set' );
    }
    public $createSetterForD2() {
        return spyOnProperty( this as any, 'd2', 'set' );
    }
    public $createSetterForD3() {
        return spyOnProperty( this as any, 'd3', 'set' );
    }
    private $spyForE1: jasmine.Spy;
    public $createSpyForE1() {
        if ( !this.$spyForE1 ) {
            this.$spyForE1 = spyOn( this as any, 'e1' );
        }
        return this.$spyForE1;
    }
    public e2( ...args ) {
        return super.e2.call( this, ...args );
    }
    private $spyForE2: jasmine.Spy;
    public $createSpyForE2() {
        if ( !this.$spyForE2 ) {
            this.$spyForE2 = spyOn( this as any, 'e2' );
        }
        return this.$spyForE2;
    }
    public e3( ...args ) {
        return super.e3.call( this, ...args );
    }
    private $spyForE3: jasmine.Spy;
    public $createSpyForE3() {
        if ( !this.$spyForE3 ) {
            this.$spyForE3 = spyOn( this as any, 'e3' );
        }
        return this.$spyForE3;
    }
    public $createGetterForB1() {
        return spyOnProperty( this as any, 'b1', 'get' );
    }
    public $getB2() {
        return ( this as any ).b2;
    }
    public $createGetterForB2() {
        return spyOnProperty( this as any, 'b2', 'get' );
    }
    public $getB3() {
        return ( this as any ).b3;
    }
    public $createGetterForB3() {
        return spyOnProperty( this as any, 'b3', 'get' );
    }
}
