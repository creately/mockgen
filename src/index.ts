#!/usr/bin/env node

import * as path from 'path';
import { statSync, mkdirSync, writeFileSync } from 'fs';
import AST from 'ts-simple-ast';
import {
    SourceFile,
    ClassDeclaration,
    MethodDeclaration,
    ConstructorDeclaration,
    Scope,
    PropertyDeclaration,
    GetAccessorDeclaration,
    SetAccessorDeclaration,
    ParameterDeclaration,
} from 'ts-simple-ast';

import * as mkdirp from 'mkdirp';
import { argv } from 'yargs';

const ast = new AST();
const tab = '    ';
const mockClassFilenameSuffix = '.mock.ts';

const rootPath = process.cwd().replace( /\\/g, '/' );

let providedSourcePaths;

const srcDir = rootPath + ( argv.src ? argv.src.replace( /^(\.)/g, '' ) : '/src');
const outDir = rootPath + ( argv.out ? argv.out.replace( /^(\.)/g, '' ) : '/test/spec');
const inputs = argv._;

if ( inputs && inputs.length > 0 ) {
    providedSourcePaths = inputs.map( args => rootPath + args.replace( /^(\.)/g, '' ));
} else {
    providedSourcePaths = [ ( srcDir + '/**/*.ts' ) ];
}

ast.addSourceFiles( ...providedSourcePaths );
ast.getSourceFiles().forEach(sourceFile => {
    const sourceClasses = sourceFile.getClasses();

    if (!sourceClasses.length) {
        return;
    }

    const sourcePath = sourceFile.getFilePath();
    const outputPath = sourcePath.replace( srcDir, outDir ).replace(/\.ts$/, mockClassFilenameSuffix);
    const outputDirname = path.dirname(outputPath);
    const relativePath = path.relative(outputDirname, sourcePath).replace( /\\/g, '/' );

    const mockedImports = sourceClasses
        .map(sourceClass => {
            return `import { ${sourceClass.getName()} } from '${relativePath.replace(/\.ts$/, '')}';`
        });

    const mockedClasses = sourceClasses
        .map(sourceClass => {
            return [
                ...createClassHeader(sourceClass),
                ...prefix(tab, createHelpers(sourceClass)),
                ...prefix(tab, createMembers(sourceClass)),
                ...getCustomCode( sourceClass ),
                ...createClassFooter(sourceClass),
            ];
        })
        .reduce(( acc: string[], next: string[] ) => {
            return acc.concat(next);
        }, []);

    const mockedSource = [
        '// tslint:disable',
        '',
        ...mockedImports,
        '',
        ...mockedClasses,
        '',
    ].join('\n');

    try {
        statSync( outputDirname );
    } catch ( err ) {
        mkdirp.sync( outputDirname );
    }

    writeFileSync( outputPath, mockedSource );
    console.info( outputPath );
});


function prefix(str: string, lines: string[]): string[] {
    return lines.map(line => line !== '' ? str + line : '');
}

function upperCamelCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}

function createTypeParams(sourceClass: ClassDeclaration) {
    const params = sourceClass.getTypeParameters().map(() => 'any');
    if (!params.length) {
        return '';
    }
    return `<${params.join(',')}>`;
}

function createClassHeader(sourceClass: ClassDeclaration): string[] {
    const className = sourceClass.getName();
    const typeParams = createTypeParams(sourceClass);
    return [`export class Mock${className} extends ${className}${typeParams} {`];
}

function createClassFooter(sourceClass: ClassDeclaration): string[] {
    return [`}`];
}

