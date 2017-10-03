import { MethodInfo } from './types/method-info';
import { GetAccessorInfo, SetAccessorInfo } from './types/accessor-info';
import { ParameterPropertyInfo, PropertyInfo } from './types/property-info';
import { ClassMember } from './types/class-member';

import { MARKER_CUSTOM_CODE_BEGIN, MARKER_CUSTOM_CODE_END, TAB } from './constants';
import { MemberKind } from './types/member-properties';

/**
 * This class helps to mock functions, getters and setter of given class
 * @author Thanish, Mehdhi
 * @export
 * @class FunctionGenerator
 */
export class FunctionGenerator {

    private upperCamelCase(str: string): string {
        return str[0].toUpperCase() + str.slice(1);
    }

    private createTypeParams( typeParameters: string[] ) {
        // Currently all generic types are converted to any
        // When types are considered for Mocks this method should adapt it
        const params = typeParameters.map(() => 'any');
        if (!params.length) {
            return '';
        }
        return `<${params.join(',')}>`;
    }
    
    public createClassHeader( className: string, typeParameters: string[] ): string[] {
        const typeParams = this.createTypeParams( typeParameters );
        return [`export class Mock${className} extends ${className}${typeParams} {`];
    }
    
    public createClassFooter(): string[] {
        return [`}`];
    }
    
    public createHelpers(className: string): string[] {
        return [
            `/**`,
            ` * Static Helpers`,
            ` */`,
            ``,
            `private static \$spies: any = {};`,
            `private static get \$class(): any {`,
            `${TAB}return ${className};`,
            `}`,
            `public static \$get( field: string ): any {`,
            `${TAB}return this.\$class[field];`,
            `}`,
            `public static \$call( field: string, ...args: any[]): any {`,
            `${TAB}return this.\$class[field].call( this, ...args );`,
            `}`,
            `public static \$createGetterFor( field: string ): jasmine.Spy {`,
            `${TAB}if ( !this.\$spies[field]) {`,
            `${TAB}${TAB}this.\$spies[field] = spyOnProperty( this.\$class, field, 'get' );`,
            `${TAB}}`,
            `${TAB}return this.\$spies[field];`,
            `}`,
            `public static \$createSetterFor( field: string ): jasmine.Spy {`,
            `${TAB}if ( !this.\$spies[field]) {`,
            `${TAB}${TAB}this.\$spies[field] = spyOnProperty( this.\$class, field, 'set' );`,
            `${TAB}}`,
            `${TAB}return this.\$spies[field];`,
            `}`,
            `public static \$createSpyFor( field: string ): jasmine.Spy {`,
            `${TAB}if ( !this.\$spies[field]) {`,
            `${TAB}${TAB}this.\$spies[field] = spyOn( this.\$class, field );`,
            `${TAB}}`,
            `${TAB}return this.\$spies[field];`,
            `}`,
            ``,
            `/**`,
            ` * Instance Helpers`,
            ` */`,
            ``,
            `private \$spies: any = {};`,
            `private get \$instance(): any {`,
            `${TAB}return this;`,
            `}`,
            `private get \$prototype(): any {`,
            `${TAB}return ${className}.prototype;`,
            `}`,
            `public \$get( field: string ): any {`,
            `${TAB}return this.\$instance[field];`,
            `}`,
            `public \$call( field: string, ...args: any[]): any {`,
            `${TAB}return this.\$prototype[field].call( this, ...args );`,
            `}`,
            `public \$createGetterFor( field: string ): jasmine.Spy {`,
            `${TAB}if ( !this.\$spies[field]) {`,
            `${TAB}${TAB}this.\$spies[field] = spyOnProperty( this.\$instance, field, 'get' );`,
            `${TAB}}`,
            `${TAB}return this.\$spies[field];`,
            `}`,
            `public \$createSetterFor( field: string ): jasmine.Spy {`,
            `${TAB}if ( !this.\$spies[field]) {`,
            `${TAB}${TAB}this.\$spies[field] = spyOnProperty( this.\$instance, field, 'set' );`,
            `${TAB}}`,
            `${TAB}return this.\$spies[field];`,
            `}`,
            `public \$createSpyFor( field: string ): jasmine.Spy {`,
            `${TAB}if ( !this.\$spies[field]) {`,
            `${TAB}${TAB}this.\$spies[field] = spyOn( this.\$instance, field );`,
            `${TAB}}`,
            `${TAB}return this.\$spies[field];`,
            `}`,
        ];
    }
    
    private createMethod( sourceProperty: ClassMember ): string[] {
        const lines = [''];
        const propertyName = sourceProperty.name;
        if (propertyName) {
            lines.push(
                `/**`,
                ` * ${propertyName}`,
                ` */`,
            );
            if (sourceProperty.isStatic) {
                if (sourceProperty.isNotPublic()) {
                    lines.push(
                        `public static \$call${this.upperCamelCase(propertyName)}( ...args: any[]) {`,
                        `${TAB}return this.$call( '${propertyName}', ...args );`,
                        `}`,
                    );
                }
                lines.push(
                    `public static \$createSpyFor${this.upperCamelCase(propertyName)}() {`,
                    `${TAB}return this.\$createSpyFor( '${propertyName}' );`,
                    `}`,
                );
            } else {
                // TODO: Fixme, Issue generating mocks for abstract methods
                if (sourceProperty.isAbstract) {
                    lines.push(
                        `public ${propertyName}( ...args: any[]) {`,
                        `${TAB}return undefined as any;`,
                        `}`,
                    );
                } else if ( sourceProperty.isProtected() ) {
                    lines.push(
                        `public ${propertyName}( ...args: any[]) {`,
                        `${TAB}return this.$call( '${propertyName}', ...args );`,
                        `}`,
                    );
                } else if ( sourceProperty.isPrivate() ) {
                    lines.push(
                        `public \$call${this.upperCamelCase(propertyName)}( ...args: any[]) {`,
                        `${TAB}return this.$call( '${propertyName}', ...args );`,
                        `}`,
                    );
                }
                lines.push(
                    `public \$createSpyFor${this.upperCamelCase(propertyName)}() {`,
                    `${TAB}return this.\$createSpyFor( '${propertyName}' );`,
                    `}`,
                );
            }
        }
        return lines;
    }
    
