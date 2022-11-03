const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;


function createMainWindow(){    

    mainWindow = new BrowserWindow({                              // Crea la ventana del navegador
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
    });
 
    if( isDev ){                                                        // Open devtools if in dev env
        mainWindow.webContents.openDevTools();                  
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html')); // Carga el index.html de la app -> script renderer.js
}

function createAboutWindow(){

  aboutWindow = new BrowserWindow({                              
        title: 'About Image Resizer',
        width: 300,
        height: 300,
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html')); 
}

app.whenReady().then(() => {                                            // Cuando la app se ha inicializado se crea la ventana del navegador
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate( menu );
    Menu.setApplicationMenu( mainMenu );

    // Remove variable from memory
    mainWindow.on('closed', () => (mainWindow = null));

    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()  // En mac si no hay ninguna ventana abierta se abre automaticamente 
  })                                                                    // la de nuestra app.
});

const menu = [                                                          // Menu template
  {
    ...(isMac ? [{
      label: app.name,
      submenu:[
        {
          label: 'About',
          click: createAboutWindow,
        },
      ]
    }] : []),

    role: 'fileMenu',
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [
      {
      label: 'About',
      click: createAboutWindow,
      },
    ]
  }] : [])
]

// Respond to the resize image event
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer'); // Directorio destino de la imagen redimensionada
  resizeImage(options);
});

// Resize and save image
async function resizeImage({ imgPath, height, width, dest }) {
  try {
    // Resize image
    const newPath = await resizeImg(fs.readFileSync(imgPath), { // path de la nueva imagen
      width: +width,
      height: +height,
    });

    // Get filename
    const filename = path.basename(imgPath);                    // Nombre de la nueva imagen

    
    if (!fs.existsSync(dest)) {                                 // Create destination folder if it doesn't exist
      fs.mkdirSync(dest);
    }

    
    fs.writeFileSync(path.join(dest, filename), newPath);       // Write the file to the destination folder

    // Send success to renderer
    mainWindow.webContents.send('image:done');

    // Open the folder in the file explorer
    shell.openPath(dest);

  } catch (err) {
    console.log(err);
  }
}



app.on('window-all-closed', () => {                                     // Se apaga la app cuando se cierran todas las ventanas,excepto en macOS,
  if ( !isMac ) {                                                       // donde se cierra colo con cmd+Q
    app.quit()
  }
})