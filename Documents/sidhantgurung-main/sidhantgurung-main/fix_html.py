import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix letter-spacing 
text = re.sub(r'letter-spacing:\s*-0\.0[12]em;', 'letter-spacing: normal;', text)

# 2. Fix expertise-grid layout (horizontal scroll)
text = text.replace(
'''  .expertise-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .expertise-card {
    background: var(--bg-card);''',
'''  .expertise-grid {
    display: flex;
    overflow-x: auto;
    gap: 2rem;
    padding-bottom: 2rem;
    scrollbar-width: thin;
  }

  .expertise-card {
    flex: 0 0 320px;
    background: var(--bg-card);'''
)

# 3. Remove card icons
# We can just match <div class="card-icon.*?</div> using dotall
text = re.sub(r'<div class="card-icon[^>]*>.*?</div>', '', text, flags=re.DOTALL)

# 4. Remove Head Server timeline item
head_server_regex = r'<div class="timeline-item reveal">\s*<div class="timeline-dot"></div>\s*<div class="timeline-date">Jan 2025 – Mar 2025</div>\s*<div class="timeline-title">Head Server</div>.*?</div>\s*</div>'
text = re.sub(head_server_regex, '', text, flags=re.DOTALL)

# 5. Remove <br /> and <br> from h2 and h3
# Only in the section titles and about
text = re.sub(r'<h2([^>]*)>([^<]*)<br\s*/?>([^<]*)</h2>', r'<h2\1>\2 \3</h2>', text, flags=re.IGNORECASE|re.DOTALL)
text = re.sub(r'<h2([^>]*)>([^<]*)<br\s*/?>([^<]*)<br\s*/?>([^<]*)</h2>', r'<h2\1>\2 \3 \4</h2>', text, flags=re.IGNORECASE|re.DOTALL)
# Try more generic <br> removal for all h2 tags
def remove_br(match):
    return match.group(0).replace('<br />', ' ').replace('<br>', ' ').replace('<br/>', ' ').replace('\n', ' ')

text = re.sub(r'<h2[^>]*>.*?</h2>', remove_br, text, flags=re.DOTALL)

# Add some whitespace collapse to the text to clean up spaces that were newlines
def collapse_spaces(match):
    s = match.group(0)
    # remove excessive whitespace inside h2
    s = re.sub(r'\s{2,}', ' ', s)
    return s

text = re.sub(r'<h2[^>]*>.*?</h2>', collapse_spaces, text, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Modifications done!")
