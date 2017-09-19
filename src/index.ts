#!/usr/bin/env node

import * as path from 'path';
import { statSync, mkdirSync, writeFileSync } from 'fs';
import AST from 'ts-simple-ast';
import {
    SourceFile,
    ClassDeclaration,
    MethodDeclaration,
    Scope,
    PropertyDeclaration,
    GetAccessorDeclaration,
    SetAccessorDeclaration,
    ParameterDeclaration,
} from 'ts-simple-ast';

const ast = new AST();
const tab = '    ';

ast.addSourceFiles('./src/**/*.ts');
ast.getSourceFiles().forEach(sourceFile => {
    const sourceClasses = sourceFile.getClasses();

    if (!sourceClasses.length) {
        return;
    }

    const rootPath = process.cwd();
    const sourcePath = sourceFile.getFilePath();
    const outputPath = sourcePath.replace(rootPath + '/src', rootPath + '/test');
    const outputDirname = path.dirname(outputPath);
    const relativePath = path.relative(outputDirname, sourcePath);

    const mockedImports = sourceClasses
        .map(sourceClass => {
            return `import { ${sourceClass.getName()} } from '${relativePath.replace(/\.ts$/, '')}';`
        });

    const mockedClasses = sourceClasses
        .map(sourceClass => {
            return [
                ...createClassHeader(sourceClass),
                ...prefix(tab, createMembers(sourceClass)),
                ...createClassFooter(sourceClass),
            ];
        })
        .reduce((acc: string[], next: string[]) => {
            return acc.concat(next);
        }, []);

    const mockedSource = [
        ...mockedImports,
        '',
        ...mockedClasses,
        '',
    ].join('\n');

    try {
        statSync(outputDirname);
    } catch (err) {
        mkdirSync(outputDirname);
    }

    writeFileSync(outputPath.replace(/\.ts$/, '.mock.ts'), mockedSource);
});

function prefix(str: string, lines: string[]): string[] {
    return lines.map(line => str + line)
}

function upperCamelCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}

function createClassHeader(sourceClass: ClassDeclaration): string[] {
    const className = sourceClass.getName();
    return [`export class Mock${className} extends ${className} {`];
}

function createClassFooter(sourceClass: ClassDeclaration): string[] {
    return [`}`];
}

function createMembers(sourceClass: ClassDeclaration): string[] {
    const className = sourceClass.getName();
    const propMembers = sourceClass.getInstanceMembers()
        .map((sourceProperty: MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ParameterDeclaration) => {
            const propertyName = sourceProperty.getName();
            if (!propertyName) {
                return [];
            }
            if ((sourceProperty instanceof MethodDeclaration) &&
                (sourceProperty.getScope() === Scope.Private || sourceProperty.getScope() === Scope.Protected)) {
                return [
                    `public ${propertyName}( ...args: any[] ) {`,
                    `${tab}return (${className}.prototype as any).${propertyName}.call( this, ...args );`,
                    `}`,
                    `private \$spyFor${upperCamelCase(propertyName)}: jasmine.Spy;`,
                    `public \$createSpyFor${upperCamelCase(propertyName)}() {`,
                    `${tab}if ( !this.\$spyFor${upperCamelCase(propertyName)} ) {`,
                    `${tab}${tab}this.\$spyFor${upperCamelCase(propertyName)} = spyOn( this as any, '${propertyName}' );`,
                    `${tab}}`,
                    `${tab}return this.\$spyFor${upperCamelCase(propertyName)};`,
                    `}`,
                ];
            }
            if (sourceProperty instanceof MethodDeclaration) {
                return [
                    `private \$spyFor${upperCamelCase(propertyName)}: jasmine.Spy;`,
                    `public \$createSpyFor${upperCamelCase(propertyName)}() {`,
                    `${tab}if ( !this.\$spyFor${upperCamelCase(propertyName)} ) {`,
                    `${tab}${tab}this.\$spyFor${upperCamelCase(propertyName)} = spyOn( this as any, '${propertyName}' );`,
                    `${tab}}`,
                    `${tab}return this.\$spyFor${upperCamelCase(propertyName)};`,
                    `}`,
                ];
            }
            if ((sourceProperty instanceof PropertyDeclaration || sourceProperty instanceof GetAccessorDeclaration) &&
                (sourceProperty.getScope() === Scope.Private || sourceProperty.getScope() === Scope.Protected)) {
                return [
                    `public \$get${upperCamelCase(propertyName)}() {`,
                    `${tab}return ( this as any ).${propertyName};`,
                    `}`,
                    `public \$createGetterFor${upperCamelCase(propertyName)}() {`,
                    `${tab}return spyOnProperty( this as any, '${propertyName}', 'get' );`,
                    `}`,
                ];
            }
            if (sourceProperty instanceof PropertyDeclaration || sourceProperty instanceof GetAccessorDeclaration) {
                return [
                    `public \$createGetterFor${upperCamelCase(propertyName)}() {`,
                    `${tab}return spyOnProperty( this as any, '${propertyName}', 'get' );`,
                    `}`,
                ];
            }
            if (sourceProperty instanceof SetAccessorDeclaration) {
                return [
                    `public \$createSetterFor${upperCamelCase(propertyName)}() {`,
                    `${tab}return spyOnProperty( this as any, '${propertyName}', 'set' );`,
                    `}`,
                ];
            }
            return [];
        });

        const constructorMembers = sourceClass.getConstructors()
            .map(sourceConstructor => {
                return sourceConstructor.getParameters().map(sourceParameter => {
                    const parameterName = sourceParameter.getName();
                    if (!parameterName) {
                        return [];
                    }
                    if (sourceParameter.getScope() === Scope.Private || sourceParameter.getScope() === Scope.Protected) {
                        return [
                            `public \$get${upperCamelCase(parameterName)}() {`,
                            `${tab}return ( this as any ).${parameterName};`,
                            `}`,
                            `public \$createGetterFor${upperCamelCase(parameterName)}() {`,
                            `${tab}return spyOnProperty( this as any, '${parameterName}', 'get' );`,
                            `}`,
                        ];
                    }
                    return [
                        `public \$createGetterFor${upperCamelCase(parameterName)}() {`,
                        `${tab}return spyOnProperty( this as any, '${parameterName}', 'get' );`,
                        `}`,
                    ];
                });
            })
            .reduce((acc: string[][], next: string[][]) => {
                return acc.concat(next);
            }, []);

        return [...propMembers, ...constructorMembers]
            .reduce((acc: string[], next: string[]) => {
                return acc.concat(next);
            }, []);
}
