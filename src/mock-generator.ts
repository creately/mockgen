import * as path from 'path';
import { statSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import AST from 'ts-simple-ast';

import {
    SourceFile,
    ClassDeclaration,
    MethodDeclaration,
    PropertyDeclaration,
    GetAccessorDeclaration,
    SetAccessorDeclaration,
    ParameterDeclaration,
} from 'ts-simple-ast';

import { ClassInfo } from './types/class-info';
import { GetAccessorInfo, SetAccessorInfo } from './types/accessor-info';
import { PropertyInfo, ParameterPropertyInfo } from './types/property-info';
import { MethodInfo } from './types/method-info';
import { ClassMember } from './types/class-member';
import { ClassGenerator } from './class-generator';
import { REGEX_MARKER_CUSTOM_CODE_BEGIN, REGEX_MARKER_CUSTOM_CODE_END, FILENAME_SUFFIX_MOCK_CLASS } from './constants';

export class MockGenerator {

    private ast: AST;
    private mockGenerator: ClassGenerator;

    constructor() {
        this.init();
    }
    
    private init() {
        this.mockGenerator = new ClassGenerator();
    }
    
    public generate( sourceFilePathPattern: string = './src/**/*.ts' ): void {
        
        this.ast = new AST();
        this.ast.addSourceFiles( sourceFilePathPattern );
        this.ast.getSourceFiles().forEach( sourceFile => {
            const sourceClasses = sourceFile.getClasses();
        
            if (!sourceClasses.length) {
                return;
            }
        
            const rootPath = process.cwd().replace( /\\/g, '/' );
            const sourcePath = sourceFile.getFilePath();
        
            const outputPath = sourcePath.replace(rootPath + '/src', rootPath + '/test').replace(/\.ts$/, FILENAME_SUFFIX_MOCK_CLASS);
            const outputDirname = path.dirname(outputPath);
            const relativePath = path.relative(outputDirname, sourcePath).replace( /\\/g, '/' );
        
            const allUserWrittenCodes = this.getUserWrittenCodeFromMockFile( outputPath );
        
            const mockedClasses = sourceClasses
                .map(sourceClass => {
                    let userWrittenCodes = allUserWrittenCodes ? allUserWrittenCodes[ 'Mock' + sourceClass.getName() ] : undefined;
                    return this.createMockClass( sourceClass, userWrittenCodes, outputPath, relativePath ); 
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
        
            this.writeToFile( outputDirname, outputPath, mockedSource );

        });
    }

    private writeToFile( outputDirname: string, outputPath: string, mockedSource: string ) {
        try {
            statSync(outputDirname);
        } catch (err) {
            mkdirSync(outputDirname);
        }
        writeFileSync(outputPath, mockedSource);
    }
    
    
    private getUserWrittenCodeFromMockFile( filepath: string ) {
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
    
    private createMockClass( sourceClass: ClassDeclaration, userWrittenCodes: string | undefined, 
        outputPath: string, parentClassPath: string ) {
            const classMembers = this.createClassMembers( sourceClass );
            const mockClass = new ClassInfo( sourceClass.getName(), outputPath, parentClassPath );
            mockClass.userWrittenCodes = userWrittenCodes;
            mockClass.members = (classMembers) as ClassMember[];
            mockClass.typeParameters = sourceClass.getTypeParameters().map( typeParams => typeParams.getName());
    
            return this.mockGenerator.createClass( mockClass );
    }
    
    private createClassMembers(sourceClass: ClassDeclaration): (ClassMember | undefined )[] {
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
    
}