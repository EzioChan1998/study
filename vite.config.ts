import {defineConfig} from "vite";
import path from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
       'camera': path.resolve(__dirname, './src/camera/camera.html'),
       'camera-array': path.resolve(__dirname, './src/camera-array/camera-array.html'),
       'camera-cinematic': path.resolve(__dirname, './src/camera-cinematic/camera-cinematic.html'),
       'ioc': path.resolve(__dirname, './src/ioc/ioc.html'),
       'name-circle': path.resolve(__dirname, './src/name-circle/name-circle.html'),
       'own-promise': path.resolve(__dirname, './src/own-promise/own-promise.html'),
       'scroller': path.resolve(__dirname, './src/scroller/scroller.html'),
       'stripe-animate': path.resolve(__dirname, './src/stripe-animate/stripe-animate.html'),

      }
    }
  }
});
