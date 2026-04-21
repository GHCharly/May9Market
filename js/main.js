
/**
 * ==========================================================
 * Archivo principal de JavaScript - May 9 Market
 * ==========================================================
 * 
 * Este archivo centraliza la lógica compartida entre todas
 * las páginas del sitio web May 9 Market.
 * 
 * Funcionalidades principales:
 * - Inicialización global del sitio.
 * - Consumo de APIs REST externas.
 * - Carga dinámica de contenido desde archivos JSON.
 * - Manipulación del DOM según la página activa.
 * - Animaciones y efectos visuales con jQuery.
 * 
 * Tecnologías utilizadas:
 * - JavaScript ES6+
 * - jQuery
 * - Fetch API
 * - AJAX
 */

/* ==========================================================
   Inicialización principal al cargar el DOM
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Objeto global para almacenar rutas de íconos dinámicos.
     * Se utiliza como almacenamiento compartido entre funciones
     * para reutilizar recursos sin recargas innecesarias.
     */
    window.iconosDinamicos = {
        cargando: '',
        tipoCambio: ''
    };

    /**
     * Animación de entrada para elementos visuales.
     * Todos los elementos con clase .fade-in-element
     * se muestran progresivamente para mejorar UX.
     */
    $('.fade-in-element').hide().fadeIn(800);

    /**
     * 1. Consumo de API REST externa
     * Obtiene el tipo de cambio USD → CRC utilizando RapidAPI.
     * Se mostrará en el banner superior si existe en la página.
     */
    obtenerTipoCambio();
    
    /**
     * 2. Carga de íconos dinámicos del footer.
     * Se obtiene la información desde un archivo JSON
     * hospedado en un repositorio público de GitHub.
     */
    cargarImagenesFooter();

    /**
     * 3. Carga de multimedia para la página de inicio.
     * Se consume un archivo JSON hospedado en GitHub
     * para cargar imágenes y videos dinámicos.
     */
    cargarMultimediaInicio();

    /**
     * 4. Carga de imágenes de servicios.
     * Se consume un archivo JSON hospedado en GitHub
     * para cargar imágenes relacionadas con los servicios.
     */
    cargarImagenesServicios();

    /**
     * 5. Carga de imágenes de la página "Nosotros".
     * Se consume un archivo JSON hospedado en GitHub
     * para cargar imágenes relacionadas con la empresa.
     */
    cargarImagenesNosotros();

    /**
     * 6. Carga de imágenes del autor.
     * Se consume un archivo JSON hospedado en GitHub
     * para cargar imágenes relacionadas con el autor.
     */
    cargarImagenesAutor();
});


/* ==========================================================
   API REST Externa - Tipo de Cambio (USD → CRC)
   ========================================================== */

/**
 * Función que obtiene el tipo de cambio del dólar a colones.
 * 
 * Detalles:
 * - Usa RapidAPI como proveedor REST externo.
 * - El consumo se realiza mediante AJAX (jQuery).
 * - Soporta diferentes formatos de respuesta del API.
 * - Guarda la tasa en una variable global para reutilización.
 * - Dispara un evento personalizado cuando la tasa está lista.
 */
