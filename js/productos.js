/**
 * ==========================================================
 * Lógica para la Galería de Productos (Entrega Inmediata)
 * ==========================================================
 *
 * Este archivo maneja exclusivamente la página productos.html.
 * Su función principal es cargar dinámicamente el inventario
 * de productos de entrega inmediata utilizando archivos JSON
 * externos y mostrarlo en formato de tarjetas responsivas.
 *
 * Tecnologías utilizadas:
 * - jQuery (DOM, eventos, AJAX)
 * - Fetch API
 * - JSON externo (repositorio GitHub)
 */

/* ==========================================================
   Inicialización del script cuando el DOM está listo
   ========================================================== */
$(document).ready(function() {
    // Se inicia el proceso de carga de productos al cargar la página.
    cargarProductos();
});


/* ==========================================================
   Función principal para cargar productos
   ========================================================== */

/**
 * cargarProductos()
 *
 * Responsabilidades:
 * - Mostrar un indicador de carga inicial.
 * - Obtener dinámicamente el fondo del encabezado desde JSON.
 * - Consumir el archivo JSON con el inventario de productos.
 * - Delegar el renderizado a la función mostrarGaleria().
 */
function cargarProductos() {

    // URL del archivo JSON con el inventario de productos.
    const jsonUrl = 'https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/productos.json';
    
    /**
     * Indicador visual de carga mientras se obtiene el inventario.
     * Mejora la experiencia de usuario (UX).
     */
    $('#galeria-productos').html('<div class="col-12 text-center"><span style="font-size:3em;">⏳</span><p>Cargando inventario...</p></div>');

    /* ======================================================
       Carga dinámica del fondo del encabezado
       ====================================================== */

    /**
     * Se obtiene el fondo del encabezado de productos
     * desde un archivo JSON independiente.
     * Esto permite cambiar la imagen sin tocar el código.
     */
    fetch('https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/fondoProductos.json?t=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            // Se busca el elemento con ID específico para el fondo
            const fondo = data.find(item => item.id === 'p1');
            if (fondo) {
                $('.hero-bg-productos').css('background-image', `url('${fondo.ruta}')`);
            }
        })
        .catch(error => console.error('Error al cargar el fondo:', error));

    /* ======================================================
       Carga del inventario principal de productos
       ====================================================== */

    /**
     * Uso de jQuery AJAX para cargar el inventario.
     * Cumple con el requerimiento del proyecto:
     * uso de jQuery + JSON + manipulación del DOM.
     */
    $.ajax({
        url: jsonUrl,
        method: 'GET',
        dataType: 'json',
        cache: false, // Evita que el navegador o GitHub cacheen versiones antiguas del JSON
        success: function(data) {
            // Si el JSON se carga correctamente, se renderiza la galería
            mostrarGaleria(data);
        },
        error: function(error) {
            console.error("Error al cargar los productos:", error);
            // Mensaje de error visible al usuario
            $('#galeria-productos').html('<div class="alert alert-danger col-12">No se pudieron cargar los productos en este momento. Intente más tarde.</div>');
        }
    });
}

/* ==========================================================
   Renderizado dinámico de la galería
   ========================================================== */

/**
 * mostrarGaleria(productos)
 *
 * @param {Array} productos - Lista de productos obtenida del JSON
 *
 * Función encargada de:
 * - Limpiar el contenedor.
 * - Validar si hay productos disponibles.
 * - Construir dinámicamente las tarjetas de productos.
 * - Insertarlas en el DOM de forma responsiva.
 */

function mostrarGaleria(productos) {
    const contenedor = $('#galeria-productos');
    contenedor.empty(); // Limpiar el contenedor

    /**
     * Validación defensiva:
     * Si no hay productos, se muestra un mensaje informativo.
     */
    if(productos.length === 0) {
        contenedor.html('<div class="col-12 text-center"><p>No hay productos disponibles por el momento.</p></div>');
        return;
    }

    /* ======================================================
       Construcción de tarjetas de productos
       ====================================================== */
    productos.forEach(producto => {
        
        /**
         * Plantilla HTML de la tarjeta de producto.
         * Se utilizan template literals para insertar
         * dinámicamente la información.
         */
        const tarjeta = `
            <div class="col-md-4 mb-4 fade-in-element">
                <div class="card card-custom h-100">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 400px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-dark mb-2 align-self-start">${producto.categoria}</span>
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text text-muted flex-grow-1">${producto.descripcion}</p>
                        <h4 class="text-accent mb-3">₡${producto.precio}</h4>
                        <a href="https://wa.me/50664233970?text=Hola, estoy interesado en comprar el producto de entrega inmediata: ${encodeURIComponent(producto.nombre)}" class="btn btn-custom w-100 mt-auto" target="_blank">
                            <img src="${window.iconosDinamicos && window.iconosDinamicos.whatsappFooter ? window.iconosDinamicos.whatsappFooter : ''}" class="btn-wa-icon"> Comprar Ahora
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Se agrega la tarjeta al contenedor
        contenedor.append(tarjeta);
    });
}
