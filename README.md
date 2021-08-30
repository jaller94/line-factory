# Asteroids: The Full Game

![](./docs/preview.jpg)

[Play now!](https://jaller94.gitlab.io/line-factory/)

**Asteroids: The Full Game** is a space-themed exploration game developed for the [js13kgames](https://js13kgames.com/) 2021 game jam.

Play it using any modern web browser on Desktop and Mobile. You can control the spaceship with your keyboard or overlay buttons on a touch screen.

## Development
The game uses no frameworks and should be runnable without preprocessing.

```bash
# Obtain a copy of the game, e.g. by running
git clone https://gitlab.com/jaller94/line-factory.git

# Navigate to the src folder
cd line-factory/src

# Host the content of this folder locally, e.g. by running
python -m http.server
```

Now open http://localhost:1234 to play the game.
You can change the code in a text editor and reload the browser tab to play your modified version.

## Package the game
The js13kgames rules allow a game to be minified and zipped before submission. The ZIP file must not be bigger than 13 kilobytes.

To minimize the code, we use [Parcel](https://parceljs.org/) which is an NPM package. The ZIP archive can be built with just a few commands and we automatically run these step as described in `.gitlab-ci.yml`.
