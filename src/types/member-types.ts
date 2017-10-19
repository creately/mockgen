import { MemberKind, Scope } from './member-properties';

/**
 * This Interface defines all properties of members of a class.
 * @author Mehdhi
 * @since 10/18/2017
 */
export interface IClassMember {
    
    /**
     * States whether the member is static
     * @type {boolean}
     * @memberof IClassMember
     */
    isStatic: boolean;

    /**
     * States whether the member is abstract
     * @type {boolean}
     * @memberof IClassMember
     */
    isAbstract: boolean;

    /**
     * Name of the member
     * @type {(string | undefined)}
     * @memberof IClassMember
     */
    name: string | undefined;
    
    /**
     * Scope of the member
     * @type {(Scope | undefined)}
     * @memberof IClassMember
     */
    scope: Scope | undefined;

    /**
     * This defines the type of member e.g. Method, a property
     * @type {MemberKind}
     * @memberof IClassMember
     */
    kindName: MemberKind;

}

export interface IGetAccessorInfo extends IClassMember {
    
    /**
     * This is the return type of the method
     * @type String
     * @memberof IGetAccessorInfo
     */
    returnType: string;

}

export interface IMethodInfo extends IGetAccessorInfo {

    /**
     * This hold all the parameters of the method
     * @type Array <MethodParameter>
     * @memberof IMethodInfo
     */
    params: IParameter[];  

}

export interface ISetAccessorInfo extends IMethodInfo {}

export interface IPropertyInfo extends IClassMember {
    /**
     * Type of the property
     * @type {string}
     * @memberof IPropertyInfo
     */
    type : string;
}

export interface IParameterPropertyInfo extends IPropertyInfo {}

export interface IParameter {
    
    /**
     * Identifier of parameter
     * @type {(string | undefined)}
     * @memberof IParameter
     */
    paramName: string | undefined;
    
    /**
     * Type of the parameter
     * @type {string}
     * @memberof IParameter
     */
    paramType: string;
}