function createHelpers(sourceClass: ClassDeclaration): string[] {
    const className = sourceClass.getName();
    return [
        `/**`,
        ` * Static Helpers`,
        ` */`,
        ``,
        `private static \$spies: any = {};`,
        `private static get \$class(): any {`,
        `${tab}return ${className};`,
        `}`,
        `public static \$get( field: string ): any {`,
        `${tab}return this.\$class[field];`,
        `}`,
        `public static \$set( field: string, value: any ): any {`,
        `${tab}this.\$class[field] = value;`,
        `}`,
        `public static \$call( field: string, ...args: any[]): any {`,
        `${tab}return this.\$class[field].call( this, ...args );`,
        `}`,
        `public static \$createGetterFor( field: string ): jasmine.Spy {`,
        `${tab}this.\$spies[field] = spyOnProperty( this.\$class, field, 'get' );`,
        `${tab}return this.\$spies[field];`,
        `}`,
        `public static \$createSetterFor( field: string ): jasmine.Spy {`,
        `${tab}this.\$spies[field] = spyOnProperty( this.\$class, field, 'set' );`,
        `${tab}return this.\$spies[field];`,
        `}`,
        `public static \$createSpyFor( field: string ): jasmine.Spy {`,
        `${tab}this.\$spies[field] = spyOn( this.\$class, field );`,
        `${tab}return this.\$spies[field];`,
        `}`,
        `public static \$getSpyFor( field: string ): jasmine.Spy {`,
        `${tab}return this.\$spies[field];`,
        `}`,
        ``,
        `/**`,
        ` * Instance Helpers`,
        ` */`,
        ``,
        `private \$spies: any = {};`,
        `private get \$instance(): any {`,
        `${tab}return this;`,
        `}`,
        `private get \$prototype(): any {`,
        `${tab}return ${className}.prototype;`,
        `}`,
        `public \$get( field: string ): any {`,
        `${tab}return this.\$instance[field];`,
        `}`,
        `public \$set( field: string, value: any ): any {`,
        `${tab}this.\$instance[field] = value;`,
        `}`,
        `public \$call( field: string, ...args: any[]): any {`,
        `${tab}return this.\$prototype[field].call( this, ...args );`,
        `}`,
        `public \$createGetterFor( field: string ): jasmine.Spy {`,
        `${tab}this.\$spies[field] = spyOnProperty( this.\$instance, field, 'get' );`,
        `${tab}return this.\$spies[field];`,
        `}`,
        `public \$createSetterFor( field: string ): jasmine.Spy {`,
        `${tab}this.\$spies[field] = spyOnProperty( this.\$instance, field, 'set' );`,
        `${tab}return this.\$spies[field];`,
        `}`,
        `public \$createSpyFor( field: string ): jasmine.Spy {`,
        `${tab}this.\$spies[field] = spyOn( this.\$instance, field );`,
        `${tab}return this.\$spies[field];`,
        `}`,
        `public \$getSpyFor( field: string ): jasmine.Spy {`,
        `${tab}return this.\$spies[field];`,
        `}`,
    ];
}

function createMethod(sourceProperty: MethodDeclaration): string[] {
    const lines = [''];
    const propertyName = sourceProperty.getName();
    lines.push(
        `/**`,
        ` * ${propertyName}`,
        ` */`,
    );
    if (sourceProperty.getStaticKeyword()) {
        if (sourceProperty.getScope() === Scope.Protected || sourceProperty.getScope() === Scope.Private) {
            lines.push(
                `public static \$call${upperCamelCase(propertyName)}( ...args: any[]) {`,
                `${tab}return this.$call( '${propertyName}', ...args );`,
                `}`,
            );
        }
        lines.push(
            `public static \$createSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$createSpyFor( '${propertyName}' );`,
            `}`,
            `public static \$getSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$getSpyFor( '${propertyName}' );`,
            `}`,
        );
    } else {
        if (sourceProperty.getAbstractKeyword()) {
            lines.push(
                `public ${propertyName}( ...args: any[]) {`,
                `${tab}return undefined as any;`,
                `}`,
            );
        } else if (sourceProperty instanceof MethodDeclaration && sourceProperty.getScope() === Scope.Protected ) {
            lines.push(
                `public ${propertyName}( ...args: any[]) {`,
                `${tab}return this.$call( '${propertyName}', ...args );`,
                `}`,
            );
        } else if (sourceProperty instanceof MethodDeclaration && sourceProperty.getScope() === Scope.Private ) {
            lines.push(
                `public \$call${upperCamelCase(propertyName)}( ...args: any[]) {`,
                `${tab}return this.$call( '${propertyName}', ...args );`,
                `}`,
            );
        }
        lines.push(
            `public \$createSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$createSpyFor( '${propertyName}' );`,
            `}`,
            `public \$getSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$getSpyFor( '${propertyName}' );`,
            `}`,
        );
    }
    return lines;
}

