import { ClassMember } from './class-member';

export class ClassInfo {
    // isAbstract();

    private _imports: { [key: string]: string }[];
    private _members: ClassMember[];
    private _name: string;
    private _typeParameters: string[];
    private _userWrittenCodes: string;
    private _parentClassName: string;
    private _parentClassPath: string;
    private _classPath: string;
    
    public get imports() : { [key: string]: string }[] {
        return this._imports;
    }
    
    public get members() {
        return this._members;
    }
    
    public get name() {
        return this._name;
    }
    
    public get typeParameters() {
        return this._typeParameters;
    }
    
    public get userWrittenCodes() {
        return this._userWrittenCodes;
    }
    
}