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
5. The [sparkline](https://github.com/fnando/sparkline) library to draw the  progress rate graph for each task

# Migrations
ProGBarZ supports a very simple strategy for database migrations via the command:

```sh
npm run migrate -- --db=<database>
```
where `<database>` is the absolute path to the target SQLite database file.

When invoked, the command will process in ascending sequence all the files in the `sql` directory that match the pattern `migration_<four digits>.sql`, e.g. `migration_0012.sql`, starting from `migration_0000.sql`.

Specifying the optional parameter `--start=<number>` to the `migrate` command will begin migration from the file `migration_<number>.sql`.
## Example
Run all migrations found in the project's `sql` directory starting from `migration_0012.sql` where the target database is in `/opt/mydb.sqlite`:

```sh
npm run migrate -- --db=/opt/mydb.sqlite --start=12
```
# Sparklines
Sparklines next to each task highlight the progress rate for each task. Large spikes denote that large chunks of progress were logged in a relatively short amount of time - the higher the value, the faster you are progressing through your task.
