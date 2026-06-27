/**
 * Generación de PDF del diagnóstico — diseño claro/profesional con acentos de marca.
 *
 * Este módulo importa `@react-pdf/renderer` (pesado). Se carga SIEMPRE vía
 * `import()` dinámico desde el botón "Descargar PDF" para que no entre al
 * bundle inicial del audit island.
 */
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import { site } from '~/content/site';
import type { AuditResult, Opportunity } from '~/lib/audit/types';

const C = {
  blue: '#4F8AF7',
  iris: '#7C5CFF',
  grape: '#A855F7',
  go: '#22C55E',
  ink: '#1A1A22',
  body: '#3F3F4B',
  muted: '#6B6B78',
  line: '#E6E6EC',
  soft: '#F5F5F8',
  white: '#FFFFFF',
};

const SERVICE_NAME: Record<string, string> = {
  web: 'Sitio web',
  auto: 'Automatización con IA',
  chatbot: 'Chatbot de WhatsApp',
};

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 46,
    paddingHorizontal: 0,
    fontSize: 10,
    color: C.body,
    fontFamily: 'Helvetica',
    backgroundColor: C.white,
  },
  accentBar: { flexDirection: 'row', height: 5 },
  body: { paddingHorizontal: 44 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    marginBottom: 14,
  },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.ink, letterSpacing: -0.5 },
  brandSub: { fontSize: 8, color: C.muted, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  kicker: {
    fontSize: 7.5,
    color: C.iris,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerDate: { fontSize: 8, color: C.muted, marginTop: 3 },

  h1: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.ink,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  lead: { fontSize: 10.5, color: C.body, lineHeight: 1.45, marginBottom: 12 },
  leadStrong: { fontFamily: 'Helvetica-Bold', color: C.ink },

  sectionLabel: {
    fontSize: 8,
    color: C.muted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },

  // Maturity
  maturityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  maturityBig: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.ink },
  maturityMax: { fontSize: 12, color: C.muted, marginLeft: 2, marginBottom: 3 },
  track: { height: 7, backgroundColor: C.soft, borderRadius: 4, marginTop: 4, marginBottom: 8 },
  trackFill: { height: 7, borderRadius: 4, backgroundColor: C.iris },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  legendItem: { fontSize: 8.5, color: C.muted },
  legendStrong: { color: C.ink, fontFamily: 'Helvetica-Bold' },

  // Opportunity card
  card: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardPrio: { borderColor: C.iris, backgroundColor: '#FAF8FF' },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 20,
    color: C.white,
  },
  cardNum: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.line },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.ink,
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  cardEnCorto: {
    fontSize: 10,
    color: C.ink,
    lineHeight: 1.45,
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: C.iris,
  },
  cardPorque: { fontSize: 9.5, color: C.body, lineHeight: 1.5, marginBottom: 9 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  chip: {
    fontSize: 7.5,
    color: C.body,
    backgroundColor: C.soft,
    borderRadius: 20,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
  },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  metaCell: { width: '50%', marginBottom: 6, paddingRight: 8 },
  metaLabel: {
    fontSize: 7,
    color: C.muted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: { fontSize: 9, color: C.ink },

  iceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  iceItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iceLabel: { fontSize: 8, color: C.muted },
  iceVal: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.ink },
  iceAvg: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.iris, marginLeft: 'auto' },

  recoBox: {
    borderRadius: 10,
    backgroundColor: C.soft,
    borderLeftWidth: 3,
    borderLeftColor: C.iris,
    padding: 14,
    marginTop: 6,
  },
  recoText: { fontSize: 10, color: C.ink, lineHeight: 1.5 },

  contact: { fontSize: 10, color: C.ink, lineHeight: 1.45, marginTop: 2 },
  contactStrong: { fontFamily: 'Helvetica-Bold', color: C.iris },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: C.muted },
  footerBrand: { fontSize: 8.5, color: C.iris, fontFamily: 'Helvetica-Bold' },
});

function Badge({ categoria }: { categoria: Opportunity['categoria'] }) {
  const isQuick = categoria === 'quick-win';
  return (
    <Text style={[s.badge, { backgroundColor: isQuick ? C.go : C.iris }]}>
      {isQuick ? 'Ganancia rápida' : 'Apuesta estratégica'}
    </Text>
  );
}

function OppCard({ o, i, prio }: { o: Opportunity; i: number; prio: boolean }) {
  return (
    <View style={[s.card, prio ? s.cardPrio : {}]} wrap={false}>
      <View style={s.cardHead}>
        <Badge categoria={o.categoria} />
        <Text style={s.cardNum}>{String(i + 1).padStart(2, '0')}</Text>
      </View>
      <Text style={s.cardTitle}>{o.titulo}</Text>
      {o.en_corto ? <Text style={s.cardEnCorto}>{o.en_corto}</Text> : null}
      <Text style={s.cardPorque}>{o.porque}</Text>

      <View style={s.chipsRow}>
        {o.stack_recomendado.map((t, j) => (
          <Text key={j} style={s.chip}>
            {t}
          </Text>
        ))}
      </View>

      <View style={s.metaGrid}>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Lo que ganas</Text>
          <Text style={s.metaValue}>{o.roi_estimado}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Tiempo</Text>
          <Text style={s.metaValue}>{o.tiempo_implementacion}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Esfuerzo</Text>
          <Text style={s.metaValue}>{o.complejidad}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Servicio</Text>
          <Text style={s.metaValue}>
            {SERVICE_NAME[o.sprint_recomendado] ?? o.sprint_recomendado}
          </Text>
        </View>
      </View>

      <View style={s.iceRow}>
        <View style={s.iceItem}>
          <Text style={s.iceLabel}>Impacto</Text>
          <Text style={s.iceVal}>{o.ice_score.impact}</Text>
        </View>
        <View style={s.iceItem}>
          <Text style={s.iceLabel}>Confianza</Text>
          <Text style={s.iceVal}>{o.ice_score.confidence}</Text>
        </View>
        <View style={s.iceItem}>
          <Text style={s.iceLabel}>Facilidad</Text>
          <Text style={s.iceVal}>{o.ice_score.ease}</Text>
        </View>
        <Text style={s.iceAvg}>{`ICE ${o.ice_score.promedio.toFixed(1)}`}</Text>
      </View>
    </View>
  );
}

