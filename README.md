# Race Condition

A racing game.

### Dependencies

So far, just a modern web browser and Python.

### Running

For CORS' reasons, we need to run a web server. Try this:

```
python3 -m http.server 8000 --bind 127.0.0.1
```

### FAQ

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


# Node dependencies

They are useful, but every dependency should be justified.

## APIs and ServerSide configuration: express

Facilitates writing APIs and managing static resources.

## Database: SQlite

Allows to store the leaderboard.

## View Engine: ejs

Facilitates to use JS variables in the HTML.

## Logging: morgan

Facilitates logging format configuration.


## Error helper: http-errors

Create default error objects based on status codes.

## Seeded RNG: chance

Allows to set generate random number with a predefined seed.

## Dev dependencies

### Linter and formatter: eslint

Allows for code standardization and linting.

