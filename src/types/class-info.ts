import { ClassMember } from './class-member';

export class ClassInfo {
    
    constructor( 
        private _parentClassName: string,
        private _classPath: string,
        private _parentClassPath: string
    ){}

    private _members: ClassMember[];
    private _typeParameters: string[];
    private _userWrittenCodes: string | undefined;
    
    public get members() {
        return this._members;
    }
    
    public set members( v: ClassMember[]) {
        this._members = v;
    }
    
    public get name() {
        return 'Mock' + this._parentClassName;
    }

    public get classPath() {
        return this._classPath;
    }
    
    public get typeParameters() {
        return this._typeParameters;
    }

    public set typeParameters( v: string[]) {
        this._typeParameters = v;
    }
    
    public get userWrittenCodes() {
        return this._userWrittenCodes;
    }
    
    public set userWrittenCodes( v: string | undefined) {
        this._userWrittenCodes = v;
    }
    
    public get parentClassName() {
        return this._parentClassName;
    }

    public get parentClassPath() {
        return this._parentClassPath;
    }
    
}