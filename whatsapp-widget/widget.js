/**
 * WhatsApp Widget Web Component
 * Versión 1.1.0
 * 
 * Un componente web personalizado para añadir un botón flotante de WhatsApp
 * a cualquier sitio web, totalmente personalizable y con Shadow DOM.
 */

class WhatsAppWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    // Temporizador para la animación intermitente
    this._idleAnimationTimer = null;
  }
  /**
   * Lanza la animación 'tada' una sola vez.
   */
  animateBubble() {
    const bubble = this.shadowRoot.querySelector('.wa-widget-bubble');
    if (!bubble) return;
    // Reinicia la animación eliminando y volviendo a añadir la clase
    bubble.classList.remove('wa-widget-bubble--animated');
    // Fuerza re‑flow para reiniciar la animación CSS
    void bubble.offsetWidth;
    bubble.classList.add('wa-widget-bubble--animated');
  }

  /**
   * Inicia la animación cada 6 s mientras el widget esté cerrado.
   */
  startIdleAnimation() {
    // Disparar inmediatamente una primera animación
    this.animateBubble();
    // Asegurarse de no crear múltiples timers
    this.stopIdleAnimation();
    this._idleAnimationTimer = setInterval(() => this.animateBubble(), 6000);
  }

  /**
   * Detiene la animación cuando el widget se abre.
   */
  stopIdleAnimation() {
    if (this._idleAnimationTimer) {
      clearInterval(this._idleAnimationTimer);
      this._idleAnimationTimer = null;
    }
    const bubble = this.shadowRoot.querySelector('.wa-widget-bubble');
    if (bubble) bubble.classList.remove('wa-widget-bubble--animated');
  }

  static get observedAttributes() {
    return [
      'phone', 'brand', 'color', 'bubble-text', 'welcome', 'preset',
      'position', 'open', 'logo', 'lang', 'email', 'delay'
    ];
  }

  connectedCallback() {
    // Inicializar el widget cuando se conecta al DOM
    this.render();
    
    // Configurar estado inicial (abierto o cerrado)
    this.isOpen = this.getAttribute('open') === 'true';
    this.updateWidgetState();
      // Iniciar animación si arranca cerrado
      if (!this.isOpen) {
        this.startIdleAnimation();
      }
    // Reemplazar tokens en el mensaje preestablecido
    this.processPresetTokens();
    
    // Aplicar retraso si está configurado
    const delay = parseInt(this.getAttribute('delay') || '0', 10);
    if (delay > 0) {
      // Ocultar inicialmente el widget
      const container = this.shadowRoot.querySelector('.wa-widget-container');
      container.style.opacity = '0';
      container.style.visibility = 'hidden';
      
      // Mostrar después del retraso con animación
      setTimeout(() => {
        container.style.visibility = 'visible';
        container.style.opacity = '1';
      }, delay * 1000);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Re-renderizar cuando cambian los atributos
    if (this.shadowRoot && oldValue !== newValue) {
      this.render();
      
      if (name === 'open') {
        this.isOpen = newValue === 'true';
        this.updateWidgetState();
      }
    }
  }

  processPresetTokens() {
    let preset = this.getAttribute('preset') || '';
    
    // Reemplazar tokens con valores reales
    if (preset.includes('{page_link}')) {
      preset = preset.replace('{page_link}', window.location.href);
    }
    
    if (preset.includes('{page_title}')) {
      preset = preset.replace('{page_title}', document.title);
    }
    
    this.processedPreset = encodeURIComponent(preset);
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
    this.updateWidgetState();
    
    // Disparar evento personalizado
    const eventName = this.isOpen ? 'wa:opened' : 'wa:closed';
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true
    }));
  }

  updateWidgetState() {
    const bubble = this.shadowRoot.querySelector('.wa-widget-bubble');
    const panel = this.shadowRoot.querySelector('.wa-widget-panel');
    if (this.isOpen) {
      panel.classList.add('wa-widget-panel--open');
      bubble.setAttribute('aria-expanded', 'true');
      this.stopIdleAnimation();
    } else {
      panel.classList.remove('wa-widget-panel--open');
      bubble.setAttribute('aria-expanded', 'false');
      this.startIdleAnimation();
    }
  }

  handleChatClick() {
    // Construir URL de WhatsApp
    const phone = this.getAttribute('phone') || '';
    const url = `https://wa.me/${phone}?text=${this.processedPreset}`;
    
    // Disparar evento personalizado
    this.dispatchEvent(new CustomEvent('wa:click', {
      bubbles: true,
      composed: true
    }));
    
    // Abrir WhatsApp en nueva pestaña
    window.open(url, '_blank');
  }

  handleKeyDown(event) {
    // Cerrar el widget al presionar Escape
    if (event.key === 'Escape' && this.isOpen) {
      this.toggleWidget();
    }
  }

  render() {
    // Obtener atributos con valores predeterminados
    const phone = this.getAttribute('phone') || '';
    const brand = this.getAttribute('brand') || 'LiveConnect';
    const color = this.getAttribute('color') || '#008785';
    const bubbleText = this.getAttribute('bubble-text') || 'Chat with us';
    const welcome = this.getAttribute('welcome') || 'Hi there! How can I help you?';
    const position = this.getAttribute('position') || 'bottom-right';
    const logo = this.getAttribute('logo') || '';
    const lang = this.getAttribute('lang') || 'es';
    
    // Traducción básica de textos internos
    const translations = {
      es: {
        chatWithUs: 'Chatea con nosotros',
        poweredBy: 'Desarrollado por'
      },
      en: {
        chatWithUs: 'Chat with us',
        poweredBy: 'Powered by'
      }
    };
    
    // Usar idioma predeterminado si no está disponible
    const t = translations[lang] || translations.en;

    // Crear estilos y HTML
    const footerLink = `<a href="https://liveconnect.chat?utm_source=widget&utm_medium=referral&utm_campaign=wa_widget" target="_blank" style="color: inherit; text-decoration: none;">LiveConnect®</a>`;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --wa-color: ${color};
          --wa-text-color: white;
          --wa-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
          --wa-panel-width: 360px;
          --wa-bubble-size: 60px;
          --wa-border-radius: 16px;
          
          font-family: var(--wa-font);
          font-size: 16px;
          line-height: 1.5;
          box-sizing: border-box;
        }
        
        *, *::before, *::after {
          box-sizing: inherit;
          margin: 0;
          padding: 0;
        }
        
        .wa-widget-container {
          position: fixed;
          z-index: 999999;
          ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
          bottom: 20px;
          font-family: var(--wa-font);
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        .wa-widget-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
          animation: waFadeIn 0.5s ease-in-out;
        }
        
        .wa-widget-bubble-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--wa-bubble-size);
          height: var(--wa-bubble-size);
          border-radius: 50%;
          background-color: var(--wa-color);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
        }
        
        .wa-widget-bubble-btn:hover {
          transform: scale(1.05);
        }
        
        .wa-widget-bubble-btn svg {
          width: 60%;
          height: 60%;
          fill: var(--wa-text-color);
        }
        
        .wa-widget-bubble-text {
          background-color: var(--wa-color);
          color: var(--wa-text-color);
          padding: 8px 16px;
          border-radius: 18px;
          margin-right: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 500;
        }
        
        .wa-widget-panel {
          position: absolute;
          bottom: calc(var(--wa-bubble-size) + 10px);
          ${position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
          width: var(--wa-panel-width);
          background-color: white;
          border-radius: var(--wa-border-radius);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          transform-origin: bottom;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: -1;
        }
        
        .wa-widget-panel--open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
          z-index: 1000000;
        }
        
        .wa-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background-color: var(--wa-color);
          color: var(--wa-text-color);
        }
        
        .wa-widget-header-info {
          display: flex;
          align-items: center;
        }
        
        .wa-widget-header-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 12px;
          background-color: white;
          overflow: hidden;
        }
        
        .wa-widget-header-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .wa-widget-header-title {
          font-size: 16px;
          font-weight: 600;
        }
        
        .wa-widget-close {
          cursor: pointer;
          padding: 4px;
        }
        
        .wa-widget-close svg {
          width: 16px;
          height: 16px;
          fill: var(--wa-text-color);
        }
        
        .wa-widget-body {
          padding: 20px 16px;
        }
        
        .wa-widget-message {
          background-color: #f0f0f0;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          max-width: 85%;
        }

        /* Ajustes para listas dentro del mensaje */
        .wa-widget-message ol,
        .wa-widget-message ul {
          margin: 0;            /* eliminar sangría por defecto */
          padding-left: 0;      /* alinear con el resto del texto */
          list-style-position: inside; /* viñetas/números dentro del bloque */
        }

        .wa-widget-message li {
          margin-left: 0;       /* sin sangría adicional */
        }
        
        .wa-widget-message img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        
        .wa-widget-cta {
          display: block;
          width: 100%;
          padding: 12px;
          background-color: var(--wa-color);
          color: var(--wa-text-color);
          border: none;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }
        
        .wa-widget-cta:hover {
          filter: brightness(1.1);
        }
        
        .wa-widget-cta svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
          vertical-align: middle;
          margin-right: 8px;
        }
        
        .wa-widget-footer {
          padding: 8px 16px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #f0f0f0;
        }

        /* Animación de la burbuja cuando el widget está cerrado */
        @keyframes waTada {
          0%   { transform: scale3d(1, 1, 1); }
          10%, 20% { transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg); }
          30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
          40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
          100% { transform: scale3d(1, 1, 1); }
        }

        .wa-widget-bubble--animated {
          animation: waTada 1s ease-in-out;
        }

        @keyframes waFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          .wa-widget-panel {
            width: 100vw;
            ${position === 'bottom-left' ? 'left: -20px;' : 'right: -20px;'}
            border-radius: var(--wa-border-radius) var(--wa-border-radius) 0 0;
          }
        }
      </style>
      
      <div class="wa-widget-container">
        <div class="wa-widget-panel" role="dialog" aria-labelledby="wa-header-title">
          <div class="wa-widget-header">
            <div class="wa-widget-header-info">
              ${logo ? `
                <div class="wa-widget-header-logo">
                  <img src="${logo}" alt="${brand} logo" />
                </div>
              ` : ''}
              <div class="wa-widget-header-title" id="wa-header-title">${brand}</div>
            </div>
            <div class="wa-widget-close" aria-label="Cerrar">
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
          </div>
          <div class="wa-widget-body">
            <div class="wa-widget-message">${welcome}</div>
            <button class="wa-widget-cta">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 2 .6 3.9 1.6 5.4L2 22l4.6-1.2c1.5.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.1l-.3-.2-3.1.8.8-3-.2-.3c-.8-1.3-1.2-2.8-1.2-4.4 0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8zm4.7-5.9c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1-.1.2-.6.7-.7.9-.1.1-.3.2-.5.1s-1-.4-1.9-1.2c-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.2.4-.4.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.4 2.1 3.3 2.9 2 .8 2 .5 2.3.5.3-.1 1.3-.5 1.5-1.1.2-.5.2-.9.1-1z"/>
              </svg>
              ${t.chatWithUs}
            </button>
          </div>
          <div class="wa-widget-footer">
            ${t.poweredBy} ${footerLink}
          </div>
        </div>
        
        <div class="wa-widget-bubble" tabindex="0" aria-expanded="false" aria-controls="wa-widget-panel">
          ${bubbleText ? `<div class="wa-widget-bubble-text">${bubbleText}</div>` : ''}
          <div class="wa-widget-bubble-btn">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 2 .6 3.9 1.6 5.4L2 22l4.6-1.2c1.5.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.1l-.3-.2-3.1.8.8-3-.2-.3c-.8-1.3-1.2-2.8-1.2-4.4 0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8zm4.7-5.9c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1-.1.2-.6.7-.7.9-.1.1-.3.2-.5.1s-1-.4-1.9-1.2c-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.2.4-.4.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.7.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.4 2.1 3.3 2.9 2 .8 2 .5 2.3.5.3-.1 1.3-.5 1.5-1.1.2-.5.2-.9.1-1z"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    // Agregar event listeners
    const bubble = this.shadowRoot.querySelector('.wa-widget-bubble');
    const closeBtn = this.shadowRoot.querySelector('.wa-widget-close');
    const chatBtn = this.shadowRoot.querySelector('.wa-widget-cta');
    
    bubble.addEventListener('click', () => this.toggleWidget());
    bubble.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleWidget();
      }
    });
    // Relanzar animación al pasar el mouse
    bubble.addEventListener('mouseenter', () => this.animateBubble());
    
    closeBtn.addEventListener('click', () => this.toggleWidget());
    chatBtn.addEventListener('click', () => this.handleChatClick());
    
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }
}

