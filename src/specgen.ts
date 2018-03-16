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
    SyntaxList,
    SyntaxKind,
    ArrowFunction,
    Statement,
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
ast.getSourceFiles().forEach( sourceFile => {
    const sourceClasses = sourceFile.getClasses();
    if (!sourceClasses.length) return;
    const sourcePath = sourceFile.getFilePath();
    const outputPath = getRespectiveSpecFilePath( sourceFile );
    if( existsSync( outputPath )){
        processExistingSpecFile( sourceFile );
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
            return [ ...createSpecOutline( getSpecOutlineFromSourceClass( sourceClass ))];
        })
        .reduce(( acc: string[], next: string[] ) => {
            return acc.concat(next);
        }, []);

    const outputSpec = [
        ...specImports,
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

function createDescribeBlock(classMemberName: string, body: string[] = ['']): string[] {
    const lines = [''];
    lines.push(
        `describe( '${classMemberName}', () => {`,
        ...prefix( tab, body ),
        `});`
    );
    return lines;
}

function createSpecOutline( classSpecOutline: IClassSpecOutline ): string[] {
    const body: string[] = [];
    classSpecOutline.members.forEach( classMemberName => {
        body.push( ...createDescribeBlock( classMemberName )); 
    });
    return createDescribeBlock( classSpecOutline.className, body );
}

function getRespectiveSpecFilePath(sourceFile: SourceFile) {
    const sourceFilePath = sourceFile.getFilePath();
    const specFilePath = sourceFilePath.replace( srcDir, outDir ).replace(/\.ts$/, specFilenameSuffix);
    return specFilePath;
}

function    getRespectiveSpecFile(sourceFile: SourceFile): SourceFile | undefined {
    const specFilePath = getRespectiveSpecFilePath( sourceFile );
    const ast = new Project();
    ast.addSourceFileIfExists(specFilePath);
    return ast.getSourceFile(specFilePath);
}

function getExpressionNodes( nodes: Node<ts.Node>[]): ExpressionStatement[]  {
    return nodes.filter( node => node.getKind() == SyntaxKind.ExpressionStatement ) as ExpressionStatement[];
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
    const expressionArgsSyntaxList: SyntaxList = expression.getChildren()[2] as SyntaxList;
    const expressionArgs = expressionArgsSyntaxList.getChildren();
    return expressionArgs.filter( argument => argument.getKind() != SyntaxKind.CommaToken );
}

function filterDescribeStatements( statements: Statement[]): ExpressionStatement[]{
    return statements.filter( statement => 
        ( statement.getKind() == SyntaxKind.ExpressionStatement ) 
            && isDescribeExpression((statement as ExpressionStatement).getExpression())
    ) as ExpressionStatement[];
}

function getSpecFileStructure( classLevelDescibeStatements: ExpressionStatement[] ){
    const specFileStructure: {[className: string]: { members: string[], syntaxlist: SyntaxList|undefined}} = {};
    classLevelDescibeStatements.forEach( expressionStatement => {
        const expressionArgs = getArgumentsFromExpression( expressionStatement.getExpression() );
        const className = expressionArgs[0].getText();// First arg is the class name
        const testFn = expressionArgs[1] as ArrowFunction;// 2nd arg is the specification fn
        const memberStatements = filterDescribeStatements(testFn.getStatements());
        const classMemberNames: string[] = memberStatements.map( statement => {
            const memberArguments = getArgumentsFromExpression( statement.getExpression());
            const memberName = memberArguments[0].getText();
            return memberName;
        });
        specFileStructure[ className ] = {
            members: classMemberNames,
            syntaxlist: expressionStatement.getChildSyntaxList()
        }
    });
    return specFileStructure;
}

function processExistingSpecFile( sourceFile: SourceFile ) {
    let specFile = getRespectiveSpecFile( sourceFile );
    if ( specFile ) {
        const expectedSpecFileStructure: IClassSpecOutline[] = [];
        sourceFile.getClasses().forEach( sourceClass => {
            const specOutline = getSpecOutlineFromSourceClass( sourceClass );
            expectedSpecFileStructure.push( specOutline) ;
        });

        const classLevelDescibeStatements: ExpressionStatement[] = filterDescribeStatements( specFile.getStatements());
        const specFileStructure = getSpecFileStructure( classLevelDescibeStatements );

        expectedSpecFileStructure.forEach( classSpecOutline => {
            const specClassBlock = specFileStructure[ classSpecOutline.className ];
            if ( specClassBlock ) {
                classSpecOutline.members.forEach( member => {
                    if( specClassBlock.members.indexOf( member ) == -1 ){
                        specClassBlock.syntaxlist && specClassBlock.syntaxlist.addChildText( 
                            createDescribeBlock( member ).join('\n')
                        );
                    }
                });
            } else {
                const classLevelSyntaxList = specFile && specFile.getChildSyntaxList();
                if ( classLevelSyntaxList ) {
                    const child = createSpecOutline( classSpecOutline ).join('\n');
                    classLevelSyntaxList.addChildText( child );
                } else {
                    console.error( 'Error: This should not happen, syntax tree missing' );
                }
            }
        });
        specFile.saveSync();
        console.info( specFile.getFilePath());
    }
}

function getSpecOutlineFromSourceClass( sourceClass: ClassDeclaration ): IClassSpecOutline {
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
    const classSpecOutline: IClassSpecOutline = {
        className: sourceClass.getName(),
        members: classMemberNames
    }
    return classSpecOutline;
}

interface IClassSpecOutline {
    className: string;
    members: string[];
}