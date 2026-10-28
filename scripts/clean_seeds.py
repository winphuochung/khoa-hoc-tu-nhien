import os, re

seed_dir = 'server/seed'
for fname in os.listdir(seed_dir):
    if not fname.endswith('.js'):
        continue
    fpath = os.path.join(seed_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(r'"youtubeId":\s*"[^"]*"', '"youtubeId": ""', content)
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Cleaned {fname}')

print('All seed files cleaned.')
