import type {LanguageDefinition, Token} from './types';

export function tokenize(code: string, language: LanguageDefinition): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let col = 0;

    while (col < line.length) {
      let matched = false;

      // Try each token rule
      for (const rule of language.tokenRules) {
        const remaining = line.substring(col);
        const match = remaining.match(rule.pattern);

        if (match && match.index === 0) {
          const value = match[0];
          tokens.push({
            type: rule.type,
            value,
            start: {line: lineIdx, column: col},
            end: {line: lineIdx, column: col + value.length},
          });
          col += value.length;
          matched = true;
          break;
        }
      }

      // If no rule matched, treat as text
      if (!matched) {
        const char = line[col];
        tokens.push({
          type: 'text',
          value: char,
          start: {line: lineIdx, column: col},
          end: {line: lineIdx, column: col + 1},
        });
        col++;
      }
    }
  }

  return tokens;
}
