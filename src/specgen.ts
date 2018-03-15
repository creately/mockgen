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
    Node,
    ts,
    Expression,
    ExpressionStatement,
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
    // if( existsSync( outputPath )){
    //     console.info( outputPath, 'already exist. Skipping.' );
    //     return;
    // }
    const outputDirname = path.dirname(outputPath);
    const relativePath = path.relative(outputDirname, sourcePath).replace( /\\/g, '/' );
    // console.log( 'inspecting sourceFile', sourceFile.getFilePath() );

    sourceClasses.forEach( sourceClass => {
        processExistingSpecFile( sourceClass )
    });
/**
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
/**/
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

function createDescribeBlock(classMemberName: string, body: string[] = ['']): string[] {
    const lines = [''];
    lines.push(
        `describe( '${classMemberName}', () => {`,
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
                lines.push( ...createDescribeBlock( classMember.getName() ));
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

function getExpressionNodes( nodes: Node<ts.Node>[]): ExpressionStatement[]  {
    return nodes.filter( node => node instanceof ExpressionStatement ) as ExpressionStatement[];
}

function getExpressionIdentifierName( expression: Expression ): string {
    if ( !expression ) {
        return '';
    }
    const identifierNode = expression.getChildren()[0];
    return identifierNode.compilerNode.getText();
}

function isDescribeExpression( expression: Expression ) {
    return getExpressionIdentifierName( expression ) === 'describe';
}

function getArgumentsFromExpression( expression: Expression ) {
    return expression.getChildCount()
}

function processExistingSpecFile( sourceClass: ClassDeclaration ) {
    let specFile: SourceFile | undefined = getRespectiveSpecFile( sourceClass );
    const sourceClassName: string = sourceClass.getName();
    if (specFile) {
        // tslint:disable-next-line:no-console
        console.log( 'specfile', specFile.getFilePath() );
        const specFileStructure: {[className: string]: string[]} = {};
        const classLevelSyntaxList = specFile.getChildSyntaxList();
        if (classLevelSyntaxList) {
            classLevelSyntaxList.addChildText( createDescribeBlock('newtest').join('\n') )
            const children = classLevelSyntaxList.getChildren();
            const expressions: ExpressionStatement[] = getExpressionNodes( children );
            expressions.forEach( expressionStatement => {
                const expression = expressionStatement.getExpression();
                if ( isDescribeExpression( expression ) ) {
                    const classChildren = expression.getChildren();
                    // tslint:disable-next-line:no-console
                    console.log( 'classChildren', classChildren );
                    
                }
            });
            // tslint:disable-next-line:no-console
            // console.log( expr.getChildren() );
            

        }
        // specFile.saveSync();
    } else {
        // specFile = new SourceFile();
        
    }
}

function getSpecOutlineFromSourceClass( sourceClass: ClassDeclaration ) {
    const classMemberNames: string[] = [];
    const classMembers = sourceClass.getMembers();
    classMembers.forEach( classMember => {

        if ( classMember instanceof MethodDeclaration 
            || classMember instanceof GetAccessorDeclaration
            || classMember instanceof SetAccessorDeclaration )
        {
            if ( classMember.getScope() === Scope.Protected
                || classMember.getScope() === Scope.Public 
            ) {
                classMemberNames.push( classMember.getName());
            }        
        } 
    });
    const classSpecOutline: ClassSpecOutline = {
        className: sourceClass.getName(),
        classMembers: classMemberNames
    }
    return classSpecOutline;
}

interface ClassSpecOutline {
    className: string;
    classMembers: string[];
}