function obtenerTipoCambio() {

    // Se valida que el banner exista en la página actual para evitar llamadas innecesarias en páginas que no lo requieren
    const banner = $('#exchange-rate-banner');
    if (banner.length === 0) return; // Si no hay banner en la página actual, ignorar

    // Endpoint del API de tipo de cambio. Se puede ajustar para obtener diferentes monedas o formatos según la documentación del API.
    const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/latest?base=USD&symbols=CRC%2CGBP';

    // Llamada AJAX al API REST externo
    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'x-rapidapi-key': '11edada2d1mshaecee0bbdd092d8p112439jsn118943097a48',
            'x-rapidapi-host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
        },
        // Callback en caso de respuesta exitosa
        success: function(data) {

            // Evaluamos la estructura de la respuesta basada en el endpoint de "convert" o "latest"
            // Para "convert": data.result o data.info.rate
            // Para "latest": data.rates.CRC
            let crcRate = null;
            
            if (data.result) {
                crcRate = data.result; // Caso: amount=1 en convert
            } else if (data.info && data.info.rate) {
                crcRate = data.info.rate; // Caso: rate directo
            } else if (data.rates && data.rates.CRC) {
                crcRate = data.rates.CRC; // Caso: latest endpoint
            }
            
            // Si se obtiene una tasa válida, se formatea y muestra en el banner. Si no, se maneja como error.
            if (crcRate) {

                // Guardar la tasa globalmente para cálculos posteriores
                window.tasaCambioActual = parseFloat(crcRate);

                // Formatear el número para que se vea como moneda
                const tasaFormateada = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(crcRate);

                // Construcción dinámica del banner con el ícono (si está disponible) y la tasa de cambio
                const iconHtml = window.iconosDinamicos.tipoCambio 
                    ? `<img src="${window.iconosDinamicos.tipoCambio}" class="dynamic-icon-tipocambio banner-icon" alt="Tipo de Cambio">` 
                    : `<img src="" class="dynamic-icon-tipocambio banner-icon" alt="Tipo de Cambio" style="display:none;">`;

                banner.html(`${iconHtml} <span>Tipo de cambio de venta del día: 1 USD = <strong>${tasaFormateada}</strong> (Sujeto a confirmación al momento de su compra).</span>`);
                
                // Disparar un evento para avisar a otros scripts que la tasa está lista
                $(document).trigger('tasaCambioCargada');
            } else {
                throw new Error('Formato de respuesta desconocido');
            }
        },

        // Callback en caso de error de la solicitud
        error: function(xhr, status, error) {
            console.error('Error al obtener el tipo de cambio:', error);
            const iconHtml = window.iconosDinamicos.tipoCambio 
                ? `<img src="${window.iconosDinamicos.tipoCambio}" class="dynamic-icon-tipocambio banner-icon" alt="Tipo de Cambio">` 
                : `<img src="" class="dynamic-icon-tipocambio banner-icon" alt="Tipo de Cambio" style="display:none;">`;
            banner.html(`${iconHtml} <span>Tipo de cambio sujeto a variación. Confirme con nosotros por WhatsApp.</span>`);
            
            // Valor de respaldo para evitar bloqueos lógicos en otras partes del sitio que dependan de esta tasa
            window.tasaCambioActual = 515.00;
            $(document).trigger('tasaCambioCargada');
        }
    });
}

/* ==========================================================
   Carga dinámica de íconos del Footer (JSON externo)
   ========================================================== */

/**
 * Carga íconos e imágenes del footer utilizando un archivo JSON.
 * 
 * Técnica:
 * - Fetch API
 * - Uso de switch para identificar cada recurso por ID.
 * - Aplicación directa al DOM.
 */
function cargarImagenesFooter() {
    fetch('https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/iconos.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                switch (item.id) {

                    case 'i1':
                        document.querySelectorAll('.dynamic-logo')
                            .forEach(img => img.src = item.imagen);
                        break;

                    case 'i2': {
                        const el = document.getElementById('footer-mobile-icon');
                        if (el) el.src = item.imagen;
                        document.querySelectorAll('.dynamic-icon-mobile')
                            .forEach(img => img.src = item.imagen);
                        break;
                    }

                    case 'i3': {
                        const el = document.getElementById('footer-email-icon');
                        if (el) el.src = item.imagen;
                        document.querySelectorAll('.dynamic-icon-email')
                            .forEach(img => img.src = item.imagen);
                        break;
                    }

                    case 'i4': {
                        const el = document.getElementById('footer-ig-icon');
                        if (el) el.src = item.imagen;
                        break;
                    }

                    case 'i5': {
                        const el = document.getElementById('footer-fb-icon');
                        if (el) el.src = item.imagen;
                        break;
                    }

                    case 'i6': {
                        const el = document.getElementById('footer-wa-icon');
                        if (el) el.src = item.imagen;

                        window.iconosDinamicos.whatsappFooter = item.imagen;

                        document.querySelectorAll('.btn-wa-icon')
                            .forEach(img => img.src = item.imagen);
                        break;
                    }

                    case 'i7':
                        document.querySelectorAll('.dynamic-icon-float-wa')
                            .forEach(img => img.src = item.imagen);
                        break;

                    case 'i8':
                        window.iconosDinamicos.cargando = item.imagen;
                        document.querySelectorAll('.dynamic-icon-cargando')
                            .forEach(img => {
                                img.src = item.imagen;
                                img.style.display = 'inline-block';
                            });
                        break;

                    case 'i9':
                        window.iconosDinamicos.tipoCambio = item.imagen;
                        document.querySelectorAll('.dynamic-icon-tipocambio')
                            .forEach(img => {
                                img.src = item.imagen;
                                img.style.display = 'inline-block';
                            });
                        break;

                    case 'i10':
                        document.querySelectorAll('.dynamic-icon-horario')
                            .forEach(img => img.src = item.imagen);
                        break;

                    default:
                        // Íconos no reconocidos: se ignoran
                        break;
                }
            });
        })
        .catch(error =>
            console.error('Error al cargar imágenes dinámicas:', error)
        );
}

