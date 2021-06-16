# LUDO
A multi-player LUDO game, made with `node.js`, `socket.io` and `Vanilla Javascript`.
___
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/CyberCitizen01/LUDO/socket.io?logo=socketdotio&style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/CyberCitizen01/LUDO/express?logo=express&style=flat-square)<br>
![Website](https://img.shields.io/website?down_color=red&down_message=INACTIVE&label=DEPLOYMENT&logo=heroku&logoColor=green&style=flat-square&up_color=blue&up_message=ACTIVE&url=https%3A%2F%2Fthe-ludo-game.herokuapp.com)
![GitHub last commit](https://img.shields.io/github/last-commit/CyberCitizen01/LUDO?logo=github&style=flat-square)
___
## Build
You can either build the app by cloning the repository or by pulling the Docker image.
- **By Cloning:**

  Clone the [repo](https://github.com/CyberCitizen01/LUDO/):
  ```sh
  git clone https://github.com/CyberCitizen01/LUDO/
  ```
  Install the dependencies:
  ```sh
  npm install
  ```
  Start the node server:
  ```sh
  npm start
  ```
  Head over to http://localhost:3000/, to see the Home Page.
<br>

- **By Docker:**

  **From an docker image:**
  
  ![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/cybercitizen01/the-ludo-game?logo=docker&style=flat-square)
  
  - Pull the [image](https://hub.docker.com/r/cybercitizen01/the-ludo-game) and run:
    ```sh
    docker run --name the-lodu-game -p 3000:3000 cybercitizen01/the-ludo-game
    ```
    Head over to http://localhost:3000/, to see the Home Page.
  - The above command attaches the shell of the container to your terminal, and thus when you hit ^C the container stops automatically. To run the container in detached mode:
    ```sh
    docker run --name the-ludo-game -d -p 3000:3000 cybercitizen01/the-ludo-game
    ```
  - To monitor the output of the game:
    ```sh
    docker logs the-ludo-game
    ```
  - Now, to stop the container:
    ```sh
    docker stop the-ludo-game
    ```
  - Also, to remove the container after stopping:
    ```sh
    docker rm the-ludo-game
    ```
    (add a -f flag at the end, to forcefully remove a running container)
  
<br>



<br><br><br>
<h6>Note: This is not an complete README file, It will soon have Screenshots to decribe the project in detail. </h6>
