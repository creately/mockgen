export enum MemberKind {
    Method = 'MethodDeclaration',
    Property = 'PropertyDeclaration',
    Getter = 'GetAccessorDeclaration',
    Setter = 'SetAccessorDeclaration',
    ParameterProperty = 'ParameterDeclaration'
}

export enum Scope {
    Public = 'public',
    Protected = 'protected',
    Private = 'private',
}

export interface IParameter {
    paramName: string;
    paramType: string;
}