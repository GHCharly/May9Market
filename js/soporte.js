/**
 * ==========================================================
 * Lógica para la página de Soporte
 * ==========================================================
 *
 * Este archivo contiene la lógica JavaScript específica para
 * la página soporte.html. Sus responsabilidades son:
 *
 * - Calcular automáticamente la edad a partir de la fecha
 *   de nacimiento ingresada por el usuario.
 * - Almacenar la edad en un campo oculto del formulario.
 * - Validar el formulario antes del envío.
 * - Integrarse con validaciones HTML5 y Bootstrap.
 *
 * Tecnologías utilizadas:
 * - JavaScript puro
 * - API de Fechas (Date)
 * - Validación HTML5
 */

/* ==========================================================
   Inicialización cuando el DOM está completamente cargado
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Referencia al input de fecha de nacimiento.
     */
    const inputFechaNacimiento = document.getElementById('fecha_nacimiento');

    /**
     * Referencia al campo oculto donde se almacenará la edad calculada.
     * Este campo es enviado junto con el formulario.
     */
    const inputEdadOculta = document.getElementById('edad_calculada');

    const form = document.getElementById('formSoporte');

    /* ======================================================
       Cálculo automático de la edad
       ====================================================== */

    /**
     * Se calcula la edad cada vez que el usuario cambia
     * la fecha de nacimiento.
     */
    if (inputFechaNacimiento) {
        inputFechaNacimiento.addEventListener('change', function () {

            // Validación defensiva
            if (this.value) {
                const [year, month, day] = this.value.split('-').map(Number);
                const fechaNac = new Date(year, month - 1, day); // Mes es 0-indexado
                const hoy = new Date();

                // Cálculo inicial por diferencia de años
                let edad = hoy.getFullYear() - fechaNac.getFullYear();

                // Ajuste si aún no ha cumplido años este año
                const m = hoy.getMonth() - fechaNac.getMonth();

                if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
                    edad--;
                }

                // Asignación de la edad al input oculto
                if (inputEdadOculta) {
                    inputEdadOculta.value = edad;

                    //Para depurar, mostrar la edad calculada en la consola
                    console.log("Edad calculada y asignada al campo oculto: " + edad);
                }
            }
        });
    }


    /* ======================================================
       Validaciones y envío del formulario de soporte
       ====================================================== */

    /**
     * Referencia al formulario.
     * Se utiliza querySelector para evitar error
     * si el script se carga en otra página.
     */
    if (form) {
        form.addEventListener('submit', function (event) {

            event.preventDefault(); // Control total desde JS

            // Validación del nombre completo (solo letras y espacios)
            const nombreInput = document.getElementById('nombre_completo');


            if (nombreInput) {
                nombreInput.addEventListener('input', () => {
                    // Mientras el usuario escribe, limpiamos el error
                    nombreInput.setCustomValidity('');
                    nombreInput.classList.remove('is-invalid');
                });
            }

            if (nombreInput) {
                const regexNombre = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

                // SIEMPRE limpia antes de evaluar
                nombreInput.setCustomValidity('');

                if (!regexNombre.test(nombreInput.value.trim())) {
                    nombreInput.setCustomValidity(
                        'El nombre solo puede contener letras y espacios.'
                    );
                } else {
                    nombreInput.setCustomValidity('');
                }
            }
            /**
             * Integración con validación HTML5:
             * Si el formulario no es válido,
             * se bloquea el envío.
             */
            if (!form.checkValidity()) {
                event.preventDefault();

                /**
                * Clase de Bootstrap para mostrar
                * visualmente los estados de validación.
                */
                form.classList.add('was-validated');

            } else {
                /**
                 * Si el formulario es válido,
                 * se muestra un mensaje informativo
                 * al usuario.
                 */
                alert("La información ha sido ingresada correctamente. Se abrirá su correo para enviar la solicitud de soporte.");

                // Obtener valores del formulario
                const nombre = form.querySelector('[name="nombre"]').value;
                const email = form.querySelector('[name="email"]').value;
                const fechaNacimientoISO = form.querySelector('[name="fecha_nacimiento"]').value;
                const [year, month, day] = fechaNacimientoISO.split('-');
                const fechaNacimiento = `${day}/${month}/${year}`;
                const edad = inputEdadOculta.value;
                const genero = form.querySelector('[name="genero"]').value;
                const grado = form.querySelector('[name="grado_academico"]').value;
                const mensaje = form.querySelector('[name="mensaje"]').value;

                // Construir correo
                const asunto = encodeURIComponent('Solicitud de Soporte - May 9 Market' + (nombre ? ` - ${nombre}` : ''));

                const cuerpo = encodeURIComponent(
                    `Solicitud de Soporte\n\n` +
                    `Nombre: ${nombre}\n` +
                    `Correo: ${email}\n` +
                    `Fecha de nacimiento: ${fechaNacimiento}\n` +
                    `Edad: ${edad} años\n` +
                    `Género: ${genero}\n` +
                    `Grado Académico: ${grado}\n\n` +
                    `Mensaje:\n${mensaje}`
                );

                // Abrir cliente de correo
                window.location.href =
                    `mailto:may9thmarket@outlook.com?subject=${asunto}&body=${cuerpo}`;

                // Limpiar formulario
                form.reset();

                // Limpiar validaciones personalizadas
                form.querySelectorAll('input, textarea, select')
                    .forEach(input => input.setCustomValidity(''));

                // Limpiar estado visual Bootstrap
                form.classList.remove('was-validated');
            }
        }, false);
    }
});
