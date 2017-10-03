#!/usr/bin/env node
import { ClassInfo } from './types/class-info';
import { GetAccessorInfo, SetAccessorInfo } from './types/accessor-info';
import { PropertyInfo, ParameterPropertyInfo } from './types/property-info';
import { MethodInfo } from './types/method-info';
import { ClassMember } from './types/class-member';

import * as path from 'path';
import { statSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import AST from 'ts-simple-ast';
import { SourceFile } from 'ts-simple-ast';

import { ClassGenerator } from './class-generator';

import { 
    REGEX_MARKER_CUSTOM_CODE_BEGIN,
    REGEX_MARKER_CUSTOM_CODE_END
} from './constants';

import {
    ClassDeclaration,
    MethodDeclaration,
    PropertyDeclaration,
    GetAccessorDeclaration,
    SetAccessorDeclaration,
    ParameterDeclaration,
} from 'ts-simple-ast';

const ast = new AST();
const tab = '    ';
const mockClassFilenameSuffix = '.mock.ts';

const mockGenerator = new ClassGenerator();

ast.addSourceFiles('./src/**/*.ts');
ast.getSourceFiles().forEach(sourceFile => {
    const sourceClasses = sourceFile.getClasses();

    if (!sourceClasses.length) {
        return;
    }

    const rootPath = process.cwd().replace( /\\/g, '/' );
    const sourcePath = sourceFile.getFilePath();

    const outputPath = sourcePath.replace(rootPath + '/src', rootPath + '/test').replace(/\.ts$/, mockClassFilenameSuffix);
    const outputDirname = path.dirname(outputPath);
    const relativePath = path.relative(outputDirname, sourcePath).replace( /\\/g, '/' );

    const allUserWrittenCodes = getUserWrittenCodeFromMockFile( outputPath );

    const mockedClasses = sourceClasses
        .map(sourceClass => {
            let userWrittenCodes = allUserWrittenCodes ? allUserWrittenCodes[ 'Mock' + sourceClass.getName() ] : undefined;
            return createMockClass( sourceClass, userWrittenCodes, outputPath, relativePath ); 
        })
        .reduce((acc: string[], next: string[]) => {
            return acc.concat(next);
        }, []);

    const mockedSource = [
        '// tslint:disable',
        '',
        ...mockedClasses,
        '',
    ].join('\n');

    try {
        statSync(outputDirname);
    } catch (err) {
        mkdirSync(outputDirname);
    }

    writeFileSync(outputPath, mockedSource);

});

function getUserWrittenCodeFromMockFile( filepath: string ) {
    if (!existsSync( filepath )) {
         return undefined;
    }
    
    let userMethods: { [className: string]: string } = {};
    let currentClass: string | undefined = undefined;
    let saveLine: boolean = false;
    let linesToSave: string[] = [];

    const fileBuffer = readFileSync( filepath, 'utf8' );
    if ( fileBuffer ) {
        fileBuffer.toString().split('\n').forEach( line => { 
            if ( line ) {
                if ( line.search( /(class[ ])[a-zA-Z ]+/g ) > -1 /*&& line.search( /[*\/]+/g ) == -1 */) {
                    const arr = line.match(/(class[ ])[a-zA-Z]+/g);
                    currentClass = arr ? arr[0].split(' ').pop() : undefined;
                }
                if ( currentClass ) {
                    if ( line && line.search( REGEX_MARKER_CUSTOM_CODE_END ) > -1 ) {
                        saveLine = false;
                        userMethods[ currentClass ] = linesToSave.join('\n');
                        linesToSave = [];
                        currentClass = '';
                    }
                    if (saveLine) {
                        linesToSave.push( line );
                    } 
                    if ( line && line.search( REGEX_MARKER_CUSTOM_CODE_BEGIN ) > -1 ) {
                        saveLine = true;
                    }
                } 
            }
        });
    }

    return userMethods;
}

function createMockClass( sourceClass: ClassDeclaration, userWrittenCodes: string | undefined, 
    outputPath: string, parentClassPath: string ) {
        const classMembers = createClassMembers( sourceClass );
        const mockClass = new ClassInfo( sourceClass.getName(), outputPath, parentClassPath );
        mockClass.userWrittenCodes = userWrittenCodes;
        mockClass.members = (classMembers) as ClassMember[];
        mockClass.typeParameters = sourceClass.getTypeParameters().map( typeParams => typeParams.getName());

        return mockGenerator.createClass( mockClass );
}

function createClassMembers(sourceClass: ClassDeclaration): (ClassMember | undefined )[] {
    return sourceClass.getAllMembers()
        .map(sourceProperty => {
            let property: ClassMember | undefined = undefined;
            if (sourceProperty instanceof MethodDeclaration) {
                property = new MethodInfo( 
                    sourceProperty.getName(),
                    sourceProperty.getScope(),
                    !!sourceProperty.getStaticKeyword(),
                    !!sourceProperty.getAbstractKeyword()
                );
            } else if (sourceProperty instanceof PropertyDeclaration ) {
                property = new PropertyInfo( 
                    sourceProperty.getName(),
                    sourceProperty.getScope(),
                    'any',
                    !!sourceProperty.getStaticKeyword(),
                    !!sourceProperty.getAbstractKeyword()
                );
            } else if (sourceProperty instanceof GetAccessorDeclaration ) {
                property = new GetAccessorInfo( 
                    sourceProperty.getName(),
                    sourceProperty.getScope(),
                    'any',
                    !!sourceProperty.getStaticKeyword(),
                    !!sourceProperty.getAbstractKeyword()
                );
            } else if (sourceProperty instanceof SetAccessorDeclaration) {
                property = new SetAccessorInfo( 
                    sourceProperty.getName(),
                    sourceProperty.getScope(),
                    !!sourceProperty.getStaticKeyword(),
                    !!sourceProperty.getAbstractKeyword()
                );
            } else if (sourceProperty instanceof ParameterDeclaration) {
                property = new ParameterPropertyInfo( 
                    sourceProperty.getName(),
                    sourceProperty.getScope()
                );
            } 
            return property;
        }).filter( m => m != undefined );
}