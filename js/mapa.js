/**
 * =========================================
 * Gestión del Mapa - Google Maps API
 * =========================================
 * 
 * Archivo: mapa.js
 * Descripción: Inicializa y configura el mapa de Google Maps para mostrar
 * la ubicación de May 9 Market en Alajuela, Costa Rica.
 * 
 * Dependencias:
 *   - API de Google Maps (incluida en mapa.html)
 *   - Navegador con soporte de Geolocalización
 * 
 * Funciones principales:
 *   - initMap(): Función callback que se ejecuta cuando la API de Google Maps carga
 */

/**
 * Inicializa el mapa de Google Maps y configura la ruta desde la ubicación del usuario
 * 
 * Comportamiento:
 * 1. Define la ubicación base en Alajuela Centro
 * 2. Crea un mapa centrado en esa ubicación con zoom 14
 * 3. Intenta obtener la ubicación actual del usuario mediante geolocalización
 * 4. Si la geolocalización es exitosa, calcula y muestra la ruta desde el usuario hasta Alajuela Centro
 * 5. Si falla, solo muestra un marcador en Alajuela Centro
 * 
 * Nota: Esta función es llamada como callback en el atributo "callback=initMap" 
 * del script de la API de Google Maps
 */
function initMap() {
    // =========================================
    // CONFIGURACIÓN INICIAL DEL MAPA
    // =========================================
    // Ubicación base: Centro de Alajuela, Costa Rica
    // Coordenadas: 10.01700° N, 84.21360° O
    const alajuelaCentro = { lat: 10.01700, lng: -84.21360 };

    // Crear la instancia del mapa
    // Parámetros:
    //   - element: div con id "map" donde se renderizará el mapa
    //   - zoom: nivel de zoom inicial (14 = nivel ciudad)
    //   - center: coordenadas donde se centra el mapa
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: alajuelaCentro,
    });

    // =========================================
    // SERVICIO DE DIRECCIONES (DIRECTIONS API)
    // =========================================
    // Crea un servicio de direcciones para calcular rutas
    const directionsService = new google.maps.DirectionsService();
    
    // Crea un renderizador de direcciones para visualizar la ruta
    // suppressMarkers: true indica que no mostrar los marcadores de origen/destino
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    directionsRenderer.setMap(map);

    // =========================================
    // OBTENCIÓN DE GEOLOCALIZACIÓN DEL USUARIO
    // =========================================
    // Verifica si el navegador soporta la API de Geolocalización
    if (navigator.geolocation) {
        // Intenta obtener la posición actual del usuario
        navigator.geolocation.getCurrentPosition(
            // Callback en caso de éxito
            (posicion) => {
                // Extrae las coordenadas del usuario
                const userPos = {
                    lat: posicion.coords.latitude,
                    lng: posicion.coords.longitude,
                };

                // =========================================
                // CÁLCULO Y VISUALIZACIÓN DE LA RUTA
                // =========================================
                // Solicita el cálculo de la ruta en automóvil
                directionsService.route({
                    origin: userPos,                              // Punto de inicio (ubicación del usuario)
                    destination: alajuelaCentro,                  // Punto final (Alajuela Centro)
                    travelMode: google.maps.TravelMode.DRIVING,   // Modo de viaje: conducción
                }, (respuesta, estado) => {
                    // Verifica si la solicitud fue exitosa
                    if (estado === "OK") {
                        // Muestra la ruta en el mapa
                        directionsRenderer.setDirections(respuesta);
                        
                        // Obtiene información sobre el primer tramo de la ruta
                        const leg = respuesta.routes[0].legs[0];
                        
                        // Crea marcador para la ubicación del usuario
                        // (inicio de la ruta)
                        new google.maps.Marker({
                            position: leg.start_location,
                            map: map,
                            title: "Tu ubicación"
                        });
                        
                        // Crea marcador para nuestro punto de encuentro
                        // (fin de la ruta)
                        new google.maps.Marker({
                            position: leg.end_location,
                            map: map,
                            title: "Nuestro punto de encuentro"
                        });
                    } else {
                        // Si el cálculo de ruta falla (ej: ubicación muy lejana)
                        console.warn("La solicitud de direcciones falló: " + estado);
                        
                        // Mostrar solo un marcador en Alajuela Centro como fallback
                        new google.maps.Marker({
                            position: alajuelaCentro,
                            map: map,
                            title: "Nuestro punto de encuentro"
                        });
                    }
                });
            },
            // Callback en caso de error o rechazo de permisos
            () => {
                // El usuario rechazó los permisos de geolocalización
                // o ocurrió un error. Mostrar solo el marcador de Alajuela Centro
                new google.maps.Marker({
                    position: alajuelaCentro,
                    map: map,
                    title: "Nuestro punto de encuentro"
                });
            }
        );
    } else {
        // El navegador no soporta la API de Geolocalización
        // Mostrar solo un marcador en Alajuela Centro como fallback
        new google.maps.Marker({
            position: alajuelaCentro,
            map: map,
            title: "Nuestro punto de encuentro"
        });
    }
}