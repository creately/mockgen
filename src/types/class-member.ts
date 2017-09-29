import { MemberKind, Scope, IParameter } from './member-properties';

/**
 * This class defines all members of a class. Methods, properties,
 * getters, setters
 * @author Mehdhi
 * @since 9/29/2017
 * @class ClassMember
 */
export class ClassMember {

    constructor( 
        private _name: string | undefined,
        private _scope: Scope | undefined,
        private _isStatic: boolean = false,
        private _isAbstract: boolean = false,
    ){}
    
    protected _kindName: MemberKind;

    public get name() : string | undefined{
        return this._name;
    }
    
    public get scope() : Scope | undefined {
        return this._scope;
    }
    
    public get kindName() : MemberKind | undefined {
        return this._kindName;
    }
    
    public get isAbstract() : boolean {
        return this._isAbstract;
    }
    
    public get isStatic() : boolean {
        return this._isStatic;
    }

    /**
     * isProtected
     */
    public isProtected(): boolean {
        return this.scope == Scope.Protected;
    }

    public isPrivate(): boolean {
        return this.scope == Scope.Private;
    }

    public isPublic(): boolean {
        return this.scope == Scope.Public;
    }

    public isNotPublic(): boolean {
        return this.scope != Scope.Public;
    }
    
}