function createGetter(sourceProperty: GetAccessorDeclaration): string[] {
    const lines = [''];
    const propertyName = sourceProperty.getName();
    lines.push(
        `/**`,
        ` * ${propertyName}`,
        ` */`,
    );
    if (sourceProperty.getStaticKeyword()) {
        if (sourceProperty.getScope() === Scope.Private || sourceProperty.getScope() === Scope.Protected) {
            lines.push(
                `public static \$get${upperCamelCase(propertyName)}() {`,
                `${tab}return this.$get( '${propertyName}' );`,
                `}`,
            );
        }
        lines.push(
            `public static \$createGetterFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$createGetterFor( '${propertyName}' );`,
            `}`,
            `public static \$getSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$getSpyFor( '${propertyName}' );`,
            `}`,
        );
    } else {
        if (sourceProperty.getAbstractKeyword()) {
            lines.push(
                `public get ${propertyName}(): any {`,
                `${tab}return undefined as any;`,
                `}`,
            );
        } else if (sourceProperty.getScope() === Scope.Private || sourceProperty.getScope() === Scope.Protected) {
            lines.push(
                `public \$get${upperCamelCase(propertyName)}() {`,
                `${tab}return this.$get( '${propertyName}' );`,
                `}`,
            );
        }
        lines.push(
            `public \$createGetterFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$createGetterFor( '${propertyName}' );`,
            `}`,
            `public \$getSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$getSpyFor( '${propertyName}' );`,
            `}`,
        );
    }
    return lines;
}

function createSetter(sourceProperty: SetAccessorDeclaration): string[] {
    const lines = [''];
    const propertyName = sourceProperty.getName();
    lines.push(
        `/**`,
        ` * ${propertyName}`,
        ` */`,
    );
    if (sourceProperty.getStaticKeyword()) {
        lines.push(
            `public static \$createSetterFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$createSetterFor( '${propertyName}' );`,
            `}`,
            `public static \$getSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$getSpyFor( '${propertyName}' );`,
            `}`,
        );
    } else {
        if (sourceProperty.getAbstractKeyword()) {
            lines.push(
                `public set ${propertyName}( val: any ) {`,
                `}`,
            );
        } else if (sourceProperty.getScope() === Scope.Private || sourceProperty.getScope() === Scope.Protected) {
            lines.push(
                `public \$set${upperCamelCase(propertyName)}( val: any ) {`,
                `${tab}this.$set( '${propertyName}', val );`,
                `}`,
            );
        }
        lines.push(
            `public \$createSetterFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$createSetterFor( '${propertyName}' );`,
            `}`,
            `public \$getSpyFor${upperCamelCase(propertyName)}() {`,
            `${tab}return this.\$getSpyFor( '${propertyName}' );`,
            `}`,
        );
    }
    return lines;
}

function createProperty(sourceProperty: PropertyDeclaration): string[] {
    const lines = [''];
    const propertyName = sourceProperty.getName();
    if (!propertyName) {
        return [];
    }
    lines.push(
        `/**`,
        ` * ${propertyName}`,
        ` */`,
    );
    if (sourceProperty.getStaticKeyword()) {
        if (sourceProperty.getScope() === Scope.Protected) {
            lines.push(`public static ${propertyName}: any;`);
        } else if (sourceProperty.getScope() === Scope.Private) {
            lines.push(
                `public static \$get${upperCamelCase(propertyName)}() {`,
                `${tab}return this.$get( '${propertyName}' );`,
                `}`,
                `public static \$set${upperCamelCase(propertyName)}( val: any ) {`,
                `${tab}this.$set( '${propertyName}', val );`,
                `}`,
            );
        }
    } else {
        if (sourceProperty.getAbstractKeyword()) {
            lines.push(`public ${propertyName}: any;`);
        } else if (sourceProperty.getScope() === Scope.Protected) {
            lines.push(`public ${propertyName}: any;`);
        } else if (sourceProperty.getScope() === Scope.Private) {
            lines.push(
                `public \$get${upperCamelCase(propertyName)}() {`,
                `${tab}return this.$get( '${propertyName}' );`,
                `}`,
                `public \$set${upperCamelCase(propertyName)}( val: any ) {`,
                `${tab}this.$set( '${propertyName}', val );`,
                `}`,
            );
        }
    }
    return lines;
}

