/**
 * Hurricane Solution Cotizador Widget — port del plugin WordPress (Fase 5.10).
 * Postea a /api/lead (no al webhook Make.com directo) — el webhook está oculto en el server.
 */

type Zone = 'continental' | 'islas' | 'foranea';

interface UbicacionEntry {
  nombre: string;
  estado: string;
  zona: Zone;
}

interface PrecioRange {
  min: number;
  max: number;
  nota: string;
}

const ubicaciones: UbicacionEntry[] = [
  { nombre: 'Cancún', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Playa del Carmen', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Tulum', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Puerto Morelos', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Puerto Aventuras', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Akumal', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Xpu-Ha', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Chemuyil', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Xcaret', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Xel-Há', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Bacalar', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Chetumal', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Felipe Carrillo Puerto', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Leona Vicario', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Mahahual', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Riviera Maya', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Playacar', estado: 'Quintana Roo', zona: 'continental' },
  { nombre: 'Cozumel', estado: 'Quintana Roo', zona: 'islas' },
  { nombre: 'Isla Mujeres', estado: 'Quintana Roo', zona: 'islas' },
  { nombre: 'Holbox', estado: 'Quintana Roo', zona: 'islas' },
];

const precios: Record<Zone, PrecioRange> = {
  continental: {
    min: 130,
    max: 170,
    nota: 'Este rango es solo orientativo. El precio real se determina tras una visita técnica y puede variar según las características del proyecto.',
  },
  islas: {
    min: 140,
    max: 180,
    nota: 'Por cuestiones de logística y traslado, el precio en islas es ligeramente mayor. El costo final depende de las características constructivas, arquitectónicas, el metraje total y el tipo de sistema.',
  },
  foranea: {
    min: 150,
    max: 190,
    nota: 'Para zonas fuera del área principal de servicio, es necesario un metraje mínimo de 200 m². El precio final depende de las características constructivas, arquitectónicas y el tipo de sistema.',
  },
};

const tiposPrioritarios = new Set(['hotel', 'proyecto_construccion', 'torre']);

const tiposLabels: Record<string, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  hotel: 'Hotel',
  comercio: 'Comercio',
  proyecto_construccion: 'Proyecto en Construcción',
  torre: 'Torre con varios Departamentos',
};

const zoneLabel: Record<Zone, string> = {
  continental: 'Continental',
  islas: 'Islas',
  foranea: 'Foranea',
};

const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

const normalize = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const detectZone = (text: string): Zone => {
  const norm = normalize(text);
  const exact = ubicaciones.find((u) => normalize(u.nombre) === norm);
  if (exact) return exact.zona;
  if (/(cancun|playa|tulum|carmen|riviera|maya)/.test(norm)) return 'continental';
  if (/(cozumel|isla|holbox)/.test(norm)) return 'islas';
  return 'foranea';
};

const filterLocations = (query: string): UbicacionEntry[] => {
  if (query.length < 2) return [];
  const q = normalize(query);
  return ubicaciones
    .filter((u) => normalize(u.nombre).includes(q) || normalize(u.estado).includes(q))
    .slice(0, 6);
};

declare const gtag: ((...args: unknown[]) => void) | undefined;
declare const fbq: ((...args: unknown[]) => void) | undefined;

const trackEvent = (name: string, params: Record<string, unknown> = {}): void => {
  if (typeof gtag === 'function') gtag('event', name, params);
  if (typeof fbq === 'function') fbq('trackCustom', name, params);
};

