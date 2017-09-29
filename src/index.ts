#!/usr/bin/env node

import * as path from 'path';
import { statSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import AST from 'ts-simple-ast';
import { SourceFile } from 'ts-simple-ast';

import { Generator } from './function-generator';

import { 
    REGEX_MARKER_CUSTOM_CODE_BEGIN,
    REGEX_MARKER_CUSTOM_CODE_END
} from './constants';

const ast = new AST();
const tab = '    ';
const mockClassFilenameSuffix = '.mock.ts';

const mockGenerator = new Generator();

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

    const mockedImports = sourceClasses
        .map(sourceClass => {
            return `import { ${sourceClass.getName()} } from '${relativePath.replace(/\.ts$/, '')}';`
        });

    const mockedClasses = sourceClasses
        .map(sourceClass => {
            return [
                ...mockGenerator.createClassHeader( sourceClass.getName(), sourceClass.getTypeParameters().map( typePram => typePram.getName()) ),
                ...prefix(tab, mockGenerator.createHelpers( sourceClass.getName() )),
                ...prefix(tab, mockGenerator.createMembers( sourceClass )),
                ...mockGenerator.createCustomCodeMarker( 'Mock'+sourceClass.getName(), allUserWrittenCodes ),
                ...mockGenerator.createClassFooter(),
            ];
        })
        .reduce((acc: string[], next: string[]) => {
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
        statSync(outputDirname);
    } catch (err) {
        mkdirSync(outputDirname);
    }

    writeFileSync(outputPath, mockedSource);

});

function upperCamelCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}

function prefix(str: string, lines: string[]): string[] {
    return lines.map(line => line !== '' ? str + line : '');
}

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