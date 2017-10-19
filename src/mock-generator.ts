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
import { 
    IClassMember, 
    IGetAccessorInfo, 
    ISetAccessorInfo, 
    IMethodInfo,
    IParameter,
    IPropertyInfo,
    IParameterPropertyInfo
} from './types/member-types';
import { ClassGenerator } from './class-generator';
import { MemberKind, Scope } from './types/member-properties';
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
            mockClass.members = (classMembers) as IClassMember[];
            mockClass.typeParameters = sourceClass.getTypeParameters().map( typeParams => typeParams.getName());
    
            return this.mockGenerator.createClass( mockClass );
    }

    createParameters( params: ParameterDeclaration[] ) : IParameter[] {
        return params.map( param => ({ paramName: param.getName(), paramType: param.getType().getText() }));
    }
    
    private createClassMembers(sourceClass: ClassDeclaration): (IClassMember | undefined )[] {
        return sourceClass.getAllMembers()
            .map(sourceProperty => {
                if (sourceProperty instanceof MethodDeclaration) {
                    const method: IMethodInfo = {
                        name: sourceProperty.getName(),
                        scope: sourceProperty.getScope(),
                        isStatic: !!sourceProperty.getStaticKeyword(),
                        isAbstract: !!sourceProperty.getAbstractKeyword(),
                        kindName: MemberKind.Method,
                        params: this.createParameters( sourceProperty.getParameters()),
                        returnType: sourceProperty.getReturnType().getText()
                    };
                    return method;
                } else if (sourceProperty instanceof PropertyDeclaration ) {
                    const prop: IPropertyInfo = {
                        name: sourceProperty.getName(),
                        scope: sourceProperty.getScope(),
                        isStatic: !!sourceProperty.getStaticKeyword(),
                        isAbstract: !!sourceProperty.getAbstractKeyword(),
                        kindName: MemberKind.Property,
                        type: sourceProperty.getType().getText() || 'any'
                    };
                    return prop;
                } else if (sourceProperty instanceof GetAccessorDeclaration ) {
                    const getter: IGetAccessorInfo = {
                        name: sourceProperty.getName(),
                        scope: sourceProperty.getScope(),
                        isStatic: !!sourceProperty.getStaticKeyword(),
                        isAbstract: !!sourceProperty.getAbstractKeyword(),
                        kindName: MemberKind.Getter,
                        returnType: sourceProperty.getReturnType().getText() || 'any'
                    };
                    return getter;
                } else if (sourceProperty instanceof SetAccessorDeclaration) {
                    const setter: ISetAccessorInfo = {
                        name: sourceProperty.getName(),
                        scope: sourceProperty.getScope(),
                        isStatic: !!sourceProperty.getStaticKeyword(),
                        isAbstract: !!sourceProperty.getAbstractKeyword(),
                        kindName: MemberKind.Setter,
                        returnType: sourceProperty.getReturnType().getText() || 'any',
                        params: this.createParameters( sourceProperty.getParameters())
                    };
                    return setter;
                } else if (sourceProperty instanceof ParameterDeclaration) {
                    const paramDeclaration: IParameterPropertyInfo = {
                        name: sourceProperty.getName(),
                        scope: sourceProperty.getScope(),
                        kindName: MemberKind.ParameterProperty,
                        type: sourceProperty.getType().getText() || 'any',
                        isStatic: false,
                        isAbstract: false
                    };
                    return paramDeclaration;
                } 
                return undefined;
            }).filter( m => m != undefined );
    }
    
}