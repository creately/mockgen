import { MemberKind, Scope } from './member-properties';

/**
 * This Interface defines all properties of members of a class.
 * @author Mehdhi
 * @since 10/18/2017
 */
export interface IClassMember {
    name: string | undefined;
    scope: Scope | undefined;
    isStatic: boolean;
    isAbstract: boolean;
    kindName: MemberKind;
}

export interface IMethodInfo extends IClassMember {

    /**
     * This hold all the parameter of the method
     * @private
     * @type Array <MethodParameter>
     */
    params: IParameter[];

    returnType: string;
}

export interface IPropertyInfo extends IClassMember {
    type : string;
}

export interface IParameterPropertyInfo extends IPropertyInfo {
    
}

export interface IGetAccessorInfo extends IMethodInfo {

}

export interface ISetAccessorInfo extends IMethodInfo {

}

export interface IParameter {
    paramName: string;
    paramType: string;
}



