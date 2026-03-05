import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

count = text.count('letter-spacing')
print(f"letter-spacing count: {count}")
count = text.count('expertise-grid')
print(f"expertise-grid count: {count}")

text = re.sub(r'letter-spacing:\s*-0\.0[12]em;', 'letter-spacing: normal;', text)

def repl(m):
    return """      .expertise-grid {
        display: flex;
        overflow-x: auto;
        gap: 2rem;
        padding-bottom: 2rem;
        scrollbar-width: thin;
      }
      .expertise-grid::-webkit-scrollbar {
        height: 6px;
      }
      .expertise-grid::-webkit-scrollbar-thumb {
        background-color: var(--border);
        border-radius: 4px;
      }

      .expertise-card {
        flex: 0 0 320px;
        background: var(--bg-card);"""

text = re.sub(r'\s*\.expertise-grid\s*\{[^}]+\}\s*\.expertise-card\s*\{\s*background:\s*var\(--bg-card\);', repl, text)

# Print if replaced
count2 = text.count('flex: 0 0 320px;')
print(f"expertise-grid replaced: {count2 > 0}")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
