class WAWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = this.dataset.open === 'true';
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.matches('.wa-bubble')) {
        this.toggle();
      } else if (e.target.matches('.wa-close')) {
        this.toggle(false);
      } else if (e.target.matches('.wa-cta')) {
        this.dispatchEvent(new CustomEvent('wa:click'));
      }
    });
  }

  toggle(force) {
    const shouldOpen = typeof force === 'boolean' ? force : !this._open;
    this._open = shouldOpen;
    this.render();
    this.dispatchEvent(new CustomEvent(shouldOpen ? 'wa:opened' : 'wa:closed'));
  }

  render() {
    const d = this.dataset;
    const color = d.color || '#25d366';
    const position = d.position === 'bottom-left' ? 'left' : 'right';
    const bubbleText = d.bubbleText || '';
    const logo = d.logo || '';
    const brand = d.brand || 'WhatsApp';
    const welcome = d.welcome || '';
    const preset = encodeURIComponent((d.preset || '').replace('{page_link}', location.href).replace('{page_title}', document.title));
    const phone = d.phone || '';
    const waUrl = `https://wa.me/${phone}?text=${preset}`;
    const dialog = this._open ? `<div class="wa-dialog" role="dialog" aria-labelledby="wa-title">
        <div class="wa-header">
          ${logo ? `<img src="${logo}" alt="${brand}" class="wa-logo">` : ''}
          <span id="wa-title" class="wa-brand">${brand}</span>
          <button class="wa-close" aria-label="close">×</button>
        </div>
        <div class="wa-body">${welcome}</div>
        <a class="wa-cta" href="${waUrl}" target="_blank" rel="noopener">+ Chatea con nosotros</a>
      </div>` : '';
    const bubbleLabel = this._open ? 'Close chat' : 'Open chat';
    const bubble = `<div class="wa-bubble" aria-label="${bubbleLabel}" aria-expanded="${this._open}" role="button" tabindex="0">
        <svg viewBox="0 0 24 24" class="wa-icon" aria-hidden="true"><path fill="currentColor" d="M16.2,12.1c-0.2-0.1-1.1-0.5-1.3-0.6c-0.2-0.1-0.3-0.1-0.5,0.1c-0.2,0.3-0.6,0.7-0.7,0.8 c-0.1,0.1-0.3,0.1-0.5,0c-0.2-0.1-0.9-0.3-1.7-1c-0.6-0.6-1-1.3-1.2-1.5c-0.1-0.2,0-0.3,0.1-0.4c0.1-0.1,0.2-0.3,0.3-0.4 c0.1-0.1,0.1-0.2,0.2-0.3c0.1-0.1,0.1-0.2,0.2-0.3c0.1-0.1,0.1-0.2,0.2-0.3c0-0.1,0-0.3,0-0.4c0-0.1-0.5-1.2-0.7-1.6 c-0.2-0.5-0.4-0.4-0.5-0.4c-0.1,0-0.3-0.1-0.5-0.1c-0.2,0-0.4,0-0.5,0.2c-0.1,0.2-0.7,0.7-0.7,1.7c0,1,0.7,2,0.8,2.1 c0.1,0.1,1.3,2,3.1,2.7c1.3,0.5,1.9,0.5,2.5,0.4c0.4-0.1,1.1-0.4,1.2-0.9c0.2-0.5,0.2-0.9,0.1-0.9C16.5,12.2,16.4,12.2,16.2,12.1z"/></svg>
        ${bubbleText ? `<span class="wa-bubble-text">${bubbleText}</span>` : ''}
      </div>`;
    const styles = `<style>
      :host{position:fixed;${position}:1rem;bottom:1rem;z-index:9999;font-family:sans-serif}
      .wa-bubble{background:${color};color:#fff;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.3);position:relative;transition:opacity .3s,transform .3s}
      .wa-bubble-text{position:absolute;${position === 'left' ? 'left:70px' : 'right:70px'};white-space:nowrap;background:${color};padding:0.4em 0.6em;border-radius:20px;font-size:14px}
      .wa-dialog{background:#fff;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.2);width:360px;max-width:100vw;overflow:hidden;margin-bottom:8px;display:flex;flex-direction:column}
      .wa-header{background:${color};color:#fff;padding:0.5em;display:flex;align-items:center}
      .wa-logo{width:32px;height:32px;margin-right:8px}
      .wa-brand{flex-grow:1;font-weight:bold}
      .wa-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer}
      .wa-body{padding:1em;font-size:14px;color:#333}
      .wa-cta{margin:0.5em;border-radius:4px;text-align:center;background:${color};color:#fff;text-decoration:none;padding:0.5em 1em;font-weight:bold}
    </style>`;
    this.shadowRoot.innerHTML = styles + dialog + bubble;
  }
}

customElements.define('wa-widget', WAWidget);