function createParameter(sourceProperty: ParameterDeclaration): string[] {
    const lines = [''];
    const propertyName = sourceProperty.getName();
    if (!propertyName) {
        return [];
    }
    lines.push(
        `/**`,
        ` * ${propertyName}`,
        ` */`,
    );
    if (sourceProperty.getScope() === Scope.Protected) {
        lines.push(`public ${propertyName}: any;`);
    } else if (sourceProperty.getScope() === Scope.Private) {
        lines.push(
            `public \$get${upperCamelCase(propertyName)}() {`,
            `${tab}return this.$get( '${propertyName}' );`,
            `}`,
            `public \$set${upperCamelCase(propertyName)}( val: any ) {`,
            `${tab}return this.$set( '${propertyName}', val );`,
            `}`,
        );
    }
    return lines;
}

/**
 * ts-simple-ast sourceClass.getAllMembers() does not return abstract methods.
 * Github Issue: https://github.com/dsherret/ts-simple-ast/issues/102
 */
function getAbstractMethods(sourceClass: ClassDeclaration): MethodDeclaration[] {
    const list: any = sourceClass.getChildSyntaxList();
    return list
        .getChildren()
        .filter((node: any) => node.getKindName() === 'MethodDeclaration' && node.getAbstractKeyword());
}

function getParentClass(sourceClass: ClassDeclaration): ClassDeclaration | null {
    const ext = sourceClass.getExtends();
    if (!ext) {
        return null;
    }
    const parentName = ext.getText().split('<')[0];
    const parentPath = ext
        .getSourceFile()
        .getImports()
        .filter(imp => imp.getNamedImports().filter(named => named.getText() === parentName))[0]
        .getModuleSpecifier();
    const sourceFileDir = path.dirname(sourceClass.getSourceFile().getFilePath());
    const resolvedPath = path.resolve(sourceFileDir, parentPath + '.ts');
    const parentFile = ast.getSourceFile(resolvedPath);
    if (!parentFile) {
        return null;
    }
    const parentClass = parentFile.getClasses().filter(c => c.getName() === parentName)[0];
    return parentClass;
}

function getInheritedMembers(sourceClass: ClassDeclaration) {
    const parent = getParentClass(sourceClass);
    if (!parent) {
        return [];
    }
    return parent.getAllMembers();
}

function getRespectiveMockClass(sourceClass: ClassDeclaration): ClassDeclaration | null {
    const sourceFilePath = sourceClass.getSourceFile().getFilePath();
    const mockFilePath = sourceFilePath.replace( srcDir, outDir ).replace(/\.ts$/, mockClassFilenameSuffix);
    const ast = new AST();
    ast.addSourceFiles(mockFilePath);
    const mockFile = ast.getSourceFile(mockFilePath);
    if (!mockFile) {
        return null;
    }
    const mockClass = mockFile.getClasses().filter(c => c.getName() ===  'Mock'+sourceClass.getName())[0];
    return mockClass;
}

function getCustomCode(sourceClass: ClassDeclaration) {
    const mockClass = getRespectiveMockClass( sourceClass );
    if (!mockClass) {
        return [];
    }
    let mockClassContent = mockClass.getText().split('\n');
    mockClassContent.splice(0, 1);
    mockClassContent.pop();
    let markerIndex;
    for (var index = mockClassContent.length; index > -1; index--) {
        const line = mockClassContent[index];
        if (line && line.search( /(\/\/ mockgen:custom)/g ) > -1) {
            markerIndex = index;
            break;
        }
    }
    if (markerIndex) {
        return mockClassContent.slice(markerIndex, mockClassContent.length);
    }
    return [];
}

function createMembers(sourceClass: ClassDeclaration): string[] {
    const addedMembers: any = {};
    return sourceClass.getAllMembers()
        .concat(getAbstractMethods( sourceClass ))
        .concat(getInheritedMembers( sourceClass ))
        .map(sourceProperty => {
            const name = (sourceProperty as any).getName && (sourceProperty as any).getName();
            if (addedMembers[name]) {
                return [];
            } else {
                addedMembers[name] = true;
            }
            if (sourceProperty instanceof MethodDeclaration) {
                return createMethod(sourceProperty);
            } else if (sourceProperty instanceof PropertyDeclaration) {
                return createProperty(sourceProperty);
            } else if (sourceProperty instanceof GetAccessorDeclaration) {
                return createGetter(sourceProperty);
            } else if (sourceProperty instanceof SetAccessorDeclaration) {
                return createSetter(sourceProperty);
            } else if (sourceProperty instanceof ParameterDeclaration) {
                return createParameter(sourceProperty);
            } else {
                return [];
            }
        })
        .reduce((acc: string[], next: string[]) => {
            return acc.concat(next);
        }, []);
}


