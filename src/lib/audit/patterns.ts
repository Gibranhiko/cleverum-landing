/**
 * Librería de patrones de automatización/IA que se inyecta al prompt
 * del Senior Business Analyst durante el audit.
 *
 * Esto es la "IP" del audit — los 15 movimientos reales que Cleverum
 * ejecuta en LATAM. El modelo elige y combina patrones para construir
 * cada oportunidad recomendada.
 *
 * Si agregas un patrón nuevo, mantén el shape: stack realista, ROI
 * cuantificable (horas/mes o % conversión), y sprint claro.
 */

export type SprintId = 'web' | 'auto' | 'chatbot';
export type Complexity = 'baja' | 'media' | 'alta';
export type Category = 'quick-win' | 'strategic';

export interface Pattern {
  id: string;
  name: string;
  description: string;
  stack: string[];
  cases: string[];
  roi: string;
  duration: string;
  complexity: Complexity;
  category: Category;
  sprintRecomendado: SprintId;
}

export const PATTERNS: Pattern[] = [
  {
    id: 'PATRON_01',
    name: 'WhatsApp + IA para FAQs y ventas',
    description:
      'Chatbot con IA que responde preguntas frecuentes, captura leads, y recupera carritos abandonados. Handoff a humano cuando detecta intención de compra alta o queja.',
    stack: [
      'n8n',
      'Anthropic Claude Haiku',
      'WhatsApp Business Cloud API',
      'Supabase',
    ],
    cases: ['ecommerce', 'restaurantes', 'servicios profesionales', 'inmobiliarias'],
    roi: '25-40 hrs/mes ahorradas en soporte + conversión +12-18% en abandono',
    duration: '3-5 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'chatbot',
  },
  {
    id: 'PATRON_02',
    name: 'Sync automático entre 3+ herramientas',
    description:
      'Workflow bidireccional que mantiene inventario, ventas y contabilidad sincronizados en tiempo real (ej. Shopify ↔ inventario interno ↔ Contpaqi o Aspel).',
    stack: ['n8n', 'Make', 'webhooks', 'APIs REST/GraphQL'],
    cases: ['retail multi-canal', 'distribuidores', 'mayoristas'],
    roi: '15-25 hrs/mes ahorradas en data entry + cero discrepancias de stock',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_03',
    name: 'Dashboard de KPIs en tiempo real',
    description:
      'Dashboard web que agrega métricas de ventas, soporte y operación de tus herramientas (CRM, ERP, e-commerce) en una sola pantalla con alertas por desviación.',
    stack: ['Next.js', 'Supabase', 'Recharts', 'webhooks'],
    cases: ['fundadores con multi-canal', 'directores comerciales', 'COOs'],
    roi: 'Decisiones 3-5× más rápidas + detección temprana de leak en funnel',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'strategic',
    sprintRecomendado: 'web',
  },
  {
    id: 'PATRON_04',
    name: 'Agente IA para soporte y triage',
    description:
      'Primera línea de soporte automática: clasifica tickets, responde el 60-80% sin humano, y escala los complejos al agente correcto con todo el contexto resumido.',
    stack: ['Anthropic Claude Sonnet', 'Zendesk/Freshdesk APIs', 'n8n'],
    cases: ['SaaS B2B', 'servicios financieros', 'e-commerce con volumen alto'],
    roi: '50-70% de tickets resueltos sin humano + tiempo respuesta < 2 min',
    duration: '3-4 semanas',
    complexity: 'alta',
    category: 'strategic',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_05',
    name: 'Automatización de cobranza',
    description:
      'Workflow que detecta facturas vencidas, dispara recordatorios escalonados (email + WhatsApp + llamada), y registra cada interacción en CRM/contabilidad.',
    stack: ['n8n', 'WhatsApp Business API', 'Resend', 'Stripe/Conekta'],
    cases: ['agencias', 'consultoras', 'B2B con cobranza recurrente'],
    roi: '20-35% reducción en DSO (días de cobranza) + 10-15 hrs/sem recuperadas',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_06',
    name: 'Scraping + análisis de competencia',
    description:
      'Crawler periódico que monitorea precios, ofertas y mensajes de tus 5-10 competidores, normaliza los datos, y produce un reporte semanal con cambios accionables.',
    stack: ['Playwright', 'n8n', 'Anthropic Claude Haiku', 'Supabase'],
    cases: ['ecommerce', 'SaaS B2B', 'marketplaces'],
    roi: 'Reacción 5-10× más rápida a cambios de precio + insight competitivo continuo',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'strategic',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_07',
    name: 'Generación automática de contenido',
    description:
      'Pipeline que toma briefs cortos y produce posts, captions, descripciones de producto o emails — con tono de marca, variantes A/B, y aprobación humana antes de publicar.',
    stack: ['Anthropic Claude Sonnet', 'n8n', 'CMS headless', 'Buffer/Hootsuite API'],
    cases: ['marcas de consumo', 'creadores', 'ecommerce con catálogo grande'],
    roi: '10× output de contenido + costo por pieza 70-85% menor',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_08',
    name: 'Onboarding automático de clientes',
    description:
      'Flujo que después del checkout/firma envía bienvenida, recolecta datos faltantes vía formulario o chatbot, configura accesos, y entrega kickoff sin intervención manual.',
    stack: ['n8n', 'Resend', 'WhatsApp API', 'Typeform/Tally', 'Supabase'],
    cases: ['SaaS B2B', 'agencias', 'cursos/coaching', 'servicios financieros'],
    roi: 'Time-to-value 5-10× más corto + 100% consistencia en activación',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_09',
    name: 'Lead enrichment + scoring con IA',
    description:
      'Cada lead nuevo se enriquece automáticamente (LinkedIn, empresa, tamaño, stack), se le calcula un score con IA según fit ICP, y se rutea al SDR correcto con un brief.',
    stack: ['Apollo/Clearbit API', 'Anthropic Claude Haiku', 'HubSpot/Pipedrive', 'n8n'],
    cases: ['SaaS B2B', 'consultoras', 'agencias enterprise'],
    roi: 'SDR enfoca 100% del tiempo en leads top + close rate +20-30%',
    duration: '2-3 semanas',
    complexity: 'alta',
    category: 'strategic',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_10',
    name: 'App móvil con backend serverless',
    description:
      'App nativa iOS + Android publicada en stores, con backend serverless (auth, storage, notifs push, pagos) y panel admin web para tu equipo.',
    stack: ['React Native', 'Expo', 'Supabase', 'Stripe', 'EAS Build'],
    cases: ['servicios con base recurrente', 'comunidades', 'marketplaces nicho'],
    roi: 'Canal directo al cliente + recurrencia +40-60% vs solo web',
    duration: '6-10 semanas',
    complexity: 'alta',
    category: 'strategic',
    sprintRecomendado: 'web',
  },
  {
    id: 'PATRON_11',
    name: 'RAG sobre documentación interna',
    description:
      'Asistente IA con acceso a tu Notion/Drive/Confluence que responde preguntas internas con citas a la fuente. Onboarding de nuevos empleados, soporte L1 técnico, búsqueda semántica.',
    stack: [
      'Anthropic Claude Sonnet',
      'Supabase pgvector',
      'embeddings (voyage / openai)',
      'n8n',
    ],
    cases: ['empresas con > 30 empleados', 'soporte interno', 'compliance / legal'],
    roi: '15-30 hrs/sem ahorradas en preguntas repetidas + onboarding 3× más rápido',
    duration: '3-5 semanas',
    complexity: 'alta',
    category: 'strategic',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_12',
    name: 'Voice agent para atención telefónica',
    description:
      'Agente de voz que atiende llamadas entrantes 24/7, califica leads, agenda citas en calendario, y escala a humano cuando necesario.',
    stack: ['Vapi/Retell', 'Twilio Voice', 'Anthropic Claude Haiku', 'Cal.com API'],
    cases: ['clínicas', 'despachos legales', 'servicios B2C con altas llamadas'],
    roi: 'Captura 100% de llamadas fuera de horario + costo por llamada 80% menor',
    duration: '3-5 semanas',
    complexity: 'alta',
    category: 'strategic',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_13',
    name: 'Automatización de propuestas comerciales',
    description:
      'A partir de un brief de descubrimiento, genera propuesta personalizada (PDF + landing), cotización, contrato y plan de pago. Listo en minutos, no días.',
    stack: ['Anthropic Claude Sonnet', 'PDFKit/Pandoc', 'DocuSign', 'Stripe', 'n8n'],
    cases: ['agencias', 'consultoras', 'arquitectos', 'ingeniería'],
    roi: 'Time-to-propuesta de 2 días → 30 min + close rate +15-25%',
    duration: '3-4 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_14',
    name: 'Email triage + auto-responder con IA',
    description:
      'IA lee tu bandeja, clasifica por urgencia/tipo, redacta borradores de respuesta en tu tono, y deja solo lo que necesita decisión humana en la cima.',
    stack: ['Gmail/Outlook API', 'Anthropic Claude Sonnet', 'n8n'],
    cases: ['fundadores con > 50 emails/día', 'directores comerciales', 'soporte'],
    roi: '2-4 hrs/día recuperadas + respuesta a clientes < 1 hr en horario laboral',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
  {
    id: 'PATRON_15',
    name: 'Workflow de aprobaciones internas',
    description:
      'Solicitudes de compra, vacaciones, gastos o cambios de scope que se ruteán solos al aprobador correcto vía WhatsApp/Slack, con timeout + escalamiento automático.',
    stack: ['n8n', 'Slack API', 'WhatsApp Business API', 'Supabase', 'Resend'],
    cases: ['empresas con 20-200 empleados', 'agencias', 'manufactureras'],
    roi: 'Tiempo de aprobación 70-85% menor + 100% trazabilidad para auditoría',
    duration: '2-3 semanas',
    complexity: 'media',
    category: 'quick-win',
    sprintRecomendado: 'auto',
  },
];

export function getPatternById(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}

export function formatPatternsForPrompt(): string {
  return PATTERNS.map((p) => {
    return `### ${p.id} — ${p.name}
${p.description}
- Stack: ${p.stack.join(', ')}
- Casos: ${p.cases.join(', ')}
- ROI típico: ${p.roi}
- Duración: ${p.duration}
- Complejidad: ${p.complexity}
- Categoría: ${p.category}
- Sprint: ${p.sprintRecomendado}`;
  }).join('\n\n');
}
