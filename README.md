# Generador de Widget WhatsApp

Este proyecto proporciona un generador visual para crear widgets de WhatsApp personalizables que pueden integrarse fácilmente en cualquier sitio web. El widget se implementa como un Web Component con Shadow DOM para aislamiento de estilos y no depende de frameworks externos.

## Características

- **Web Component** autocontenido con Shadow DOM
- **Personalización completa** a través de atributos
- **Diseño responsive** para móviles y escritorio
- **Accesibilidad** según WCAG 2.1 AA
- **API de eventos** para integración avanzada
- **Generador visual** con previsualización en tiempo real
- **Almacenamiento** de configuraciones en localStorage

## Estructura del Proyecto

```
wa-widget-generator/
├── src/
│   ├── widget.js       # Web Component autocontenido
│   └── index.html      # Interfaz del generador
├── test/
│   └── test.html       # Página de pruebas
└── README.md           # Documentación
```

## Uso del Generador

1. Abre `index.html` en tu navegador
2. Configura el widget según tus preferencias:
   - Color, texto y posición del botón
   - Nombre de marca, mensaje de bienvenida y número de teléfono
   - URL del logo y mensaje precargado
3. Visualiza en tiempo real cómo se verá el widget
4. Haz clic en "Generar Código del Widget" para obtener el snippet
5. Copia el código generado y pégalo en el `<body>` de tu sitio web

## Atributos del Widget

| Atributo      | Tipo   | Descripción                                                                   | Ejemplo                         |
| ------------- | ------ | ----------------------------------------------------------------------------- | ------------------------------- |
| `phone`       | String | Número con código de país, sin signos.                                        | `519900012345`                  |
| `brand`       | String | Nombre de la marca mostrado en cabecera.                                      | `Wati`                          |
| `color`       | Hex    | Color primario del widget (burbuja, acentos).                                 | `#008785`                       |
| `bubble-text` | String | Texto visible junto a la burbuja (máx. 24 car.).                              | `Chat with us`                  |
| `welcome`     | String | Mensaje de bienvenida (máx. 40 car.).                                         | `Hi there! How can I help you?` |
| `preset`      | String | Mensaje precargado en WhatsApp; admite tokens: `{page_link}`, `{page_title}`. | `Hello, I have a question…`     |
| `position`    | Enum   | `bottom-right` (default) \| `bottom-left`.                                    | `bottom-right`                  |
| `open`        | Bool   | `true` = abre el widget al cargar la página.                                  | `false`                         |
| `logo`        | URL    | Ruta de imagen de la marca mostrada en el widget.                             | `https://…/logo.svg`            |
| `lang`        | Enum   | Idioma de textos internos (`es`, `en`, etc.).                                 | `es`                            |
| `email`       | String | (Opcional) correo de contacto para analytics.                                 | `user@dominio.com`              |

## Ejemplo de Integración

```html
<!-- Paso 1: incluir el script desde CDN -->
<script async src="https://cdn.ejemplo.com/wa-widget@1.0.0/widget.js"></script>

<!-- Paso 2: colocar el elemento personalizado donde quieras (normalmente al final del body) -->
<wa-widget
  phone="519900012345"
  brand="LiveConnect"
  color="#008785"
  bubble-text="Chatea con nosotros"
  welcome="¿Tienes alguna pregunta? Estamos aquí para ayudarte."
  preset="Hola, tengo una consulta sobre {page_title} ({page_link})"
  position="bottom-right"
  open="false"
  logo="https://dominio.com/logo.svg"
  lang="es"
></wa-widget>
```

## API de Eventos

El widget dispara los siguientes eventos personalizados:

| Evento JavaScript | Descripción                                 |
| ----------------- | ------------------------------------------- |
| `wa:opened`       | Se dispara cuando el widget se expande.     |
| `wa:closed`       | Se dispara cuando el usuario lo minimiza.   |
| `wa:click`        | Se dispara al hacer clic en el botón de WA. |

Ejemplo de uso:

```js
document.querySelector('wa-widget').addEventListener('wa:click', () => {
  console.log('El usuario irá a WhatsApp');
});
```

## Personalización Avanzada

El widget utiliza CSS Custom Properties que pueden ser sobrescritas para una personalización más avanzada:

```css
wa-widget {
  --wa-color: #008785;
  --wa-text-color: white;
  --wa-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --wa-panel-width: 360px;
  --wa-bubble-size: 60px;
  --wa-border-radius: 16px;
}
```

## Accesibilidad

El widget cumple con las pautas WCAG 2.1 nivel AA:

- Navegación completa por teclado (Tab, Enter, Escape)
- Atributos ARIA apropiados (role="dialog", aria-expanded, aria-labelledby)
- Alto contraste y textos alternativos

## Despliegue

Para desplegar el widget en producción:

1. Sube el archivo `widget.js` a tu CDN
2. Actualiza la URL en el snippet generado
3. Integra el snippet en tu sitio web

## Pruebas

Abre `test/test.html` para ejecutar pruebas automatizadas que verifican:

- Integración básica del widget
- Funcionamiento de la API de eventos
- Procesamiento de tokens en mensajes
- Accesibilidad y atributos ARIA
- Respuesta a cambios de atributos

## Limitaciones y Consideraciones

- El widget no establece cookies ni rastrea al usuario
- Solo genera la URL oficial `wa.me` y no envía datos a terceros
- Es compatible con Content Security Policy (sin `eval`, sin `inline-script`)
- El tamaño total del widget es menor a 20 kB gzip
