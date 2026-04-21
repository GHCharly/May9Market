/**
 * ==========================================================
 * Lógica para la página de Servicios (Pedido en Línea)
 * ==========================================================
 * 
 * Este archivo contiene la lógica JavaScript específica para
 * la página servicios.html. Se encarga de:
 * 
 * - Validaciones personalizadas del formulario de cotización.
 * - Integración con validaciones HTML5 y Bootstrap.
 * - Conversión dinámica de dólares a colones.
 * - Interacción con datos obtenidos desde main.js (tipo de cambio).
 * 
 * Tecnologías utilizadas:
 * - JavaScript puro (eventos, validaciones)
 * - jQuery (escucha de eventos personalizados)
 */

/* ==========================================================
   Inicialización cuando el DOM está listo
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Referencia al formulario de cotización.
     * Se valida su existencia porque este script
     * podría cargarse en otras páginas.
     */
    const formCotizacion = document.getElementById('formCotizacion');


    const nombreInput = document.getElementById('nombre_completo');
    const celularInput = document.getElementById('celular');

    if (nombreInput) {
        nombreInput.addEventListener('input', () => {
            // Limpiar error personalizado
            nombreInput.setCustomValidity('');

            // Limpiar estado visual de error
            nombreInput.classList.remove('is-invalid', 'is-valid');        });
    }


    if (celularInput) {
        celularInput.addEventListener('input', () => {
            celularInput.setCustomValidity('');
            celularInput.classList.remove('is-invalid', 'is-valid');
        });
    }



    /* ======================================================
       Validaciones del formulario de cotización
       ====================================================== */
    if (formCotizacion) {
        formCotizacion.addEventListener('submit', function (event) {
            event.preventDefault();

            // 🔹 LIMPIAR SIEMPRE PRIMERO
            nombreInput.setCustomValidity('');
            celularInput.setCustomValidity('');
            nombreInput.classList.remove('is-invalid', 'is-valid');
            celularInput.classList.remove('is-invalid', 'is-valid');

            // 🔹 Validar nombre
            const regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
            if (!regexNombre.test(nombreInput.value.trim())) {
                nombreInput.setCustomValidity('El nombre solo puede contener letras y espacios.');
                nombreInput.classList.add('is-invalid');
            } else {
                nombreInput.classList.add('is-valid');
            }


            // 🔹 Validar celular
            const regexCelular = /^\d{8}$/;
            if (!regexCelular.test(celularInput.value.trim())) {
                celularInput.setCustomValidity('Debe contener exactamente 8 dígitos numéricos.');
                celularInput.classList.add('is-invalid');
            } else {
                celularInput.classList.add('is-valid');
            }

            /**
             * Integración con las validaciones HTML5 y Bootstrap:
             * Si el formulario no es válido, se bloquea el envío.
             */
            if (!formCotizacion.checkValidity()) {

                // Mostrar errores SOLO cuando es inválido
                /**
                * Clase de Bootstrap para mostrar feedback visual
                * de campos válidos e inválidos.
                */
                formCotizacion.classList.add('was-validated');

            } else {

                /**
                 * Si todo es válido, se muestra un mensaje
                 * informativo al usuario.
                 * 
                 * El proyecto utiliza mailto/Formspree,
                 * por lo que no se intercepta el envío.
                 */
                alert("La información ha sido ingresada correctamente. Se abrirá su correo para enviar la solicitud de cotización.");

                // Construir el contenido del correo ANTES de limpiar el form
                const enlace = document.getElementById('link_producto').value;
                const detalles = document.getElementById('detalles_articulo').value;
                const nombre = document.getElementById('nombre_completo').value;
                const celular = document.getElementById('celular').value;
                const email = document.getElementById('email').value;
                const envio = document.querySelector('[name="tipo_envio"]').value;

                const asunto = encodeURIComponent('Solicitud de Cotización - May 9 Market' + (nombre ? ` - ${nombre}` : ''));
                const cuerpo = encodeURIComponent(
                    `Solicitud de Cotización\n\n` +
                    `Nombre: ${nombre}\n` +
                    `Celular: ${celular}\n` +
                    `Correo: ${email}\n\n` +
                    `Producto:\n${enlace}\n\n` +
                    `Detalles:\n${detalles}\n\n` +
                    `Tipo de envío preferido: ${envio}\n`
                );

                // Abrir el correo con la información correcta
                window.location.href =
                    `mailto:may9thmarket@outlook.com?subject=${asunto}&body=${cuerpo}`;

                // 1. Limpiar valores del formulario
                formCotizacion.reset();

                // 2. Limpiar validaciones personalizadas (muy importante)
                formCotizacion.querySelectorAll('input, textarea, select')
                    .forEach(input => input.setCustomValidity(''));

                // 3. Quitar el estado visual de validación de Bootstrap
                formCotizacion.classList.remove('was-validated');
            }
        }, false);
    }

    /* ======================================================
       Calculadora rápida USD → CRC
       ====================================================== */

    /**
     * Referencias a los campos del convertidor rápido.
     */
    const inputUsd = document.getElementById('calc_usd');
    const inputCrc = document.getElementById('calc_crc');

    /**
     * calcularColones()
     * 
     * Convierte el valor ingresado en dólares a colones,
     * utilizando la tasa de cambio obtenida desde main.js.
     */
    function calcularColones() {

        // Validación defensiva
        if (!inputUsd || !inputCrc) return;

        const usdValue = parseFloat(inputUsd.value);

        /**
         * Se verifica:
         * - Que el valor ingresado sea numérico
         * - Que la tasa de cambio ya esté disponible
         */
        if (!isNaN(usdValue) && window.tasaCambioActual) {
            const crcValue = usdValue * window.tasaCambioActual;

            // Formateo del resultado en formato local de Costa Rica
            inputCrc.value = new Intl.NumberFormat('es-CR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(crcValue);
        } else {
            // Si no hay valor o tasa, se limpia el campo
            inputCrc.value = '';
        }
    }

    /* ======================================================
       Eventos para la calculadora
       ====================================================== */
    if (inputUsd) {

        /**
         * Conversión en tiempo real cada vez
         * que el usuario escribe en el campo USD.
         */
        inputUsd.addEventListener('input', calcularColones);

        /**
         * Escucha de evento personalizado disparado
         * desde main.js cuando el tipo de cambio termina
         * de cargarse desde la API REST.
         * 
         * Esto garantiza que la calculadora funcione
         * incluso si el API responde después de cargar la página.
         */
        $(document).on('tasaCambioCargada', calcularColones);
    }
});
