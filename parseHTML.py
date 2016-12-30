import string, csv

continuity_html = open('continuity.cgi', 'r').read()
wins_html = open('NBA_wins.html', 'r').read()

teams = ["ATL", "BOS", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NJN", "NOH", "NYK", "OKC", "ORL", "PHI", "PHO", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"]

season = []

for y in range (2016, 1950, -1): 
    season.append(str(y)+'-'+str(y+1)[2:])


data = {}
t = 0
s = 0
index = string.find(continuity_html, '</td>')
while index!=-1:
    percentage = continuity_html[index-3] + continuity_html[index-2] + continuity_html[index-1]
    if percentage[-1]=='%':
        if season[s] not in data:
            data[season[s]] = {}
        data[season[s]][teams[t]] = [percentage]
    t+=1
    if t==30:
        s+=1
        t=0
    continuity_html = continuity_html[(index+2):]
    index = string.find(continuity_html, '</td>')

season_string = 'data-stat="season"'
index = string.find(wins_html, season_string)
while index!=-1:
    wins_html = wins_html[(index+len(season_string)):]
    d = string.find(wins_html, '-')
    season = wins_html[(d-4):(d+3)]
    wins_html = wins_html[(d+3):]
    if season in data: 
        season_data = wins_html.split('\n')[0]
        for c in range (0, len(season_data)):
            if season_data[c].isupper():
                team = season_data[c:c+3]
                if team in data[season]:
                    data[season][team].append(season_data[c+6:c+8])
    index = string.find(wins_html, season_string)
with open('data.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["year", "team", "continuity", "wins"])
    for year in data:
        for team in data[year]:
            if len(data[year][team])==2:
                r = [year, team, data[year][team][0], data[year][team][1]]
                writer.writerow(r)
