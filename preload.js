
const os = require('os');
const path = require('path');
const Toastify = require('toastify-js');
const { contextBridge, ipcRenderer } = require('electron')  // Para unir los diferentes tipos de procesos de Electron, necesitaremos usar un script especial llamado preload

// contextBridge.xposeInMainWorld('versions', {                    // Creamos una secuencia de comandos precargada que expone
//   node: () => process.versions.node,                            // las versiones de Node 
//   chrome: () => process.versions.chrome,                        // Chrome,
//   electron: () => process.versions.electron,                    // y Electron  
//                                                                 // de su aplicación en el renderizador  
//   // también podemos exponer variables, no sólo funciones
// })

contextBridge.exposeInMainWorld('os', {     // Exponemos del sistema operativo nuestro directorio raiz c:
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {   // Exponemos la api.path que une varios segmentos de ruta, creando una cadena de ruta combinada
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('Toastify', {           // Exponemos la api de toastify-js para la generación de alertas
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {                // Exponemos la api de redimensionamiento de imagenes
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});