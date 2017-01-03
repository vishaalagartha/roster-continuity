rf = open('colors', 'r')
wf = open('styles.css', 'w')

teams = ["ATL", "BOS", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NJN", "NOH", "NYK", "OKC", "ORL", "PHI", "PHO", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"]

colors = {}

t = 0
for line in rf:
    colors[teams[t]] = []
    afterHashtag = False
    for c in line:
        if afterHashtag:
            if c.isupper() or c.isdigit():
                color+=c
        if c=="#":
            if afterHashtag:
                colors[teams[t]].append(color)
            color = '#'
            afterHashtag = True
    colors[teams[t]].append(color)
    t+=1
rf.close()
for team in colors:
    wf.write("."+team+"-area { fill: " + colors[team][0] + "; }\n")
    wf.write("."+team+"-circle { fill: " + colors[team][1] + "; pointer-events: all; }\n")
    if len(colors[team])>2:
        wf.write("."+team+"-line { fill: none; stroke: " + colors[team][2] + "; stroke-width: 2; stroke-linecap: round; }\n")
    else:
        wf.write("."+team+"-line { fill: none; stroke: #FFFFFF; stroke-width: 2; stroke-linecap: round; }\n")
wf.close()

