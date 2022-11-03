const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');



function loadImage( e ){                                // Recibimos el evento del input tipo file para redimensionar la imagen
    const file = e.target.files[0];                     // Ontenemos el file

    if(!isFileImage(file)){                             // Comprobación de que el file es una imagen.
        alertError('Please select an image');
        return
    }

    // Add current height and width to form using the URL API
    const  image = new Image();             // Instancia de un objeto Image
    image.src = URL.createObjectURL(file);  // A esa instancia le asociamos el file subido
    image.onload = function () {            // Cuando se termine de cargar en el navegador 
        widthInput.value = this.width;      // obtenemos su ancho
        heightInput.value = this.height;    // y su alto
    };                                      // Esos valores se aplican en el form a los inputs width y height a través de su id


    console.log('Success')
    form.style.display = 'block';                                   // Cambiamos el display del form a block para redimensionar la imagen
    filename.innerText = file.name;                                 // Cambiamos el valor del p con id=filename
    outputPath.innerText = path.join(os.homedir(), 'imageResizer')  // Cambiamos el valor del p con id=outputPath
}

// Asegurarnos de que es una imagen
function isFileImage( file ){
    const acceptedImagedTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImagedTypes.includes(file['type']);
}

// Resize image
function resizeImage(e) {
  e.preventDefault();

  if (!img.files[0]) {
    alertError('Please upload an image');
    return;
  }

  if (widthInput.value === '' || heightInput.value === '') {
    alertError('Please enter a width and height');
    return;
  }

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  ipcRenderer.send('image:resize', { // Enviamos a main.js un evento con las opciones de redimensionamiento
    imgPath,
    height,
    width,
  });
}

// When done, show message
ipcRenderer.on('image:done', () =>
  alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`)
);

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

img.addEventListener('change', loadImage) // A la escucha de que el input img cambie de value -> loadImage

form.addEventListener('submit', resizeImage); // listener para el submit - resizeImage