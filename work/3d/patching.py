from pathlib import Path

def read(path):
 return Path(path).read_text(encoding='utf-8')

# A str.replace whose anchor no longer matches silently drops a feature from the build, so every patch states how often its anchor must appear.
def sub(s,old,new,found=1,count=-1):
 n=s.count(old)
 if n!=found:raise SystemExit(f'Build anchor matched {n} times, expected {found}: {old[:80]!r}')
 return s.replace(old,new,count)
