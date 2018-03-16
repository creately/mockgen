#!/usr/bin/env node

import * as path from 'path';
import { statSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import Project, {
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

const ast = new Project();
const tab = '    ';
const specFilenameSuffix = '.spec.ts';

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

ast.addExistingSourceFiles( providedSourcePaths );
ast.getSourceFiles().forEach(sourceFile => {

    const sourceClasses = sourceFile.getClasses();
    
    if (!sourceClasses.length) {
        return;
    }
    
    const sourcePath = sourceFile.getFilePath();
    const outputPath = getRespectiveSpecFilePath( sourceFile );
    if( existsSync( outputPath )){
        console.info( outputPath, 'already exist. Skipping.' );
        return;
    }
    const outputDirname = path.dirname(outputPath);
    const relativePath = path.relative(outputDirname, sourcePath).replace( /\\/g, '/' );

    const specImports = sourceClasses
        .map(sourceClass => {
            return `import { ${sourceClass.getName()} } from '${relativePath.replace(/\.ts$/, '')}';`
        });

    const generatedSpec = sourceClasses
        .map(sourceClass => {
            return [
                ...createSpecHeaderForClass(sourceClass),
                ...prefix( tab, createSpecOutline( sourceClass )),
                ...createSpecFooterForClass(sourceClass),
            ];
        })
        .reduce(( acc: string[], next: string[] ) => {
            return acc.concat(next);
        }, []);

    const outputSpec = [
        ...specImports,
        '',
        ...generatedSpec,
        '',
    ].join('\n');

    try {
        statSync( outputDirname );
    } catch ( err ) {
        mkdirp.sync( outputDirname );
    }

    writeFileSync( outputPath, outputSpec );
    console.info( outputPath );
});

function prefix(str: string, lines: string[]): string[] {
    return lines.map(line => line !== '' ? str + line : '');
}

function createSpecHeaderForClass(sourceClass: ClassDeclaration): string[] {
    const className = sourceClass.getName();
    return [`describe( '${className}', () => {`];
}

function createSpecFooterForClass(sourceClass: ClassDeclaration): string[] {
    return ['',`});`];
}

function createDescribeBlock(classMember: MethodDeclaration | GetAccessorDeclaration | SetAccessorDeclaration, body: string[] = ['']): string[] {
    const lines = [''];
    const memberName = classMember.getName();
    lines.push(
        `describe( '${memberName}', () => {`,
        ...prefix( tab, body ),
        `});`
    );
    return lines;
}

function createSpecOutline(sourceClass: ClassDeclaration): string[] {
    const lines: string[] = [];
    const classMembers = sourceClass.getMembers();
    classMembers.forEach( classMember => {

        if ( classMember instanceof MethodDeclaration 
            || classMember instanceof GetAccessorDeclaration
            || classMember instanceof SetAccessorDeclaration )
        {
            if ( classMember.getScope() === Scope.Protected
                || classMember.getScope() === Scope.Public 
            ) {
                lines.push( ...createDescribeBlock( classMember ));
            }        
        } 
    });
    return lines;
}

function getRespectiveSpecFilePath(sourceFile: SourceFile) {
    const sourceFilePath = sourceFile.getFilePath();
    const specFilePath = sourceFilePath.replace( srcDir, outDir ).replace(/\.ts$/, specFilenameSuffix);
    return specFilePath;
}

function getRespectiveSpecFile(sourceClass: ClassDeclaration): SourceFile | undefined {
    const specFilePath = getRespectiveSpecFilePath( sourceClass.getSourceFile() );
    const ast = new Project();
    ast.addSourceFileIfExists(specFilePath);
    return ast.getSourceFile(specFilePath);
}



