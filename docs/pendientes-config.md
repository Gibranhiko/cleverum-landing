# Pendientes de configuración — Gibran

Cosas que el código ya soporta pero que **tú tienes que configurar** en paneles externos
(Resend, Cloudflare, Anthropic). El código no puede hacerlas solo.

Orden recomendado: **1 → 2 → 3 → 4**. Lo demás es opcional/hardening.

---

## 0. Variables de entorno que el sitio espera

Todas se ponen en **Cloudflare Pages → tu proyecto → Settings → Environment variables**,
en **Production Y Preview**. Tras cambiarlas, hay que **re-deployar** (Deployments → ⋯ → Retry,
o un push) para que tomen efecto.

| Variable                    | Para qué                      | ¿Encrypt? | Estado                     |
| --------------------------- | ----------------------------- | --------- | -------------------------- |
| `ANTHROPIC_API_KEY`         | Motor de IA del diagnóstico   | Sí        | ✅ (ya la tienes)          |
| `PUBLIC_TURNSTILE_SITE_KEY` | Widget anti-bot (frontend)    | No        | ⬜ confirmar               |
| `TURNSTILE_SECRET_KEY`      | Validación anti-bot (backend) | Sí        | ⬜ confirmar               |
| `RESEND_API_KEY`            | Envío de correos              | Sí        | ❌ **pendiente (tarea 1)** |
| `DAILY_AUDIT_CAP`           | Tope diario de audits (costo) | No        | ❌ **pendiente (tarea 2)** |
| `AUDIT_IP_ALLOWLIST`        | Tu IP sin límites (pruebas)   | No        | ⬜ opcional                |

> ⚠️ `PUBLIC_TURNSTILE_SITE_KEY` se **hornea en el build** → si la cambias, hay que re-deployar
> sí o sí o el front no la ve.

---

## 1. Resend (correos) — PRINCIPAL ❌

Sin esto, el diagnóstico funciona pero **no llega ningún correo** (ni al cliente ni a ti),
aunque la UI lo prometa.

- El código manda **desde `hello@cleverum.org`** → el dominio a verificar en Resend es **`cleverum.org`**.
- Te notifica a ti en **`gibran.villarreal@cleverum.com`** (reply-to, no necesita verificación).
- **El DNS de `cleverum.org` vive en Cloudflare** (nameservers `tim/priscilla.ns.cloudflare.com`).
  Namecheap es solo el registrador → **los registros van en Cloudflare, NO en Namecheap.**

**Pasos:**

- [ ] **Crear cuenta** en [resend.com](https://resend.com).
- [ ] **Domains → Add Domain → `cleverum.org`.** Te da ~3 registros (MX + 2 TXT, a veces 1 CNAME DKIM).
- [ ] **Cloudflare → zona `cleverum.org` → DNS → Records → Add record** por cada uno:
  - **Name:** solo la parte izquierda (`send`, `resend._domainkey`), Cloudflare agrega `.cleverum.org` solo.
  - **Content/Value:** exacto lo que da Resend. MX → con su **Priority** (típico 10).
  - Si hay **CNAME**: ponlo en **DNS only** (nube **gris**, no naranja).
- [ ] **Resend → Verify** (1–15 min) → debe decir **Verified ✅**.
- [ ] **Resend → API Keys → Create** (permiso _Sending access_) → copia `re_…` (solo se muestra una vez).
- [ ] **Cloudflare Pages → env vars →** `RESEND_API_KEY` = la key (**Encrypt**), Production + Preview.
- [ ] **Re-deploy** y **probar** con un diagnóstico usando tu email real.

---

## 2. `DAILY_AUDIT_CAP` (tope de costo + correos) ❌

Tope de audits gratis por día. Es tu freno de costo y de cuota de correos.

- [ ] **Cloudflare Pages → env vars →** `DAILY_AUDIT_CAP = 40` (Production + Preview) → re-deploy.

**Por qué 40:** cada audit manda **2 correos** (cliente + tu notificación). Resend free = **100/día**.
Con 40 audits = 80 correos, dentro del límite. Si subes el cap, sube tu plan de Resend o se cortarán
los correos del día.

> El código además ya aplica un **cap por hora** (~¼ del diario) y **3 audits por IP/día** automáticamente.

---

## 3. Alerta de gasto en Anthropic 🟠

Red de seguridad contra abuso de costo.

- [ ] [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing) →
      configurar **billing alert** (sugerido $20–50 USD/mes).
- [ ] Revisar el uso de vez en cuando en [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage).

---

## 4. Confirmar Turnstile (anti-bot) ⬜

Ya lo configuraste; solo confirma que quedó bien:

- [ ] Cloudflare → Turnstile → tu widget tiene los hostnames: `cleverum.org`, `www.cleverum.org`,
      `cleverum-landing.pages.dev`, `localhost`.
- [ ] `PUBLIC_TURNSTILE_SITE_KEY` (Plain) y `TURNSTILE_SECRET_KEY` (Encrypt) están en Pages env vars
      (Production + Preview) → re-deploy.
- [ ] Probar: si el form dice _"El diagnóstico no está disponible"_, falta la site key o el re-deploy.

---

## 5. Opcionales (hardening adicional)

- [ ] **AUDIT_IP_ALLOWLIST** — tu IP pública ([whatismyipaddress.com](https://whatismyipaddress.com))
      separada por comas, para testear sin toparte el rate-limit. Pages env vars + re-deploy.
- [ ] **WAF / Rate limiting de Cloudflare** (zona `cleverum.org` → Security → WAF → Rate limiting rule):
      máx ~60 req/min por IP a `/api/*` → block. Complementa el rate-limit del código.
- [ ] **Bot Fight Mode** (Security → Bots) — gratis. Ojo: verifica que no bloquee los AI bots de tu `robots.txt`.

---

## 6. Decisión de producto (no es config, es tu llamada)

- [ ] **¿Te notifico por cada lead o solo los de mayor intención?**
      Hoy te llega un correo por **cada** diagnóstico (incluido spam si hay abuso). Alternativa:
      notificarte solo cuando el lead deja **teléfono**. Si quieres ese filtro, avísame y lo programo.

---

## Cómo probar que todo quedó (smoke test)

1. Abre el sitio → "Diagnostica mi negocio" → llena el wizard con **tu email real**.
2. Debe correr el análisis (~1 min) y mostrar 1 oportunidad.
3. Te debe llegar: el **reporte** a tu email + la **notificación de lead** a `gibran.villarreal@cleverum.com`.
4. (Abuso) Corre 4+ audits seguidos desde la misma IP → al 4º debe responder _rate_limited_ (429).
5. Revisa **Cloudflare → Storage & Databases → KV → cleverum-kv** → deben aparecer `audit:*`, `lead:*`,
   `rate:*`, `audit:count:*`.
