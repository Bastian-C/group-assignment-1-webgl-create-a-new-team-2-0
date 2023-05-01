[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/1Zvp0ubu)
# Group assignment 01 - WebGL demo

## Task
The task is to implement a small WebGL program that renders a 3D scene that includes some loaded (or procedurally generated) 3D models that are animated.

The implementation has to be done in teams and will be presented in class (exactly 10 minutes).

The code needs to be committed (pushed) into this Github classroom repository. It will be rendered on the teachers laptop (no CUDA, Win11, Firefox or Chrome or Edge).

The code needs to be explained in a short readme.

## Rating
The rating will be as follows:
- presentation and idea: 30 % 
- arts and/or math: 30 %
- code quality: 40 %

## Hints
In order to load a 3D model, [three.js](https://threejs.org) can be used. Follow the [installation instructions](https://threejs.org/docs/#manual/en/introduction/Installation) and create your own scene. Get inspired by the [examples](https://threejs.org/examples/), but come up with your own ideas and models. Use [some control method from three.js](https://threejs.org/examples/?q=controls) in order to make the scene explorable by the user. Note that the animation shall not be stored in the 3D model file, but needs to be defined by transformations in the WebGL JavaScript code. You can combine results and ideas from your individual assignment-shader project.

# ToDo
Das Bild beschreibt eine Weltraumszene in der ein 3D-Modell von einem Portal reingeladen wird und in der Luft schwebt. Dieses Portal besitzt in der Mitte eine Three.js CircleGeometry Plane, welche mit Shader zu einem Swirrlie Portal Effekt überzogen wird und im Kern ein Bild von einem anderen Universum, welches wir auch getrennt erstellt haben, zeigt. Das Portal wird mit auf und ab "Schwebe"-Animationen versehen und der Kreis in der Mitte mit einer verzögerten "Schwebe"-Animation, welche Magnetfelder und Anziehungskräfte simulieren sollen. Noch dazu rotiert und skaliert sich das Portal, um einen schönen Effekt zu kreieren. 
Der Planet befindet sich in einem anderen Teil des Universums und soll als Ziel des 3D-Portals angesteuert werden. Der Planet wird von einer anderen Lichtquelle beleuchtet und schimmert aus diesem Grund in einem rötlich Ton.