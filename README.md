# Thin plate spline on Openlayers

Hello everyone, a project is being developed where TPS transformation is applied directly on the map using any image. This project utilizes libraries such as ol and proj4.

I keep part of the code as short and clear as possible, handling the points manually, since automating this would make the code even longer.

For now, please use the metric system. Initially, I tried using degrees until I noticed that the `addCoordinateTransforms` method was called around 7,000 times on each moveEnd of the map. Currently, with scale and the metric system, I managed to reduce that to approximately 66 calls. Big thanks to [@mike-000](https://github.com/mike-000) [discussions](https://github.com/openlayers/openlayers/discussions/16153), who greatly helped solve the issue with overlay resolution by using scale and the metric system.

Also, thanks to [@bojko108](https://github.com/bojko108), whose project served as a starting point: https://codesandbox.io/p/sandbox/kw9l85y5po?file=%2Fsrc%2FApp.vue

By the way, when using Affine transformation, the `addCoordinateTransforms` method essentially has no computational load.



## Installation
1.  Install React project
```cookie
npm install
```
2. Run project
```cookie
npm run dev
```

# [Demo codesandbox](https://codesandbox.io/p/sandbox/openlayertps-wlm532)


https://github.com/user-attachments/assets/80790dac-5cd8-453d-b568-963d50d94997


https://github.com/user-attachments/assets/a77bcdd0-7ee0-41cd-87ee-ca68dcb2cfeb

