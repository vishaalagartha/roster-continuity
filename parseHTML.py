import string

html = open('continuity.cgi', 'r').read()

teams = ["ATL", "BOS", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NJN", "NOH", "NYK", "OKC", "ORL", "PHI", "PHO", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"]

season = []

for y in range (2016, 1950, -1): 
    season.append(str(y)+'-'+str(y+1)[2:])


data = []
t = 0
s = 0
index = string.find(html, '</td>')
while index!=-1:
    percentage = html[index-3] + html[index-2] + html[index-1]
    if percentage[-1]!='%':
        data.append(teams[t]+ ' ' + season[s])
    else:
        data.append(teams[t]+ ' ' + season[s] + ' ' + percentage)
    t+=1
    if t==30:
        s+=1
        t=0
    html = html[(index+2):]
    index = string.find(html, '</td>')

csv = open('data.csv', 'w')
csv.write('team year continuity\n')
for d in data:
    csv.write(d+'\n')
