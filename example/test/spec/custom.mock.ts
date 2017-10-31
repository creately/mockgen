// tslint:disable

import { TestCustomClass } from '../../src/custom';

export class MockTestCustomClass extends TestCustomClass {
    /**
     * Static Helpers
     */

    private static $spies: any = {};
    private static get $class(): any {
        return TestCustomClass;
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
        return TestCustomClass.prototype;
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
    // mockgen:custom

    public custom1: any;
    public custom2: any;

    /**
     * custom3
     */
    public custom3(x: number, y: number): number {
        return x + y;
    }
}