interface ClientInfo {
  nombre?: string;
  empresa?: string;
}

function AuditDoc({ audit, client }: { audit: AuditResult; client?: ClientInfo }) {
  const max = 10;
  const scorePct = `${Math.max(0, Math.min(100, (audit.score_madurez / max) * 100))}%`;
  const fecha = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const para = client?.nombre
    ? `Preparado para ${client.nombre}${client.empresa ? ` · ${client.empresa}` : ''}`
    : 'Diagnóstico de automatización con IA';

  return (
    <Document
      title={`Diagnóstico Cleverum${client?.empresa ? ` — ${client.empresa}` : ''}`}
      author={site.brand.name}
    >
      <Page size="A4" style={s.page} wrap={false}>
        <View style={s.accentBar} fixed>
          <View style={{ flex: 1, backgroundColor: C.blue }} />
          <View style={{ flex: 1, backgroundColor: C.iris }} />
          <View style={{ flex: 1, backgroundColor: C.grape }} />
        </View>

        <View style={s.body}>
          <View style={s.header}>
            <View>
              <Text style={s.brand}>{site.brand.name}</Text>
              <Text style={s.brandSub}>{site.brand.bajada}</Text>
            </View>
            <View style={s.headerRight}>
              <Text style={s.kicker}>Diagnóstico de IA</Text>
              <Text style={s.headerDate}>{fecha}</Text>
            </View>
          </View>

          <Text style={s.h1}>{audit.industria}</Text>
          <Text style={s.lead}>
            <Text style={s.leadStrong}>{para}. </Text>
            {audit.negocio_detectado}
          </Text>

          <Text style={s.sectionLabel}>Madurez digital</Text>
          <View style={s.maturityRow}>
            <Text style={s.maturityBig}>{audit.score_madurez}</Text>
            <Text style={s.maturityMax}>/{max}</Text>
          </View>
          <View style={s.track}>
            <View style={[s.trackFill, { width: scorePct }]} />
          </View>
          <View style={s.legendRow}>
            <Text style={s.legendItem}>
              <Text style={s.legendStrong}>Tú: {audit.score_madurez}</Text>
            </Text>
            <Text style={s.legendItem}>Industria: {audit.benchmark.industria_promedio}</Text>
            <Text style={s.legendItem}>Líder: {audit.benchmark.lider}</Text>
            <Text style={s.legendItem}>
              Tu potencial: <Text style={s.legendStrong}>{audit.benchmark.tu_potencial}</Text>
            </Text>
          </View>

          <Text style={s.sectionLabel}>
            {audit.oportunidades.length === 1
              ? 'La oportunidad principal'
              : `Las ${audit.oportunidades.length} oportunidades · en orden de impacto`}
          </Text>
          {audit.oportunidades.map((o, i) => (
            <OppCard
              key={i}
              o={o}
              i={i}
              prio={audit.recomendacion_prioritaria.oportunidad_index === i}
            />
          ))}

          {audit.recomendacion_prioritaria?.razon && (
            <>
              <Text style={s.sectionLabel}>Nuestra recomendación</Text>
              <View style={s.recoBox}>
                <Text style={s.recoText}>{audit.recomendacion_prioritaria.razon}</Text>
              </View>
            </>
          )}

          <Text style={s.sectionLabel}>¿Hablamos?</Text>
          <Text style={s.contact}>
            Escríbenos a <Text style={s.contactStrong}>{site.contact.email}</Text> o al{' '}
            <Text style={s.contactStrong}>{site.contact.phoneDisplay}</Text> (WhatsApp). Te ayudamos
            a aterrizar esta oportunidad.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {site.meta.url.replace('https://', '')} · {site.contact.email} ·{' '}
            {site.contact.phoneDisplay}
          </Text>
          <Text style={s.footerBrand}>{site.brand.name}</Text>
        </View>
      </Page>
    </Document>
  );
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'diagnostico'
  );
}

export async function downloadAuditPdf(audit: AuditResult, client?: ClientInfo): Promise<void> {
  const blob = await pdf(<AuditDoc audit={audit} client={client} />).toBlob();
  const url = URL.createObjectURL(blob);
  const base = slugify(client?.empresa || audit.industria || 'cleverum');
  const a = document.createElement('a');
  a.href = url;
  a.download = `diagnostico-cleverum-${base}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