/* ==========================================================
   Carga de multimedia del Home (index.html)
   ========================================================== */

/**
 * Carga imágenes, videos y Spotify embed
 * exclusivamente en la página de inicio.
 */
function cargarMultimediaInicio() {
    // Validación: solo ejecutar en index.html
    if (!document.getElementById('heroCarousel')) return;

    fetch('https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/inicio.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {

                switch (item.id) {

                    case 'mtm1': {
                        const el = document.getElementById('inicio-carousel-1');
                        if (el) el.src = item.ruta;
                        break;
                    }

                    case 'mtm2': {
                        const el = document.getElementById('inicio-carousel-2');
                        if (el) el.src = item.ruta;
                        break;
                    }

                    case 'mtm3': {
                        const el = document.getElementById('inicio-icon-servicios');
                        if (el) el.src = item.ruta;
                        break;
                    }

                    case 'mtm4': {
                        const el = document.getElementById('inicio-icon-productos');
                        if (el) el.src = item.ruta;
                        break;
                    }

                    case 'mtm5': {
                        const el = document.getElementById('inicio-video-feria');
                        if (el) {
                            el.querySelector('source').src = item.ruta;
                            el.load();
                        }
                        break;
                    }

                    case 'mtm6': {
                        const el = document.getElementById('inicio-video-unboxing');
                        if (el) {
                            el.querySelector('source').src = item.ruta;
                            el.load();
                        }
                        break;
                    }

                    case 'mtm7': {
                        const el = document.getElementById('inicio-video-nuevo');
                        if (el) {
                            el.querySelector('source').src = item.ruta;
                            el.load();
                        }
                        break;
                    }

                    case 'mtm8': {
                        const el = document.getElementById('inicio-spotify');
                        if (el && item.ruta) {
                            const embedUrl =
                                item.ruta
                                    .replace('/episode/', '/embed/episode/')
                                    .split('?')[0] +
                                '?utm_source=generator';
                            el.src = embedUrl;
                        }
                        break;
                    }

                    default:
                        // Elementos no reconocidos se ignoran
                        break;
                }
            });
        })
        .catch(error =>
            console.error('Error al cargar multimedia de inicio:', error)
        );
}


/* ==========================================================
   Carga de imágenes de Servicios, Nosotros y Autor
   ========================================================== */

/**
 * Las siguientes funciones cargan recursos dinámicos
 * únicamente cuando el usuario se encuentra en la página
 * correspondiente, validando la URL actual.
 */
function cargarImagenesServicios() {
    if (window.location.pathname.indexOf('servicios.html') === -1) return; // Solo ejecutar en servicios.html

    fetch('https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/servicios.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                if (item.id === 's1') {
                    const header = document.getElementById('header-servicios');
                    if (header) {
                        // Respetamos el gradiente oscuro y añadimos la imagen de fondo
                        header.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${item.imagen}')`;
                        header.style.backgroundSize = 'cover';
                        header.style.backgroundPosition = 'center';
                    }
                } else {
                    const el = document.getElementById('icon-' + item.id);
                    if (el) {
                        el.src = item.imagen;
                    }
                }
            });
        })
        .catch(error => console.error("Error al cargar imágenes de servicios:", error));
}

function cargarImagenesNosotros() {
    if (window.location.pathname.indexOf('about.html') === -1) return; // Solo ejecutar en about.html

    fetch('https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/nosotros.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                if (item.id === 'n1') {
                    const header = document.getElementById('header-nosotros');
                    if (header) {
                        // Respetamos el gradiente oscuro y añadimos la imagen de fondo
                        header.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${item.imagen}')`;
                        header.style.backgroundSize = 'cover';
                        header.style.backgroundPosition = 'center';
                    }
                } else if (item.id === 'n2') {
                    const img = document.getElementById('img-n2');
                    if (img) img.src = item.imagen;
                } else {
                    const icon = document.getElementById('icon-' + item.id);
                    if (icon) icon.src = item.imagen;
                }
            });
        })
        .catch(error => console.error("Error al cargar imágenes de nosotros:", error));
}

function cargarImagenesAutor() {
    if (window.location.pathname.indexOf('autor.html') === -1) return; // Solo ejecutar en autor.html

    fetch('https://raw.githubusercontent.com/GHCharly/Imagenes/refs/heads/main/autor.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                if (item.id === 'a1') {
                    const img = document.getElementById('img-a1');
                    if (img) img.src = item.imagen;
                } else {
                    const icon = document.getElementById('icon-' + item.id);
                    if (icon) icon.src = item.imagen;
                }
            });
        })
        .catch(error => console.error("Error al cargar imágenes del autor:", error));
}