export function initCotizadorWidget(): void {
  const formSection = $('hurricaneFormSection');
  if (!formSection) return;

  const locationInput = $<HTMLInputElement>('hurricaneLocationInput');
  const autocomplete = $('hurricaneAutocomplete');
  const propertySelect = $<HTMLSelectElement>('hurricanePropertySelect');
  const priceBox = $('hurricanePriceBox');
  const priceLocation = $('hurricanePriceLocation');
  const priceAmount = $('hurricanePriceAmount');
  const priceNote = $('hurricanePriceNote');
  const interestBtn = $<HTMLButtonElement>('hurricaneInterestBtn');
  const contactBox = $('hurricaneContactBox');
  const nameInput = $<HTMLInputElement>('hurricaneNameInput');
  const phoneInput = $<HTMLInputElement>('hurricanePhoneInput');
  const submitBtn = $<HTMLButtonElement>('hurricaneSubmitBtn');
  const backBtn = $<HTMLButtonElement>('hurricaneBackBtn');
  const successBox = $('hurricaneSuccessBox');
  const quoteForm = $<HTMLFormElement>('hurricaneQuoteForm');

  if (
    !locationInput || !autocomplete || !propertySelect || !priceBox ||
    !priceLocation || !priceAmount || !priceNote || !interestBtn ||
    !contactBox || !nameInput || !phoneInput || !submitBtn || !backBtn ||
    !successBox || !quoteForm
  ) {
    return;
  }

  let selectedLocation: string | null = null;
  let selectedZone: Zone | null = null;

  const hidePrice = (): void => {
    priceBox.classList.remove('active');
    contactBox.classList.remove('active');
    selectedLocation = null;
    selectedZone = null;
  };

  const showPrice = (loc: string, zone: Zone): void => {
    selectedLocation = loc;
    selectedZone = zone;
    const range = precios[zone];
    priceLocation.textContent = loc;
    priceAmount.textContent = `$${range.min} - $${range.max}`;
    priceNote.textContent = range.nota;
    priceBox.classList.add('active');
    setTimeout(() => priceBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    trackEvent('price_viewed', { location: loc, zone, property: propertySelect.value });
  };

  const updatePrice = (): void => {
    if (selectedLocation && selectedZone && propertySelect.value) {
      showPrice(selectedLocation, selectedZone);
    }
  };

  const renderAutocomplete = (results: UbicacionEntry[]): void => {
    if (results.length === 0) {
      autocomplete.classList.remove('active');
      autocomplete.innerHTML = '';
      return;
    }
    autocomplete.innerHTML = results
      .map(
        (r) =>
          `<div class="autocomplete-item" data-nombre="${r.nombre}" data-zona="${r.zona}">${r.nombre} <span class="ac-state">${r.estado}</span></div>`,
      )
      .join('');
    autocomplete.classList.add('active');
  };

  locationInput.addEventListener('input', () => {
    const query = locationInput.value;
    if (query.length < 2) {
      autocomplete.classList.remove('active');
      hidePrice();
      return;
    }
    renderAutocomplete(filterLocations(query));
    if (selectedLocation && selectedLocation !== query) hidePrice();
  });

  locationInput.addEventListener('focus', () => {
    trackEvent('location_focused');
    if (locationInput.value.length >= 2) renderAutocomplete(filterLocations(locationInput.value));
  });

  locationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      autocomplete.classList.remove('active');
      const value = locationInput.value.trim();
      if (value) {
        selectedLocation = value;
        selectedZone = detectZone(value);
        updatePrice();
      }
    }
  });

  locationInput.addEventListener('blur', () => {
    setTimeout(() => {
      const value = locationInput.value.trim();
      if (value && !selectedLocation) {
        selectedLocation = value;
        selectedZone = detectZone(value);
        updatePrice();
      }
    }, 200);
  });

  autocomplete.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.autocomplete-item');
    if (!target) return;
    const nombre = target.dataset.nombre || '';
    const zona = (target.dataset.zona as Zone | undefined) || 'foranea';
    locationInput.value = nombre;
    selectedLocation = nombre;
    selectedZone = zona;
    autocomplete.classList.remove('active');
    updatePrice();
  });

  document.addEventListener('click', (e) => {
    const wrapper = locationInput.closest('.input-wrapper');
    if (wrapper && !wrapper.contains(e.target as Node)) {
      autocomplete.classList.remove('active');
    }
  });

  propertySelect.addEventListener('change', () => {
    const value = propertySelect.value;
    trackEvent('property_selected', { property: value, priority: tiposPrioritarios.has(value) });
    updatePrice();
  });

  const validate = (): void => {
    const okName = nameInput.value.trim().length >= 2;
    const okPhone = phoneInput.value.replace(/\D/g, '').length >= 10;
    submitBtn.disabled = !(okName && okPhone);
  };

  nameInput.addEventListener('input', validate);
  phoneInput.addEventListener('input', validate);

  interestBtn.addEventListener('click', () => {
    trackEvent('interest_clicked', {
      location: selectedLocation,
      zone: selectedZone,
      property: propertySelect.value,
    });
    priceBox.classList.remove('active');
    contactBox.classList.add('active');
    setTimeout(() => contactBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    setTimeout(() => nameInput.focus(), 250);
  });

  backBtn.addEventListener('click', () => {
    trackEvent('back_clicked');
    contactBox.classList.remove('active');
    priceBox.classList.add('active');
    setTimeout(() => priceBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  });

  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled || !selectedZone || !selectedLocation || !propertySelect.value) return;

    const range = precios[selectedZone];
    const fechaLocal = new Date().toLocaleString('es-MX', { timeZone: 'America/Cancun' });
    const propertyKey = propertySelect.value;

    const payload = {
      source: 'Landing Cotizador',
      full_name: nameInput.value.trim(),
      phone: phoneInput.value.replace(/\D/g, ''),
      ubicacion: selectedLocation,
      zona: zoneLabel[selectedZone],
      tipo_propiedad: tiposLabels[propertyKey] ?? propertyKey,
      precio_mostrado: `$${range.min} - $${range.max} USD/m²`,
      es_prioritario: tiposPrioritarios.has(propertyKey) ? 'Sí' : 'No',
      timestamp: new Date().toISOString(),
      fecha_local: fechaLocal,
      hp_field: (quoteForm.elements.namedItem('hp_field') as HTMLInputElement | null)?.value ?? '',
      ts: Number((quoteForm.elements.namedItem('ts') as HTMLInputElement | null)?.value ?? 0),
    };

    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    trackEvent('form_submit_started', payload);

    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      trackEvent('form_submitted', payload);
    } catch (err) {
      trackEvent('form_error', { error: err instanceof Error ? err.message : String(err) });
    }

    formSection.classList.add('hidden');
    successBox.classList.add('active');
    setTimeout(() => successBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-reload').forEach((btn) => {
    btn.addEventListener('click', () => location.reload());
  });

  trackEvent('page_loaded', { referrer: document.referrer, screen: window.innerWidth });
}
