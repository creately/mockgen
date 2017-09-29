import { ClassMember } from './class-member';
import { MemberKind, Scope, IParameter } from './member-properties';

export class MethodInfo extends ClassMember {

    constructor( 
        name: string, 
        scope: Scope, 
        isStatic: boolean = false, 
        isAbstract: boolean = false 
    ) {
        super( name, scope, isStatic, isAbstract );
        this._kindName = MemberKind.Method;
    }

    /**
     * This hold all the parameter of the method
     * @private
     * @type Array <MethodParameter>
     * @memberof MethodInfo
     */
    private _params: IParameter[];

    protected _returnType: string = 'void';

    public get returnType() : string {
        return this._returnType;
    }
    
    public set returnType( v: string ) {
        this._returnType = v;
    }
    
    public get params() : IParameter[] {
        return this._params;
    }
    
    public set params(v : IParameter[]) {
        this._params = v;
    }
    

}