// Registrar el componente personalizado
customElements.define('wa-widget', WhatsAppWidget);

// Función para obtener el script actual
function getCurrentScript() {
  // Intentar obtener el script actual
  if (document.currentScript) {
    return document.currentScript;
  }
  
  // Fallback para navegadores que no soportan currentScript
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i];
    if (script.src && script.src.includes('whatsapp-widget')) {
      return script;
    }
  }
  
  return null;
}

// Función para inicializar el widget desde los atributos del script
function initWidgetFromScriptAttributes() {
  const script = getCurrentScript();
  if (!script) return;
  
  // Lista de atributos válidos
  const validAttributes = [
    'phone', 'brand', 'color', 'bubble-text', 'welcome', 'preset',
    'position', 'open', 'logo', 'lang', 'email', 'delay'
  ];
  
  // Crear elemento wa-widget
  const widget = document.createElement('wa-widget');
  let hasAnyAttr = false;   // bandera para saber si el script define al menos un atributo de configuración

  // Transferir atributos del script al widget
  validAttributes.forEach(attr => {
    if (script.hasAttribute(attr)) {
      widget.setAttribute(attr, script.getAttribute(attr));
      hasAnyAttr = true;
    }
  });

  // Evita crear un widget vacío si el script no define ningún atributo.
  if (!hasAnyAttr) return null;
  
  // Añadir al DOM
  document.body.appendChild(widget);
  
  return widget;
}

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar desde atributos del script
  initWidgetFromScriptAttributes();
  
  // Mantener compatibilidad con la configuración global
  if (window.waWidgetConfig) {
    const widget = document.createElement('wa-widget');
    
    // Configurar atributos desde el objeto global
    Object.entries(window.waWidgetConfig).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        widget.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value.toString());
      }
    });
    
    // Añadir al DOM
    document.body.appendChild(widget);
  }
});

// Exponer función de inicialización manual
window.initWhatsAppWidget = function(config = {}) {
  const widget = document.createElement('wa-widget');
  
  // Configurar atributos
  Object.entries(config).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      widget.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value.toString());
    }
  });
  
  // Añadir al DOM
  document.body.appendChild(widget);
  
  return widget;
};
