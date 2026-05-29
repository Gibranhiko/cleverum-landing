# Cloudflare Setup — Guía paso a paso

Guía completa para subir `cleverum.org` a Cloudflare Pages con todas las integraciones funcionando: AI Audit (Anthropic), anti-bot (Turnstile), email (Resend), storage (KV), seguridad y monitoreo.

**Tiempo estimado**: ~2 horas la primera vez. ~30 min en deploys posteriores.

**Audiencia**: Gibran (owner) ejecutando esto solo. No requiere otro dev.

---

## Tabla de contenido

1. [Prerequisitos](#1-prerequisitos)
2. [Crear cuentas externas](#2-crear-cuentas-externas)
3. [Proyecto en Cloudflare Pages](#3-proyecto-en-cloudflare-pages)
4. [KV Namespace](#4-kv-namespace-storage)
5. [Turnstile (anti-bot)](#5-turnstile-anti-bot)
6. [Anthropic API (motor de IA)](#6-anthropic-api-motor-de-ia)
7. [Resend (envío de emails)](#7-resend-envío-de-emails)
8. [Environment variables](#8-environment-variables)
9. [Custom domain + DNS](#9-custom-domain--dns)
10. [Primer deploy](#10-primer-deploy)
11. [Smoke test end-to-end](#11-smoke-test-end-to-end)
12. [Local development con Wrangler](#12-local-development-con-wrangler)
13. [Seguridad — qué ya está + recomendaciones](#13-seguridad)
14. [Costos y monitoreo](#14-costos-y-monitoreo)
15. [Web Analytics](#15-web-analytics)
16. [SEO post-deploy](#16-seo-post-deploy)
17. [Troubleshooting](#17-troubleshooting)
18. [Checklist final](#18-checklist-final)
19. [Mantenimiento mensual](#19-mantenimiento-mensual)

---

## 1. Prerequisitos

Antes de empezar, ten lo siguiente:

- [ ] Cuenta de Cloudflare (gratuita) — [dash.cloudflare.com](https://dash.cloudflare.com)
- [ ] Dominio `cleverum.org` registrado (puede estar en cualquier registrar; idealmente ya con DNS en Cloudflare)
- [ ] Tarjeta de crédito/débito para Anthropic (~$5 USD inicial es suficiente para probar)
- [ ] Git repo del proyecto subido a GitHub, GitLab o Bitbucket
- [ ] Node.js 22+ y npm 10+ instalados localmente
- [ ] Email mailbox o forwarding configurado en `hello@cleverum.org` (necesario para enviar emails desde Resend con remitente verificado)

---

## 2. Crear cuentas externas

Crea estas 3 cuentas antes de tocar Cloudflare. Te darán las API keys que vas a meter en CF.

### 2.1 Anthropic (motor de IA del audit)

1. Ve a [console.anthropic.com](https://console.anthropic.com) y crea cuenta.
2. Agrega método de pago en **Settings → Billing** (deposita un mínimo de $5 USD para empezar).
3. Verifica que tu plan/tier tenga acceso a `claude-haiku-4-5-20251001` con **extended thinking** habilitado (la mayoría de cuentas nuevas lo tienen por default).
4. Crea una API key en **Settings → API Keys** → "Create Key".
5. Guarda la key en un manager de contraseñas. Empieza con `sk-ant-api-...`.
6. **No subas esta key a git nunca.** Solo va a Cloudflare env vars (encrypted).

### 2.2 Resend (envío de emails)

1. Ve a [resend.com](https://resend.com) y crea cuenta.
2. En **Domains** → "Add Domain" → ingresa `cleverum.org`.
3. Resend te dará 3 DNS records que necesitas agregar en Cloudflare DNS:
   - **MX record** (return-path)
   - **TXT record** (SPF)
   - **TXT record** (DKIM)
4. Déjalos abiertos en una pestaña — los configurarás en el paso 9.
5. Cuando hayas configurado los DNS (después), regresa aquí y clic "Verify" — debe pasar en ~5 minutos.
6. Crea una API key en **API Keys** → "Create API Key" → Permission `Sending access`. Guarda. Empieza con `re_...`.

### 2.3 Cloudflare (ya la deberías tener)

Si no tienes cuenta:
1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) y regístrate.
2. Plan gratuito es suficiente para el alcance del sitio.

---

## 3. Proyecto en Cloudflare Pages

### 3.1 Crear el proyecto

1. En CF Dashboard, ve a **Workers & Pages** (menú lateral izquierdo).
2. Clic en **Create application** → tab **Pages** → **Connect to Git**.
3. Conecta tu cuenta de GitHub/GitLab/Bitbucket y autoriza Cloudflare.
4. Selecciona el repo `cleverum-landing` (o como lo hayas nombrado).
5. **Project name**: `cleverum` (este será el subdomain temporal `cleverum.pages.dev` mientras conectas el dominio).
6. **Production branch**: `main` (o `master`, lo que uses).
7. **Build settings**:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (dejar en blanco si CF lo pide así)
   - **Node version**: agregar variable `NODE_VERSION=22` en environment variables (paso 8)
8. **Save and Deploy** — el primer build VA A FALLAR porque falta config de env vars y KV. Está bien, lo arreglamos.

### 3.2 Verifica que el repo se conectó

- Después del primer deploy fallido, verás el proyecto en la lista de Workers & Pages.
- Cualquier push a la branch `main` triggera un nuevo deploy automáticamente.
- Cualquier push a otra branch crea un **preview deployment** con URL única.

---

## 4. KV Namespace (storage)

KV es la base de datos clave-valor de Cloudflare. La usa el AI Audit Tool para:
- Guardar el resultado de cada audit (`audit:<uuid>`, TTL 7 días)
- Guardar leads (`lead:<uuid>`, TTL 1 año)
- Rate limit por IP (`rate:<ip>`, TTL 24h)
- Cap diario (`audit:count:<YYYY-MM-DD>`, TTL 48h)

### 4.1 Crear el namespace

1. En CF Dashboard → **Workers & Pages** → **KV** (tab arriba o submenú).
2. Clic **Create a namespace**.
3. Name: `cleverum-kv` (o `cleverum_audit_kv`, como prefieras).
4. **Create**.

### 4.2 Bindear el namespace al proyecto Pages

1. Vuelve a **Workers & Pages** → tu proyecto `cleverum`.
2. **Settings** → **Bindings** → "Add" → **KV namespace**.
3. **Variable name**: `KV` (debe ser exactamente esto — el código de `functions/` espera `env.KV`).
4. **KV namespace**: selecciona `cleverum-kv` del dropdown.
5. **Save**.
6. Repítelo para los environments **Production** y **Preview** (Cloudflare a veces requiere binding separado por environment).

> ⚠️ El nombre `KV` es case-sensitive. Si lo nombras `kv` o `Kv`, el código rompe en runtime.

---

## 5. Turnstile (anti-bot)

Turnstile es el reemplazo de reCAPTCHA hecho por Cloudflare. Bloquea bots sin que el usuario tenga que resolver captchas (la mayoría de las veces).

### 5.1 Crear un site

1. En CF Dashboard, ve directo a [dash.cloudflare.com/?to=/:account/turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) (o busca "Turnstile" en el menú lateral).
2. Clic **Add site**.
3. **Site name**: `cleverum.org`
4. **Hostname management**: agrega los siguientes hostnames:
   - `cleverum.org`
   - `www.cleverum.org`
   - `localhost` (para dev local)
   - `cleverum.pages.dev` (URL temporal de CF Pages, útil mientras no tengas el dominio activo)
5. **Widget Mode**: **Managed** — Cloudflare decide automáticamente si muestra o no challenge según el comportamiento del visitante. Es el más amigable.
6. **Save**.
7. Te da dos keys:
   - **Site Key** (público, empieza con `0x4AAAAA...`)
   - **Secret Key** (privado, empieza con `0x4AAAAA...`)
8. Guarda ambas — las usarás en el paso 8.

> 💡 Para dev local sin generar tráfico real al sistema de validación de Turnstile, usa la **always-pass test key**: `1x00000000000000000000AA` como Site Key. Setéala en `.env` local pero NO en producción.

---

## 6. Anthropic API (motor de IA)

Ya creaste la cuenta en 2.1 y tienes la API key. Tres consideraciones extra:

### 6.1 Verificar el modelo

El código usa `claude-haiku-4-5-20251001` con extended thinking enabled. Si tu cuenta no tiene acceso por alguna razón:

- Ve a [console.anthropic.com](https://console.anthropic.com) → **Models** o **Workbench**.
- Confirma que `claude-haiku-4-5` aparece y puedes ejecutar prompts.
- Si tienes acceso, listo.
- Si no, abre `functions/api/_audit-utils.ts` línea 5 y cambia `ANTHROPIC_MODEL` a `claude-sonnet-4-6` (cuesta ~3× más por audit pero es 100% accessible).

### 6.2 Cost guardrails

- Cada audit ejecuta 3 llamadas a la API: classifier (Haiku) → analyst (Haiku con extended thinking) → critic (Haiku).
- Costo aproximado por audit: **~$0.013 USD** (con Haiku 4.5).
- Con `DAILY_AUDIT_CAP=100` el techo de costo diario es ~$1.30 USD.
- El cap está implementado en `functions/api/_audit-utils.ts` — bloquea audits cuando se alcanza.

### 6.3 Monitorear uso

- [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage) → ve el spend diario.
- Configura **billing alerts** en Settings → Billing para que te avise si pasas un umbral (recomendado: $20/mes para empezar).

---

## 7. Resend (envío de emails)

Ya creaste cuenta en 2.2 y agregaste `cleverum.org`. Falta verificar el dominio agregando DNS records.

### 7.1 Configurar los DNS records de Resend en Cloudflare

1. En tab de Resend, copia los 3 records que te dieron (suelen ser: `send` MX, `_dmarc` TXT, `resend._domainkey` TXT o similar).
2. En CF Dashboard → tu zona DNS de `cleverum.org` → **DNS** → **Records**.
3. Por cada record de Resend, clic **Add record** y copia exactamente:
   - **Type**: MX o TXT según indique Resend
   - **Name**: lo que diga Resend (puede ser `send`, `_dmarc`, etc.)
   - **Value/Content**: el contenido exacto que dio Resend
   - **Priority** (para MX): el valor que dio Resend (típicamente 10)
   - **Proxy status**: **DNS only** (gris, NO el naranja). Resend necesita resolver el DNS directamente.
4. **Save** cada record.
5. Vuelve a Resend → **Domains** → `cleverum.org` → clic **Verify**.
6. Espera 1-5 minutos. Si pasa: ✅ verificado. Si no, espera 15 min y reintenta.

> ⚠️ Si los records nunca verifican: confirma que el "Proxy status" está en DNS only, no en proxied (naranja). Resend no funciona con records proxied.

### 7.2 Verificar el remitente

El código usa `from: 'Gibran de Cleverum <hello@cleverum.org>'` y `from: 'Cleverum Bot <hello@cleverum.org>'`.

- Resend permite enviar desde **cualquier dirección @cleverum.org** una vez el dominio está verificado. No requiere verificar cada dirección individual.
- Asegúrate que `hello@cleverum.org` exista como mailbox o como forwarding hacia tu Gmail/Outlook (para que cuando alguien responda al email del audit, te llegue).

### 7.3 (Opcional) Reverse forwarding

Si quieres recibir replies al `hello@cleverum.org`:
- Configura un email forwarding en Cloudflare Email Routing (gratis):
  - CF Dashboard → tu zona `cleverum.org` → **Email** → **Email Routing**.
  - Activa Email Routing.
  - Custom address: `hello@cleverum.org` → forward a tu Gmail personal.
- O usa un servicio como Improvmx, Forwardemail, etc.

---

## 8. Environment variables

Ya tienes todas las keys necesarias. Ahora las metes en Cloudflare Pages.

### 8.1 Lista completa de variables

| Variable | Tipo | Dónde se usa | Valor |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | **Encrypted** | Backend (`/api/audit`) | `sk-ant-api-...` (del paso 2.1) |
| `TURNSTILE_SECRET_KEY` | **Encrypted** | Backend (validar token) | `0x4AAAAAAA...` secret (del paso 5) |
| `TURNSTILE_SITE_KEY` | **Plain** | Backend (referencia) | `0x4AAAAAAA...` site (del paso 5) |
| `PUBLIC_TURNSTILE_SITE_KEY` | **Plain** | Frontend build (Astro) | mismo site key que arriba |
| `RESEND_API_KEY` | **Encrypted** | Backend (`/api/audit`, `/api/lead`) | `re_...` (del paso 2.2) |
| `DAILY_AUDIT_CAP` | **Plain** | Backend (cost guard) | `100` (ajustable) |
| `NODE_VERSION` | **Plain** | Build pipeline | `22` |

### 8.2 Setear en CF Dashboard

1. CF Dashboard → **Workers & Pages** → tu proyecto `cleverum`.
2. **Settings** → **Environment variables**.
3. Verás dos secciones: **Production** y **Preview**. **Setea TODAS las variables en AMBAS** (las preview deployments usan las preview env vars).
4. Por cada variable:
   - Variable name: exacto como en la tabla arriba (case-sensitive).
   - Value: el valor real.
   - **Encrypt** (checkbox): activa para las marked como Encrypted arriba; deja sin marcar para Plain.
5. **Save**.

> ⚠️ Las marked como Encrypted no se pueden VER después de guardar (solo se pueden editar/sobreescribir). Por eso guarda las API keys en tu password manager.

### 8.3 Frontend env para build local

Para que `npm run dev` funcione localmente y el Turnstile widget se renderice:

```bash
# en la raíz del repo
cp .env.example .env
```

Edita `.env`:

```
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Usa el **test site key** `1x00000000000000000000AA` para dev local (pasa siempre sin generar tráfico de validación). Para preview/production usa el real (que ya está en CF Pages env vars).

> ⚠️ `.env` está en `.gitignore` — no se commitea. Cada dev tiene el suyo.

---

## 9. Custom domain + DNS

### 9.1 Mover el dominio a Cloudflare (si no está)

Si `cleverum.org` está registrado en otro registrar (GoDaddy, Namecheap, etc.) y no usa Cloudflare DNS:

1. CF Dashboard → **+ Add a Site** (botón arriba a la derecha).
2. Ingresa `cleverum.org` → seleccionar plan Free.
3. Cloudflare escanea los DNS existentes y te muestra una lista.
4. Cloudflare te da **2 nameservers**.
5. Ve a tu registrar y cambia los nameservers a los de Cloudflare.
6. Espera propagación DNS (típicamente 15 min — 24 hrs).

### 9.2 Agregar el dominio al proyecto Pages

1. CF Dashboard → **Workers & Pages** → tu proyecto `cleverum` → **Custom domains** tab.
2. **Set up a custom domain** → ingresa `cleverum.org` → **Continue**.
3. CF agregará automáticamente un CNAME record en tu DNS apuntando a `cleverum.pages.dev`.
4. **Activate domain**.
5. Repite para `www.cleverum.org` (CNAME a `cleverum.org` o redirect, según prefieras).

### 9.3 SSL/TLS

- CF auto-emite certificado SSL para tu dominio (gratuito, vía Let's Encrypt o CF). Espera 5-15 min después de agregar el dominio.
- **CF Dashboard → SSL/TLS → Overview** → Encryption mode: **Full (strict)** (más seguro).
- **SSL/TLS → Edge Certificates** → activa **Always Use HTTPS** ✓
- Activa también **Automatic HTTPS Rewrites** ✓
- Activa **HSTS** (max-age al menos 6 meses).

---

## 10. Primer deploy

### 10.1 Trigger el build

1. Haz un commit cualquiera (puede ser un cambio en README o lo que sea) y push a la branch `main`.
2. CF Pages detecta el push y triggera build automático.
3. Ve a tu proyecto en CF Dashboard → **Deployments** tab → ve el progreso del build en vivo.
4. Build esperado: ~1-3 minutos.

### 10.2 Verificar el build

El build debe pasar con:
```
✓ Built in ~10s
✓ Generating static routes... /index.html, /llms.txt, /llms-full.txt, /api/info.json
✓ [@astrojs/sitemap] sitemap-index.xml created at dist
```

Si falla:
- Revisa los logs del deploy
- Causas comunes: env var faltante, error de typecheck, dependencia faltando
- Ver sección **Troubleshooting**

### 10.3 Verificar páginas estáticas

Una vez deployed (estado: ✓ Success), prueba en tu browser:

- `https://cleverum.org/` → landing principal renderiza
- `https://cleverum.org/llms.txt` → texto plano con info estructurada
- `https://cleverum.org/llms-full.txt` → versión extendida
- `https://cleverum.org/api/info.json` → JSON con datos del sitio
- `https://cleverum.org/robots.txt` → robots con AI bots allow
- `https://cleverum.org/sitemap-index.xml` → sitemap

---

## 11. Smoke test end-to-end

Esto valida que TODA la pipeline funciona: Turnstile + Anthropic + KV + Resend.

### 11.1 Test del Audit Tool

1. Ve a `https://cleverum.org/` → click **"Diagnostica mi negocio"** en el Hero.
2. Llena el wizard:
   - **Paso 1**: "Ecommerce de ropa MX, 200 chats al día a mano"
   - **Paso 2**: skip
   - **Paso 3**: Nombre `Test Run`, Empresa `Test Company`
   - **Paso 4**: Email **tu email personal** (para verificar que llega el reporte)
   - **Paso 5**: Click **"Analizar mi negocio"**
3. Si Turnstile carga: verás el flujo de status → industry → thinking → opportunities → done.
4. Tiempo total: ~15-30 segundos.

### 11.2 Verifica que llegan los emails

Después de que termina el audit:
- Tu email personal recibe: **"Tu diagnóstico de IA — 3 ideas para automatizar tu negocio"** en ~10 segundos.
- `gibran.villarreal@cleverum.com` (o donde tengas el forwarding) recibe: **"Nuevo lead: Test Run · Test Company"** con todos los datos del lead.
- Si NO llegan: revisa Resend → **Logs** tab → ve si los emails se enviaron y qué pasó. Suele ser un DNS no verificado o un rate limit.

### 11.3 Verifica KV

CF Dashboard → **Workers & Pages** → **KV** → namespace `cleverum-kv` → tab **Keys**. Deberías ver:

- `audit:<uuid>` (1 entrada)
- `lead:<uuid>` (1 entrada)
- `rate:<tu-ip>` (1 entrada)
- `audit:count:YYYY-MM-DD` (1 entrada con valor `1`)

Si las ves, KV funciona.

### 11.4 Test de límites (opcional pero recomendado)

- Intenta correr otro audit desde la misma IP → debe responder 429 `rate_limited`.
- Eso confirma que el rate limit funciona.
- Para resetearlo en pruebas: ve al KV namespace y borra la entrada `rate:<tu-ip>`.

---

## 12. Local development con Wrangler

Para probar las Functions localmente antes de hacer push.

### 12.1 Instalar Wrangler

```bash
npm install -g wrangler
wrangler --version  # debe ser 3.x+
```

### 12.2 Login

```bash
wrangler login
```

Abre tu browser, autoriza.

### 12.3 Crear `.dev.vars`

En la raíz del repo:

```bash
cp .dev.vars.example .dev.vars
```

Edita `.dev.vars`:

```
ANTHROPIC_API_KEY=sk-ant-api-XXXXXXXXXXXX
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA  # test secret (always pass)
TURNSTILE_SITE_KEY=1x00000000000000000000AA               # test site (always pass)
RESEND_API_KEY=re_XXXXXXXXXXXX
DAILY_AUDIT_CAP=100
```

> 💡 Los test keys `1x...` de Turnstile siempre pasan validación. Son ideales para dev local.

> ⚠️ `.dev.vars` está en `.gitignore` — no se commitea.

### 12.4 Run dev con Functions

```bash
npm run build           # build inicial
wrangler pages dev dist --kv KV --compatibility-date=2026-01-01
```

Esto:
- Sirve el sitio en `http://localhost:8788`
- Ejecuta las Functions en local
- Bindea un KV namespace en memoria (no persiste entre reinicios)

Para tener auto-rebuild del frontend en paralelo, abre otra terminal:

```bash
npm run dev
```

Y otra para wrangler funcionando contra el `dist/` actualizado.

> 📌 Workflow recomendado:
> - Para frontend-only changes: usa `npm run dev` (Astro dev server con HMR).
> - Para probar endpoints `/api/audit` o `/api/lead`: usa `wrangler pages dev dist`.

---

## 13. Seguridad

### 13.1 Lo que ya está implementado

✅ **HTTPS forzado** — Cloudflare emite cert SSL auto + redirect HTTP→HTTPS.

✅ **Security headers** (en `public/_headers`):
- `X-Frame-Options: DENY` — previene clickjacking
- `X-Content-Type-Options: nosniff` — previene MIME sniffing attacks
- `Referrer-Policy: strict-origin-when-cross-origin` — limita info de referrer
- `Permissions-Policy` — bloquea acceso a camera, mic, geolocation
- `Strict-Transport-Security` — fuerza HTTPS por 1 año (HSTS preload-ready)

✅ **Anti-bot**:
- Turnstile en el form del audit (managed challenge)
- Validación server-side del token en `/api/audit`

✅ **Rate limiting**:
- 1 audit por IP cada 24 horas (KV `rate:<ip>` con TTL 86400)
- Cap global diario configurable via `DAILY_AUDIT_CAP` (default 100)

✅ **Input validation**:
- Largo mín/máx del input principal (10-500 chars)
- Largo máx de campos extra (200 chars c/u)
- Largo máx de nombre/empresa (100 chars), teléfono (25 chars)
- Email format regex + blocklist de dominios disposables (tempmail, mailinator, etc.)

✅ **Secrets management**:
- Todas las API keys encrypted en CF Dashboard
- `.env`, `.dev.vars` en `.gitignore` — nunca se commitean
- No hay secrets hardcoded en el código

✅ **JSON-LD structured data** — Schema.org Organization + Service + FAQPage para SEO y consumibilidad por LLMs.

✅ **AI bots explicit allow** — `robots.txt` permite explícitamente GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc. (16 bots). Cleverum aparece en respuestas de Claude/ChatGPT/Perplexity.

✅ **CORS strict** — `/api/audit` y `/api/lead` solo aceptan `Content-Type: application/json` y validan el body.

✅ **Cost guardrail** — cap diario evita facturas runaway si alguien intenta abusar.

✅ **No PII en logs** — el código nunca hace `console.log` de email/telefono/nombres. Si en algún momento agregas logging, asegúrate de redact PII.

### 13.2 Recomendaciones extra (opcionales, alta prioridad)

#### a) Cloudflare WAF (Web Application Firewall)

CF Dashboard → tu zona `cleverum.org` → **Security** → **WAF**.

- Activa **Managed Rules** (gratis en plan Free, más reglas en Pro).
- Crea **Custom Rules** para casos específicos:
  - Bloquear países que no necesitas servir (si solo vendes a LATAM)
  - Bloquear User-Agents de scrapers conocidos

#### b) Rate limiting a nivel zone (más agresivo)

CF Dashboard → **Security** → **WAF** → **Rate limiting rules**.

- Crea regla: max 60 requests/min por IP a `/api/*` → block 1 hour.
- Complementa el rate limit por KV que ya tienes (que es solo para audits).

#### c) Bot Fight Mode

CF Dashboard → **Security** → **Bots**.

- Activa **Bot Fight Mode** (gratis) — bloquea bots no verificados automáticamente.
- ⚠️ Asegúrate de tener en allowlist los AI bots de `robots.txt` (GPTBot, ClaudeBot, etc.) — CF debería respetarlos pero verifica los logs los primeros días.

#### d) Content Security Policy (CSP)

Actualmente no hay CSP. Para agregarla:

Edita `public/_headers`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com;
```

**Antes de activar**: te recomiendo primero usar `Content-Security-Policy-Report-Only:` durante una semana, revisar reportes en console, ajustar, y después activar la versión bloqueante.

#### e) Email forwarding con SPF/DKIM/DMARC apretado

En tus DNS records de Cloudflare:

- **SPF**: `v=spf1 include:_spf.resend.com ~all` (Resend te lo da)
- **DKIM**: el TXT record que da Resend
- **DMARC**: agrega un TXT en `_dmarc.cleverum.org` con `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@cleverum.org; pct=100;`

Esto evita que spammers usen tu dominio para spoof.

#### f) Rotation de API keys

Cada 6 meses (o cuando sospechas leak):
1. Genera nueva key en el servicio (Anthropic / Resend / Turnstile).
2. Actualízala en CF env vars.
3. Re-deploy.
4. Revoca la key vieja.

---

## 14. Costos y monitoreo

### 14.1 Anthropic

- **Por audit**: ~$0.013 USD (Haiku 4.5 con extended thinking).
- **Con cap=100/día**: ~$1.30/día = **$40/mes máximo**.
- **Realista (sin spam)**: 10-30 audits/día = $4-12/mes.
- **Monitoring**: [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage). Configura alert a $50/mes.

### 14.2 Cloudflare

- **Pages**: GRATIS para uso normal. 500 builds/mes y bandwidth ilimitado.
- **Workers/Functions**: 100,000 requests/día gratis. Tu sitio jamás llega ahí orgánicamente.
- **KV**: 100k reads + 1k writes/día gratis. Con caps que tienes, jamás te acercas.
- **Turnstile**: ilimitado, gratis.
- **DNS + WAF Free rules**: gratis.
- **Web Analytics**: gratis.

Total CF: **$0/mes** salvo que tengas mucho tráfico orgánico (lo cual es buen problema).

### 14.3 Resend

- **Free tier**: 3,000 emails/mes, 100/día.
- **Pro**: $20/mes para 50k emails/mes.
- Realista para tu volumen: free tier sobra durante el primer año.

### 14.4 Monitoreo recomendado

- **Anthropic**: alert email a $50/mes spend.
- **CF Pages**: dashboard semanal para ver deploys y errores.
- **Resend**: dashboard de logs si emails fallan.
- **CF Web Analytics**: ver tráfico, top pages, fuentes.

---

## 15. Web Analytics

CF Web Analytics es gratis, sin cookies, sin banner GDPR. Perfecto para esta landing.

### 15.1 Activar

1. CF Dashboard → tu proyecto Pages → **Web Analytics** tab.
2. **Enable** → automáticamente inyecta el script en todas las páginas servidas.
3. Listo. No requiere código adicional.

### 15.2 Métricas a monitorear

- **Pageviews** — tráfico total.
- **Unique visitors** — gente única.
- **Top pages** — qué secciones leen más.
- **Top referrers** — de dónde viene el tráfico (Google, LinkedIn, etc.).
- **Geo distribution** — desde qué países.

> 💡 Si quieres más granularidad (eventos, scroll depth, conversiones), considera **Plausible** o **Umami** (también sin cookies, también baratos/gratis).

---

## 16. SEO post-deploy

### 16.1 Google Search Console

1. Ve a [search.google.com/search-console](https://search.google.com/search-console).
2. **Add property** → `https://cleverum.org`.
3. **Verify** vía DNS TXT record o file upload (DNS es más limpio).
4. Una vez verificado, **submit sitemap**:
   - URL: `https://cleverum.org/sitemap-index.xml`
5. Google indexa en 1-7 días.

### 16.2 Bing Webmaster Tools

1. [bing.com/webmasters](https://www.bing.com/webmasters).
2. Add site `cleverum.org`.
3. Submit sitemap igual que Google.

### 16.3 Lighthouse

Una vez en producción:

```bash
npm install -g lighthouse
lighthouse https://cleverum.org --view
```

Targets:
- **Performance**: ≥95
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

Si algo baja de 95 en Performance, revisar:
- Chunk de three.js (731 KB) — ya está splitted y lazy-loaded via `client:media`.
- Imágenes — convertir a AVIF/WebP via Astro `<Image>` cuando agregues fotos reales.

### 16.4 Verificar JSON-LD

Pega `https://cleverum.org` en [Rich Results Test](https://search.google.com/test/rich-results) — debería detectar:

- **Organization**
- **Person**
- **WebSite**
- **FAQPage** (con 7 Q&A)
- **Service** (×3)

Si algo falla, ver `src/lib/jsonld.ts` y corregir.

---

## 17. Troubleshooting

### Build falla en CF Pages

**Síntoma**: deploy en CF Pages termina con error.

**Causas comunes**:

| Error | Causa | Fix |
|---|---|---|
| `Cannot find name 'KVNamespace'` | Falta `@cloudflare/workers-types` | Verifica `package.json` lo tenga en devDependencies |
| `Property 'X' does not exist on type 'Env'` | Env var no declarada en `functions/types.ts` | Agrégala al `interface Env` |
| `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY is undefined` | Falta env var en build | Agrega `PUBLIC_TURNSTILE_SITE_KEY` en CF env vars (Production + Preview) |
| Build hangs | Node version incorrecta | Agrega `NODE_VERSION=22` en CF env vars |
| `EBADENGINE sitemap requires node >=20.19.5` | Warning, no rompe | Ignora, es solo warning |

### Audit responde 401 turnstile_failed

**Causa**: el `PUBLIC_TURNSTILE_SITE_KEY` (frontend) no matchea con el `TURNSTILE_SECRET_KEY` (backend), o el hostname no está allowed en el site de Turnstile.

**Fix**:
- Verifica que ambas keys son del mismo Turnstile site.
- Verifica que `cleverum.org` está en el hostname management del site Turnstile.
- En dev: usa los test keys (`1x00...AA`).

### Audit responde 429 daily_cap_reached

**Causa**: se alcanzó `DAILY_AUDIT_CAP` (default 100).

**Fix**:
- Si es legítimo y solo necesitas más: aumenta `DAILY_AUDIT_CAP` en CF env vars y re-deploy.
- Si es spam: revisa logs, considera bajar el cap de IP individual (en código en `functions/api/_audit-utils.ts`).

### Audit responde 429 rate_limited (1/IP/24h)

**Causa**: tú mismo (u otro user) ya hizo un audit en esa IP en últimas 24h.

**Fix**:
- Esperar 24h.
- O borrar la key `rate:<ip>` en KV namespace manualmente (CF Dashboard → KV → ver entrada → delete).

### Anthropic responde 401

**Causa**: API key incorrecta o sin créditos.

**Fix**:
- Verifica el valor exacto de `ANTHROPIC_API_KEY` en CF env vars.
- Ve a [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing) y verifica que hay saldo.
- Regenera la key si dudas.

### Anthropic responde 400 model not found / thinking not supported

**Causa**: `claude-haiku-4-5-20251001` no disponible en tu cuenta, o extended thinking no habilitado.

**Fix**:
- Edita `functions/api/_audit-utils.ts` línea 5: cambia `ANTHROPIC_MODEL` a `claude-sonnet-4-6`.
- Push → CF auto-deploys.

### Emails de Resend no llegan

**Causa**: dominio no verificado, o DNS records mal configurados.

**Fix**:
- Resend → **Domains** → `cleverum.org` → ver status. Debe decir "Verified".
- Si dice "Pending", verifica que los DNS records están en CF DNS y con **Proxy status: DNS only** (no naranja).
- Revisa Resend → **Logs** para ver el detalle del envío fallido.

### Particles no aparecen en mobile

**Causa**: el ParticleField está montado con `client:media="(min-width: 768px) and (prefers-reduced-motion: no-preference)"` — solo aparece en desktop sin reduced motion.

**Fix**: comportamiento esperado. Mobile ve solo el `GradientMeshBackground` como fallback.

### Sitio se ve "vacío" en navegadores viejos

**Causa**: CSS uses `color-mix()`, `clamp()`, `:has()`, `text-wrap`, `animation-timeline: view()` — features modernas.

**Fix**: el sitio soporta últimos 2 años de browsers (>97% market share). Si necesitas IE11 o Safari 14, eso no es nuestro target.

---

## 18. Checklist final

Antes de anunciar el sitio o compartir el link:

### Functional
- [ ] `https://cleverum.org/` carga sin errores en console
- [ ] Hero → "Diagnostica mi negocio" hace smooth scroll a `#diagnostico`
- [ ] Wizard del audit avanza sin bugs (probar los 5 pasos)
- [ ] Audit completa en ~30s, llega email a user, llega notificación a Gibran
- [ ] Cases section: 3 cards se stackean al scrollear (desktop)
- [ ] Services section: 3 cards visibles, sin precios, con dots de inversión
- [ ] About section: foto placeholder + bio legible
- [ ] Footer: gradient question + arrow up funcional, link a Diagnóstico
- [ ] WhatsApp button del navbar abre con mensaje pre-llenado
- [ ] Mobile: todo el flujo funciona

### Security
- [ ] HTTPS forzado (intenta `http://cleverum.org` → redirect a https)
- [ ] Headers de seguridad activos (chequea con [securityheaders.com](https://securityheaders.com))
- [ ] No secrets en repo (`git log -p | grep -i "sk-ant\|re_\|0x4A"` — no debe haber matches)
- [ ] Turnstile bloquea bots (intenta POST a `/api/audit` con curl sin token → 401)
- [ ] Rate limit funciona (segundo audit desde misma IP → 429)
- [ ] Daily cap funciona (configurar `DAILY_AUDIT_CAP=2`, hacer 3 audits desde IPs distintas → tercero falla)

### SEO
- [ ] `robots.txt` accesible
- [ ] `sitemap-index.xml` accesible
- [ ] `llms.txt` y `llms-full.txt` accesibles
- [ ] JSON-LD detectado por [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Google Search Console: site verified + sitemap submitted
- [ ] Lighthouse: 95+ Performance, 100 SEO/A11y/BP

### Operational
- [ ] Web Analytics activo
- [ ] Email forwarding hello@cleverum.org → tu inbox funciona
- [ ] Anthropic billing alert configurado a $50/mes
- [ ] Resend dominio verified, logs accesibles
- [ ] Backup de todas las API keys en password manager

### Cosmetic / Content
- [ ] Reemplazar `REPLACE_ME` en `src/content/site.ts`:
  - `contact.calendly`
  - `socials.linkedin`
  - `socials.twitter`
  - `socials.github`
- [ ] Reemplazar foto placeholder con foto real (cuando la tengas):
  - Drop `gibran.jpg` en `public/photos/`
  - Editar `site.ts` → `about.photoSrc: '/photos/gibran.jpg'`
- [ ] Reemplazar mediaSrc de cases con screenshots/videos reales:
  - Drop assets en `public/cases/`
  - Editar `site.ts` → cada `cases.items[N].mediaSrc: '/cases/X.png'`

---

## 19. Mantenimiento mensual

Una vez activo, dedica 15 minutos al mes a:

1. **Anthropic usage**: revisa consumo, ajusta cap si necesario.
2. **CF Web Analytics**: top pages, top referrers, geo distribution.
3. **Resend logs**: verifica bounce rate, deliverability.
4. **CF Pages deploys**: borra deploys preview viejos (CF los mantiene por 30 días por default).
5. **KV usage**: ver que no haya keys huérfanas o crecimiento inesperado.
6. **Search Console**: ver qué queries traen tráfico, qué páginas Google indexa.
7. **Audit leads**: revisar `lead:*` keys en KV → exportar manualmente o construir un dashboard ligero más adelante.
8. **Lighthouse re-run**: verificar que sigue ≥95.

Cada **6 meses**:

- Rotar API keys (Anthropic, Resend).
- Actualizar dependencies del repo (`npm outdated` → `npm update`).
- Revisar CF security alerts.

---

## Referencias rápidas

| Recurso | URL |
|---|---|
| CF Dashboard | https://dash.cloudflare.com |
| CF Pages docs | https://developers.cloudflare.com/pages/ |
| CF Functions docs | https://developers.cloudflare.com/pages/functions/ |
| CF KV docs | https://developers.cloudflare.com/kv/ |
| Turnstile | https://dash.cloudflare.com/?to=/:account/turnstile |
| Anthropic Console | https://console.anthropic.com |
| Anthropic API docs | https://docs.anthropic.com |
| Resend | https://resend.com |
| Resend API docs | https://resend.com/docs |
| Wrangler docs | https://developers.cloudflare.com/workers/wrangler/ |
| Search Console | https://search.google.com/search-console |
| Rich Results Test | https://search.google.com/test/rich-results |
| Security Headers checker | https://securityheaders.com |

---

## Archivos clave del repo

| Archivo | Para qué sirve |
|---|---|
| `functions/types.ts` | Define la interface `Env` con todas las env vars |
| `functions/_middleware.ts` | CORS preflight |
| `functions/api/audit.ts` | Pipeline AI Audit (3 agentes + SSE stream) |
| `functions/api/lead.ts` | Endpoint mini-ask de email post-audit |
| `functions/api/_audit-utils.ts` | Helpers: Turnstile verify, KV rate-limit, Anthropic API calls |
| `functions/api/_lead-handler.ts` | Shared module: persist lead + send emails |
| `functions/api/_email-template.ts` | Templates HTML del email al cliente y a Gibran |
| `src/content/site.ts` | Single source of truth para todo el copy del sitio |
| `src/lib/audit/patterns.ts` | 15 patrones de automatización (inyectados al prompt del analyst) |
| `src/lib/audit/prompts.ts` | Los 3 system prompts del pipeline |
| `src/lib/audit/types.ts` | Types compartidos backend/frontend |
| `src/lib/jsonld.ts` | Builder del JSON-LD para SEO |
| `public/_headers` | Security + cache headers para CF Pages |
| `public/_redirects` | Reglas de redirect (vacío por ahora) |
| `public/robots.txt` | Robots con AI bots explicit allow |
| `astro.config.mjs` | Config Astro: output static, manualChunks, prefetch |
| `.dev.vars.example` | Template de env vars para Functions (local) |
| `.env.example` | Template de env vars para Astro frontend (local) |

---

Si algo del flujo se rompe en producción y no encuentras la causa, manda los logs (CF Pages → Functions → Real-time logs) y vemos qué fallo.
