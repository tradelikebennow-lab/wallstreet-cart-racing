from patching import read, sub


def integrate(s, sub):
    def patch(old, new):
        nonlocal s
        s = sub(s, old, new)

    patch('// ---------- racers ----------', read('work/3d/competition.js') + '\n// ---------- racers ----------')
    patch("let best = { pnl: 0, place: 0 };\ntry { const b = JSON.parse(localStorage.getItem('bull-run-3d-best') || 'null'); if (b) best = b; } catch (e) {}", '''let competitionStorage;
try{competitionStorage=window.localStorage;}catch{}
let selectedDifficulty=Competition.readDifficulty(competitionStorage);
let bestRecords=Competition.loadBests(competitionStorage);
let best=bestRecords.byDifficulty[selectedDifficulty]||{pnl:0,place:0};''')
    patch('function reset() {', '''function reset() {
  S.difficulty=selectedDifficulty; S.profile=Competition.profile(S.difficulty);
  updateDifficultyLabels();''')
    patch('atk: rand(9, 15), finished: false', 'atk: rand(...S.profile.attackCooldown), finished: false')
    start = s.index('function updateAI(a, w) {')
    end = s.index('\nconst gavelPh =', start)
    patch(s[start:end], read('work/3d/competition-ui.js').rstrip())
    patch('for (const a of S.rivals) updateAI(a, w);', 'for (const a of S.rivals) updateAI(a, w, remember);')
    patch('Math.max(18, VMAX * a.skill)', 'Math.max(18, Competition.targetSpeed(VMAX,a.skill,0,S.profile))')
    patch("  if (!S.dnf) { let ch = false; if (!best.place || place < best.place) { best.place = place; ch = true; } if (S.pnl > best.pnl) { best.pnl = S.pnl; ch = true; } if (ch) { try { localStorage.setItem('bull-run-3d-best', JSON.stringify(best)); } catch (e) {} } }", '''  if(!S.dnf){bestRecords=Competition.recordBest(bestRecords,S.difficulty,{pnl:S.pnl,place});Competition.saveBests(competitionStorage,bestRecords);}''')
    patch("function updateBest() { $('tBest').textContent = best.place ? `Best finish ${ord(best.place)} · Best P&L ${fmt(best.pnl)}` : 'No races on the books yet'; }", '''function updateBest(){
  best=bestRecords.byDifficulty[selectedDifficulty]||{pnl:0,place:0};
  const label=Competition.profile(selectedDifficulty).label;
  $('tBest').textContent=best.place?`${label} best ${ord(best.place)} · Best P&L ${fmt(best.pnl)}`:`${label} · No races on the books yet`;
}''')
    patch('  if (d && d.best && d.best.pnl > best.pnl) best = d.best;', '  setupDifficultyUI();')
    patch('<div class="cta"><button class="go" id="bStart">', '''<label class="difficulty-choice" for="difficultyMode">Difficulty <select id="difficultyMode" aria-label="Race difficulty"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select></label><div class="cta"><button class="go" id="bStart">''')
    patch('<div class="lbl">POSITION</div>', '<div class="lbl">POSITION <span id="hDifficulty" class="difficulty-active">Medium · RACE</span></div>')
    patch('<button class="go" id="bAgain">Race again</button>', '<div class="result-actions"><button class="go" id="bAgain">Race again</button><button type="button" class="race-options" id="bChangeDifficulty">Change difficulty</button></div>')
    patch("$('bAgain').addEventListener('click', start);", """$('bAgain').addEventListener('click', start);
$('bChangeDifficulty').addEventListener('click',()=>{setMode('title');$('difficultyMode').focus();});
for(const event of ['keydown','keyup'])$('bChangeDifficulty').addEventListener(event,e=>e.stopPropagation());""")
    patch('<p class="kicker">Paused</p>', '<p class="kicker">Paused <span id="pauseDifficulty" class="difficulty-active">Medium · RACE</span></p>')
    patch('<p class="kicker" id="rKicker">Closing bell</p>', '<span id="resultDifficulty" class="difficulty-active">Medium · RACE</span><p class="kicker" id="rKicker">Closing bell</p>')
    patch('mode: S.mode, raceT:', 'mode: S.mode, difficulty:S.difficulty, selectedDifficulty, raceT:')
    patch('</style>', '''
.difficulty-choice{display:flex;align-items:center;gap:10px;margin-top:14px;font:700 12px var(--mono)}
.difficulty-choice select{min-height:44px;min-width:130px;padding:8px 12px;border:1px solid var(--rule);border-radius:8px;background:var(--panel);color:var(--ink);font:inherit}
.difficulty-active{display:inline-block;font:700 10px var(--mono);letter-spacing:.04em;white-space:nowrap}
#hDifficulty{display:block;margin-top:3px;font-size:9px;opacity:.8}
.hud-r>.lbl{display:block}
.result-actions{display:flex;flex-wrap:wrap;align-items:center;gap:16px}.race-options{min-height:44px;padding:10px 14px;border:1px solid #95acb5;border-radius:10px;background:#fffdf2;color:#244459;font:700 13px var(--body)}
</style>''')
    return s
