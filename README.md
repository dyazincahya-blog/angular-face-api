# Angular x Face-api.js
> This is a sample code of Face-api.js in Angular, here am using Angular v17.

[Face-api.js](https://github.com/justadudewhohacks/face-api.js) is a JavaScript API for face detection and face recognition in the browser and [nodejs](https://github.com/nodejs/node) with [tensorflow.js](https://github.com/tensorflow/tfjs)

## Features of This Project
- Smile Detection
- Blink (Eyes) Detection
- Mount Detection
- Head Pose
- Age and Gender

## Build With
- Angular v17.3.0
- Face-api.js v0.22.2
- More see [package.json](https://github.com/dyazincahya-blog/angular-face-api/blob/main/package.json)

## How to run?
- Clone this repo
- ```yarn install``` or ```npm install```
- Run ```yarn start``` or ```ng serve``` command for running this project
- After that access in your browser ```http://localhost:4200/```

## How to build?
- Run ```yarn build``` or ```ng build --base-href ./ --configuration production``` command for build project

## How to test build result?
- Go to ```THE_PROJECT/dist/face-detection/browser```
- Run ```npm install -g http-server``` for install ```http-server```
- After that run ```npx http-server``` command for running build result file

## More Info
You can call the [startVideo()](https://github.com/dyazincahya-blog/angular-face-api/blob/main/src/app/face-api/face-api.component.ts#L40) method to start scanning the face manually. and call the [stopVideo()](https://github.com/dyazincahya-blog/angular-face-api/blob/main/src/app/face-api/face-api.component.ts#L58) method to stop scanning manually.
## Screenshot Demo
![screenshot demo](https://raw.githubusercontent.com/dyazincahya-blog/angular-face-api/refs/heads/main/screenshot-demo.png)

## Author
[Kang Cahya](https://www.kang-cahya.com)
