# igm-scrape [![GitHub](https://img.shields.io/github/license/cfhull/igm-panel-scraper.svg?style=plastic)](https://github.com/cfhull/igm-panel-scraper/blob/master/LICENSE) [![CircleCI](https://img.shields.io/circleci/build/github/cfhull/igm-panel-scraper.svg?style=plastic)](https://circleci.com/gh/cfhull/igm-panel-scraper) 


igm-scrape is a web scraper that pulls data from the IGM Economic Experts Panel at `http://www.igmchicago.org/igm-economic-experts-panel`

Note: Currently does not support special surveys

## Prerequisites
`node.js`

`npm`

Cookie from `http://www.igmchicago.org/igm-economic-experts-panel`

### How to get cookie
1. Go to `http://www.igmchicago.org/igm-economic-experts-panel`
2. Opening your browser dev tools
3. Navigate to the `network` tab
4. As shown in the follow screenshot, select the `igm-economic-experts-panel` request, and copy the cookie string beginning with `incap_ses`

<img src="https://raw.githubusercontent.com/cfhull/igm-panel-scraper/master/cookie.png" width="400" />


## Running
NPM
```console
$ npm i igm-scrape
$ igm-scrape <cookie>
```

Manual
```console
$ git clone <this repository>
$ cd <cloned dir>
$ node index.js <cookie>
```
File will be saved to the current directory as `igmdata.json`
