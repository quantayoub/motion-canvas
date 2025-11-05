import type {LanguageDefinition} from '../types';

export const pythonLanguage: LanguageDefinition = {
  name: 'Python',
  extensions: ['.py'],

  keywords: {
    control: [
      'if',
      'elif',
      'else',
      'for',
      'while',
      'break',
      'continue',
      'return',
      'yield',
      'pass',
      'raise',
      'try',
      'except',
      'finally',
      'with',
      'as',
    ],
    declaration: [
      'def',
      'class',
      'lambda',
      'async',
      'await',
      'import',
      'from',
      'global',
      'nonlocal',
    ],
    operator: ['and', 'or', 'not', 'in', 'is', 'del'],
    constant: ['None', 'True', 'False'],
    builtin: [
      'self',
      'cls',
      'print',
      'len',
      'range',
      'str',
      'int',
      'float',
      'bool',
      'list',
      'dict',
      'tuple',
      'set',
    ],
  },

  comments: {
    line: '#',
  },

  brackets: [
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
  ],

  multiLineRules: [
    {start: /"""/, end: /"""/, type: 'string'},
    {start: /'''/, end: /'''/, type: 'string'},
  ],

  tokenRules: [
    // Comments
    {pattern: /#.*/, type: 'comment'},

    // Decorators
    {pattern: /@[a-zA-Z_][a-zA-Z0-9_]*/, type: 'decorator'},

    // Strings
    {pattern: /"(?:[^"\\]|\\.)*"/, type: 'string'},
    {pattern: /'(?:[^'\\]|\\.)*'/, type: 'string'},

    // Numbers
    {pattern: /\b\d+\.?\d*\b/, type: 'number'},

    // Type annotations
    {
      pattern: /\b(?:Decimal|Order|Tuple|List|Dict|Set|Any|Optional|Union)\b/,
      type: 'type',
    },

    // Keywords
    {
      pattern:
        /\b(?:if|elif|else|for|while|break|continue|return|yield|pass|raise|try|except|finally|with|as)\b/,
      type: 'keyword',
    },
    {
      pattern:
        /\b(?:def|class|lambda|async|await|import|from|global|nonlocal)\b/,
      type: 'keyword',
    },
    {pattern: /\b(?:and|or|not|in|is|del)\b/, type: 'operator'},

    // Constants
    {pattern: /\b(?:None|True|False)\b/, type: 'constant'},

    // Built-ins
    {
      pattern:
        /\b(?:self|cls|print|len|range|str|int|float|bool|list|dict|tuple|set)\b/,
      type: 'builtin',
    },

    // Class names (capitalized)
    {pattern: /\b[A-Z][a-zA-Z0-9_]*\b/, type: 'class'},

    // Function calls
    {pattern: /\b[a-z_][a-zA-Z0-9_]*(?=\s*\()/, type: 'function'},

    // Operators
    {pattern: /[+\-*/%=<>!&|^~]+|->/, type: 'operator'},

    // Punctuation
    {pattern: /[()[\]{},.:;]/, type: 'punctuation'},

    // Identifiers (variables)
    {pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/, type: 'variable'},
  ],
};
