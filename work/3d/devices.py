from pathlib import Path


def integrate(s, replace_once):
    s = replace_once(s, '<small>HOLD SHIFT + STEER</small>', '<small><span class="drift-key">HOLD SHIFT + STEER</span><span class="drift-touch">HOLD + STEER</span></small>')
    s = replace_once(s, '''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@500;700&family=IBM+Plex+Sans+Condensed:wght@400;600;700&display=swap" rel="stylesheet">
''', '')
    helper = Path('work/3d/graphics-profiles.js').read_text()
    settings = '''
let requestedGraphicsQuality='auto';
try{requestedGraphicsQuality=GraphicsProfiles.parsePreference(localStorage.getItem('bullrun.graphics'));}catch{}
const graphicsPointer=matchMedia('(pointer: coarse)');
function resolveGraphicsProfile(width,height){
 return GraphicsProfiles.resolve(requestedGraphicsQuality,{width,height,dpr:window.devicePixelRatio||1,coarsePointer:graphicsPointer.matches});
}
graphicsPointer.addEventListener('change',()=>resize());
'''
    s = replace_once(s, '// Real WebGL scene.', helper + settings + '\n// Real WebGL scene.')
    s = replace_once(s, '''  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = Math.max(1, r.width); H = Math.max(1, r.height);
  cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);''', '''  W = Math.max(1, r.width); H = Math.max(1, r.height);
  const graphics=resolveGraphicsProfile(W,H);
  DPR = graphics.pixelRatio;
  cvs.width = graphics.backingWidth; cvs.height = graphics.backingHeight;''')
    s = replace_once(s, '</style>', Path('work/3d/devices.css').read_text() + '\n</style>')
    return s
