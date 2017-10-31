// tslint:disable

import { TestConcreteClass } from '../../src/concrete';

export class MockTestConcreteClass extends TestConcreteClass {
    /**
     * Static Helpers
     */

    private static $spies: any = {};
    private static get $class(): any {
        return TestConcreteClass;
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
        return TestConcreteClass.prototype;
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
     * sa1
     */

    /**
     * sa2
     */
    public static $getSa2() {
        return this.$get( 'sa2' );
    }
    public static $setSa2( val: any ) {
        this.$set( 'sa2', val );
    }

    /**
     * sa3
     */
    public static sa3: any;

    /**
     * sc1
     */
    public static $createGetterForSc1() {
        return this.$createGetterFor( 'sc1' );
    }
    public static $getSpyForSc1() {
        return this.$getSpyFor( 'sc1' );
    }

    /**
     * sc2
     */
    public static $getSc2() {
        return this.$get( 'sc2' );
    }
    public static $createGetterForSc2() {
        return this.$createGetterFor( 'sc2' );
    }
    public static $getSpyForSc2() {
        return this.$getSpyFor( 'sc2' );
    }

    /**
     * sc3
     */
    public static $getSc3() {
        return this.$get( 'sc3' );
    }
    public static $createGetterForSc3() {
        return this.$createGetterFor( 'sc3' );
    }
    public static $getSpyForSc3() {
        return this.$getSpyFor( 'sc3' );
    }

    /**
     * sd1
     */
    public static $createSetterForSd1() {
        return this.$createSetterFor( 'sd1' );
    }
    public static $getSpyForSd1() {
        return this.$getSpyFor( 'sd1' );
    }

    /**
     * sd2
     */
    public static $createSetterForSd2() {
        return this.$createSetterFor( 'sd2' );
    }
    public static $getSpyForSd2() {
        return this.$getSpyFor( 'sd2' );
    }

    /**
     * sd3
     */
    public static $createSetterForSd3() {
        return this.$createSetterFor( 'sd3' );
    }
    public static $getSpyForSd3() {
        return this.$getSpyFor( 'sd3' );
    }

    /**
     * se1
     */
    public static $createSpyForSe1() {
        return this.$createSpyFor( 'se1' );
    }
    public static $getSpyForSe1() {
        return this.$getSpyFor( 'se1' );
    }

    /**
     * se2
     */
    public static $callSe2( ...args: any[]) {
        return this.$call( 'se2', ...args );
    }
    public static $createSpyForSe2() {
        return this.$createSpyFor( 'se2' );
    }
    public static $getSpyForSe2() {
        return this.$getSpyFor( 'se2' );
    }

    /**
     * se3
     */
    public static $callSe3( ...args: any[]) {
        return this.$call( 'se3', ...args );
    }
    public static $createSpyForSe3() {
        return this.$createSpyFor( 'se3' );
    }
    public static $getSpyForSe3() {
        return this.$getSpyFor( 'se3' );
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
