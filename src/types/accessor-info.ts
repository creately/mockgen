import { MemberKind, Scope, IParameter } from './member-properties';
import { MethodInfo } from './method-info';

export class GetAccessorInfo extends MethodInfo {
    constructor( 
        name: string, 
        scope: Scope,
        returnType: string = 'any',
        isStatic: boolean = false, 
        isAbstract: boolean = false 
    ) {
        super( name, scope, isStatic, isAbstract );
        this._returnType = returnType;
        this._kindName = MemberKind.Getter;
    }   
}

export class SetAccessorInfo extends MethodInfo {
    constructor( 
        name: string, 
        scope: Scope, 
        isStatic: boolean = false, 
        isAbstract: boolean = false 
    ) {
        super( name, scope, isStatic, isAbstract );
        this._kindName = MemberKind.Setter;
    }   
}

