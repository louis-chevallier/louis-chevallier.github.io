
# npm install -g mermaid-filter


start :
	pandoc --toc --standalone --mathjax -f markdown -t html README.md --filter=mermaid-filter -o index.html
