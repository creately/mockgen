export const MARKER_CUSTOM_CODE_BEGIN: string = '// ts-mockgen:custom-code-begin';
export const MARKER_CUSTOM_CODE_END: string = '// ts-mockgen:custom-code-end';

export const REGEX_MARKER_CUSTOM_CODE_BEGIN: RegExp = /(\/\/ ts-mockgen:custom-code-begin)/g;
export const REGEX_MARKER_CUSTOM_CODE_END: RegExp = /(\/\/ ts-mockgen:custom-code-end)/g;