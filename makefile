
# npm install -g mermaid-filter

start : server

server :
	python -m http.server

gen :
	pandoc --toc --standalone --mathjax -f markdown -s -V pagetitle="liste" -t html README.md --filter=mermaid-filter -o index.html
