// tslint:disable

import { TestAbstractClass } from '../../src/abstract';

export class MockTestAbstractClass extends TestAbstractClass {
    /**
     * Static Helpers
     */

    private static $spies: any = {};
    private static get $class(): any {
        return TestAbstractClass;
    }
    public static $get( field: string ): any {
        return this.$class[field];
    }
    public static $set( field: string, value: any ): any {
        this.$class[field] = value;
    }
    public static $call( field: string, ...args: any[]): any {
        return this.$class[field].call( this, ...args );
    }
    public static $createGetterFor( field: string ): jasmine.Spy {
        this.$spies[field] = spyOnProperty( this.$class, field, 'get' );
        return this.$spies[field];
    }
    public static $createSetterFor( field: string ): jasmine.Spy {
        this.$spies[field] = spyOnProperty( this.$class, field, 'set' );
        return this.$spies[field];
    }
    public static $createSpyFor( field: string ): jasmine.Spy {
        this.$spies[field] = spyOn( this.$class, field );
        return this.$spies[field];
    }
    public static $getSpyFor( field: string ): jasmine.Spy {
        return this.$spies[field];
    }

    /**
     * Instance Helpers
     */

    private $spies: any = {};
    private get $instance(): any {
        return this;
    }
    private get $prototype(): any {
        return TestAbstractClass.prototype;
    }
    public $get( field: string ): any {
        return this.$instance[field];
    }
    public $set( field: string, value: any ): any {
        this.$instance[field] = value;
    }
    public $call( field: string, ...args: any[]): any {
        return this.$prototype[field].call( this, ...args );
    }
    public $createGetterFor( field: string ): jasmine.Spy {
        this.$spies[field] = spyOnProperty( this.$instance, field, 'get' );
        return this.$spies[field];
    }
    public $createSetterFor( field: string ): jasmine.Spy {
        this.$spies[field] = spyOnProperty( this.$instance, field, 'set' );
        return this.$spies[field];
    }
    public $createSpyFor( field: string ): jasmine.Spy {
        this.$spies[field] = spyOn( this.$instance, field );
        return this.$spies[field];
    }
    public $getSpyFor( field: string ): jasmine.Spy {
        return this.$spies[field];
    }

    /**
     * a1
     */

    /**
     * a2
     */
    public $getA2() {
        return this.$get( 'a2' );
    }
    public $setA2( val: any ) {
        this.$set( 'a2', val );
    }

    /**
     * a3
     */
    public a3: any;

    /**
     * aa1
     */
    public aa1: any;

    /**
     * aa3
     */
    public aa3: any;

    /**
     * ac1
     */
    public get ac1(): any {
        return undefined as any;
    }
    public $createGetterForAc1() {
        return this.$createGetterFor( 'ac1' );
    }
    public $getSpyForAc1() {
        return this.$getSpyFor( 'ac1' );
    }

    /**
     * ac3
     */
    public get ac3(): any {
        return undefined as any;
    }
    public $createGetterForAc3() {
        return this.$createGetterFor( 'ac3' );
    }
    public $getSpyForAc3() {
        return this.$getSpyFor( 'ac3' );
    }

    /**
     * ad1
     */
    public set ad1( val: any ) {
    }
    public $createSetterForAd1() {
        return this.$createSetterFor( 'ad1' );
    }
    public $getSpyForAd1() {
        return this.$getSpyFor( 'ad1' );
    }

    /**
     * ad3
     */
    public set ad3( val: any ) {
    }
    public $createSetterForAd3() {
        return this.$createSetterFor( 'ad3' );
    }
    public $getSpyForAd3() {
        return this.$getSpyFor( 'ad3' );
    }

    /**
     * ae1
     */
    public ae1( ...args: any[]) {
        return undefined as any;
    }
    public $createSpyForAe1() {
        return this.$createSpyFor( 'ae1' );
    }
    public $getSpyForAe1() {
        return this.$getSpyFor( 'ae1' );
    }

    /**
     * ae3
     */
    public ae3( ...args: any[]) {
        return undefined as any;
    }
    public $createSpyForAe3() {
        return this.$createSpyFor( 'ae3' );
    }
    public $getSpyForAe3() {
        return this.$getSpyFor( 'ae3' );
    }

    /**
     * c1
     */
    public $createGetterForC1() {
        return this.$createGetterFor( 'c1' );
    }
    public $getSpyForC1() {
        return this.$getSpyFor( 'c1' );
    }

    /**
     * c2
     */
    public $getC2() {
        return this.$get( 'c2' );
    }
    public $createGetterForC2() {
        return this.$createGetterFor( 'c2' );
    }
    public $getSpyForC2() {
        return this.$getSpyFor( 'c2' );
    }

    /**
     * c3
     */
    public $getC3() {
        return this.$get( 'c3' );
    }
    public $createGetterForC3() {
        return this.$createGetterFor( 'c3' );
    }
    public $getSpyForC3() {
        return this.$getSpyFor( 'c3' );
    }

    /**
     * d1
     */
    public $createSetterForD1() {
        return this.$createSetterFor( 'd1' );
    }
    public $getSpyForD1() {
        return this.$getSpyFor( 'd1' );
    }

    /**
     * d2
     */
    public $setD2( val: any ) {
        this.$set( 'd2', val );
    }
    public $createSetterForD2() {
        return this.$createSetterFor( 'd2' );
    }
    public $getSpyForD2() {
        return this.$getSpyFor( 'd2' );
    }

    /**
     * d3
     */
    public $setD3( val: any ) {
        this.$set( 'd3', val );
    }
    public $createSetterForD3() {
        return this.$createSetterFor( 'd3' );
    }
    public $getSpyForD3() {
        return this.$getSpyFor( 'd3' );
    }

    /**
     * e1
     */
    public $createSpyForE1() {
        return this.$createSpyFor( 'e1' );
    }
    public $getSpyForE1() {
        return this.$getSpyFor( 'e1' );
    }

    /**
     * e2
     */
    public $callE2( ...args: any[]) {
        return this.$call( 'e2', ...args );
    }
    public $createSpyForE2() {
        return this.$createSpyFor( 'e2' );
    }
    public $getSpyForE2() {
        return this.$getSpyFor( 'e2' );
    }

    /**
     * e3
     */
    public e3( ...args: any[]) {
        return this.$call( 'e3', ...args );
    }
    public $createSpyForE3() {
        return this.$createSpyFor( 'e3' );
    }
    public $getSpyForE3() {
        return this.$getSpyFor( 'e3' );
    }

    /**
     * b1
     */

    /**
     * b2
     */
    public $getB2() {
        return this.$get( 'b2' );
    }
    public $setB2( val: any ) {
        return this.$set( 'b2', val );
    }

    /**
     * b3
     */
    public b3: any;
}