    private createGetter(sourceProperty: ClassMember): string[] {
        const lines = [''];
        const propertyName = sourceProperty.name;
        if (propertyName) {
            lines.push(
                `/**`,
                ` * ${propertyName}`,
                ` */`,
            );
            if (sourceProperty.isStatic) {
                if (sourceProperty.isNotPublic()) {
                    lines.push(
                        `public static \$get${this.upperCamelCase(propertyName)}() {`,
                        `${TAB}return this.$get( '${propertyName}' );`,
                        `}`,
                    );
                }
                lines.push(
                    `public static \$createGetterFor${this.upperCamelCase(propertyName)}() {`,
                    `${TAB}return this.\$createGetterFor( '${propertyName}' );`,
                    `}`,
                );
            } else {
                if (sourceProperty.isAbstract) {
                    if ( sourceProperty.kindName == MemberKind.Property ) {
                        lines.push(`public ${propertyName}: any;`);
                    }
                    if ( sourceProperty.kindName == MemberKind.Getter ) {
                        lines.push(
                            `public get ${propertyName}(): any {`,
                            `${TAB}return undefined as any;`,
                            `}`,
                        );
                    }
                } else if (sourceProperty.isNotPublic()) {
                    lines.push(
                        `public \$get${this.upperCamelCase(propertyName)}() {`,
                        `${TAB}return this.$get( '${propertyName}' );`,
                        `}`,
                    );
                }
                lines.push(
                    `public \$createGetterFor${this.upperCamelCase(propertyName)}() {`,
                    `${TAB}return this.\$createGetterFor( '${propertyName}' );`,
                    `}`,
                );
            }
        }
        return lines;
    }
    
    private createSetter(sourceProperty: ClassMember): string[] {
        const lines = [''];
        const propertyName = sourceProperty.name;
        if( propertyName  ){
            lines.push(
                `/**`,
                ` * ${propertyName}`,
                ` */`,
            );
            if (sourceProperty.isStatic) {
                lines.push(
                    `public static \$createSetterFor${this.upperCamelCase(propertyName)}() {`,
                    `${TAB}return this.\$createSetterFor( '${propertyName}' );`,
                    `}`,
                );
            } else {
                if (sourceProperty.isAbstract) {
                    lines.push(
                        `public set ${propertyName}( val: any ) {`,
                        `}`,
                    );
                }
                lines.push(
                    `public \$createSetterFor${this.upperCamelCase(propertyName)}() {`,
                    `${TAB}return this.\$createSetterFor( '${propertyName}' );`,
                    `}`,
                );
            }
        }
        return lines;
    }
    
    private createParameter(sourceProperty: ClassMember): string[] {
        const lines = [''];
        const parameterName = sourceProperty.name;
        lines.push(
            `/**`,
            ` * ${parameterName}`,
            ` */`,
        );
        if (parameterName) {
            if (sourceProperty.isNotPublic()) {
                lines.push(
                    `public \$get${this.upperCamelCase(parameterName)}() {`,
                    `${TAB}return this.$get( '${parameterName}' );`,
                    `}`,
                );
            }
            lines.push(
                `public \$createGetterFor${this.upperCamelCase(parameterName)}() {`,
                `${TAB}return this.\$createGetterFor( '${parameterName}' );`,
                `}`,
            );
        }
        return lines;
    }
    
    public createMembers( sourceProperties: ClassMember[] ): string[] {
        return sourceProperties.map(
            sourceProperty => {
                if (sourceProperty instanceof MethodInfo) {
                    return this.createMethod( sourceProperty );
                } else if (sourceProperty instanceof PropertyInfo ) {
                    return this.createGetter(sourceProperty);
                } else if (sourceProperty instanceof GetAccessorInfo ) {
                    return this.createGetter(sourceProperty);
                } else if (sourceProperty instanceof SetAccessorInfo) {
                    return this.createSetter(sourceProperty);
                } else if (sourceProperty instanceof ParameterPropertyInfo) {
                    return this.createParameter(sourceProperty);
                } else {
                    return [];
                }
            })
            .reduce((acc: string[], next: string[]) => {
                return acc.concat(next);
            }, []);
    }

    public createCustomCodeMarker( userWrittenCode: string | undefined ) {
        let relevantUserMethods = [ TAB + MARKER_CUSTOM_CODE_BEGIN, '' ];
        if ( userWrittenCode && userWrittenCode.length > 0 ) {
            relevantUserMethods.push( userWrittenCode );
        } else {
            relevantUserMethods.push( `${TAB}// Write your methods inside these markers` );
        }
        relevantUserMethods.push( '', TAB + MARKER_CUSTOM_CODE_END );
        return relevantUserMethods;
    }

}
