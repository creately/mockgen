// tslint:disable

import { TestGenericClass } from '../../src/generic';

export class MockTestGenericClass extends TestGenericClass<any> {
    /**
     * Static Helpers
     */

    private static $spies: any = {};
    private static get $class(): any {
        return TestGenericClass;
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
        return TestGenericClass.prototype;
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
}
