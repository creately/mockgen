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
