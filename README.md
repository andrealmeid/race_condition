# Race Condition

A racing game for autonomous vehicles.

## Features

- Random racing tracks
- Customizable state-machine autonomous vehicles
- Leaderboard
- Challenge the best autos with your puny human eyes and fingers!

## Project structure

```
.
├── .eslintrc.js                        # Eslint settings
├── .gitignore                          # Files ignored by git
│
├── race_condition.code-workspace       # VSCode recommended configurations
│
├── package.json                        # npm requirements
├── package-lock.json                   # npm version lock
│
├── updater.sh                          # CI/CD script
│
├── LICENSE                             # Project License
├── README.md                           # /* You are here */
│
├── app.js                              # Express' middleware and routes configuration
├── bin                                 
│   └── www                             # Server entry point 
│
├── models                              # Models (Persistent Storage functions)
│   └── storage.js
│
├── views                               # Views (HTML templates using `ejs` )
│   ├── error.ejs
│   └── index.ejs
│
├── routes                              # Controllers ("Context Values" for the Views and JS APIs)
│   ├── index.js
│   └── api.js
│
└── public                              # Front-end assets
    ├── images
    │   ├── car_blue.png
    │   ├── car_green.png
    │   ├── car_red.png
    │   └── favicon.ico
    ├── javascripts
    │   ├── main.js
    │   └── snowstorm.js
    └── stylesheets
        └── style.css

# generated with the help of `git ls-tree -r --name-only HEAD | tree -a --fromfile`
```

# Installing Dependencies
## Node.js

The server uses NodeJS to manage races and the leaderboard. You can install it through your package manager, but we recommend using [NVM](https://github.com/nvm-sh/nvm) to manage its versions, to install or update nvm, you should run the install script. To do that, you may either download and run the script manually, or use the following cURL or Wget command:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

Running either of the above commands downloads a script and runs it. The script clones the nvm repository to `~/.nvm`, and attempts to add the source lines from the snippet below to the correct profile file (`~/.bash_profile`, `~/.zshrc`, `~/.profile`, or `~/.bashrc`).

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Read more at the [NVM install instructions](https://github.com/nvm-sh/nvm#install--update-script).

## Node dependencies

We use some JS dependencies ease our development. To install them simply run:

```bash
npm install
```

Following, there's a summary of how each of our dependencies help us.

### APIs and ServerSide configuration: **express**

Facilitates writing APIs and managing static resources.

### Database: **SQlite**

Allows to store the leaderboard.

### View Engine: **ejs**

Facilitates to use JS variables in the HTML.

### Logging: **morgan**

Facilitates logging format configuration.


### Error helper: **http-errors**

Create default error objects based on status codes.

### Seeded RNG: **chance**

Allows to set generate random number with a predefined seed.

## Dev dependencies

### Linter and formatter: **eslint**

Allows for code standardization and linting.


# Running

Being a Node application, you can simply run:

```
npm start
```

Which will start the server at `localhost:8000` by default.

# FAQ

- Why?

Because simulating an over-the-horizon radar is too complex.

### TODO:

- API
- servidor que guarda posições em um "array" de keyframes
- a corrida terminar e começar
- modificar pra renderizar a partir dos keyframes
- leaderboard
- mais ferraris e deixar bonito em geral
- código pra dar pull periodicamente do gitlab

