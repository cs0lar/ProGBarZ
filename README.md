# ProGBarZ
Create task lists with associated progress bars.

<div align="center">
<img src="https://github.com/cs0lar/ProGBarZ/raw/master/screenshot.png" width="800" height="auto"/>
</div>

# Getting Started
1. `npm install`
2. Create an `.env` file (see `.env.example`) and specify where ProGBarZ should create the database data file (e.g. `~/.progbarz`)
3. `npm start`

# Dependencies
ProGBarZ relies on the following frameworks:
1. The [fastify](https://www.fastify.io/) web framework for Node.js
2. The [marko](https://markojs.com/) templating engine
3. The [progressbar.js](https://kimmobrunfeldt.github.io/progressbar.js/) library for shaped progress bars
4. The [node-sqlite3](https://github.com/mapbox/node-sqlite3) client library to interact with the SQLite persistence engine
