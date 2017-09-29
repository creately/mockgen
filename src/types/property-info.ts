import { ClassMember } from './class-member';
import { MemberKind, Scope, IParameter } from './member-properties';

export class PropertyInfo extends ClassMember {
    constructor( 
        name: string | undefined, 
        scope: Scope | undefined, 
        private _type: string = 'any', 
        isStatic: boolean = false, 
        isAbstract: boolean = false 
    ) {
        super( name, scope, isStatic, isAbstract );
        this._kindName = MemberKind.Property;
    }

    public get type() : string {
        return this._type;
    }

}

export class ParameterPropertyInfo extends PropertyInfo {
    constructor( 
        name: string | undefined, 
        scope: Scope | undefined, 
        type: string = 'any'
    ) {
        super( name, scope, type, false, false );
        this._kindName = MemberKind.ParameterProperty;
    }
}