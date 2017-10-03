import { ClassInfo } from './types/class-info';
import { FunctionGenerator } from './function-generator';
import { TAB } from './constants';

/**
 * This class creates a string equivalent for {ClassInfo}
 * @author Mehdhi
 * @class ClassGenerator
 */
export class ClassGenerator {

    private mockFunctionGenerator: FunctionGenerator;
    
    constructor() {
        this.mockFunctionGenerator = new FunctionGenerator();
    }

    private prefix(str: string, lines: string[]): string[] {
        return lines.map(line => line !== '' ? str + line : '');
    }

    public createClass( sourceClass: ClassInfo ){
        return [
            ...this.createImport( sourceClass.parentClassName, sourceClass.parentClassPath ),
            ...this.mockFunctionGenerator.createClassHeader( sourceClass.parentClassName, sourceClass.typeParameters ),
            ...this.prefix(TAB, this.mockFunctionGenerator.createHelpers( sourceClass.name )),
            ...this.prefix(TAB, this.mockFunctionGenerator.createMembers( sourceClass.members )),
            ...this.mockFunctionGenerator.createCustomCodeMarker( sourceClass.userWrittenCodes ),
            ...this.mockFunctionGenerator.createClassFooter(),
        ];
    }

    private createImport( importClassName: string | undefined, importPath: string | undefined ) {
        if (importClassName && importPath) {
            return [`import { ${importClassName} } from '${importPath.replace(/\.ts$/, '')}';`, '']
        }
        return [];
    }
}