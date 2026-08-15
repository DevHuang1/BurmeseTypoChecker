import re
from pathlib import Path
text = Path('/home/ubuntu/burmese-typo-checker/client/src/pages/Home.tsx').read_text()
tokens = list(re.finditer(r'</?div\b[^>]*>', text))
stack=[]
for token in tokens:
    if token.group(0).startswith('</'):
        if stack:
            stack.pop()
        else:
            print('extra close', token.start())
    else:
        stack.append(token.start())
print('opens', len(tokens), 'unclosed', len(stack))
for pos in stack:
    line = text.count('\n', 0, pos)+1
    print('unclosed at line', line, 'snippet', text[pos:pos+100])
