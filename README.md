# 💸 Fintrac — Finanzas Personales con IA

> Escaneá comprobantes, importá CSV de Mercado Pago y tomá el control de tus gastos. Todo desde el navegador, sin servidores, sin cuentas.

**🔗 Live:** [j-descalzo.github.io/fintrac](https://j-descalzo.github.io/fintrac)

---

## ¿Qué es Fintrac?

Una app de finanzas personales que corre 100% en el navegador (GitHub Pages) y usa la API de Claude para leer comprobantes con visión por computadora. Sin backend propio. Sin base de datos en la nube. Tus datos viven en tu dispositivo.

## ✨ Features

| Feature | Descripción |
|---|---|
| 📷 **Escáner de comprobantes** | Subí una foto o captura y la IA extrae monto, fecha, comercio y categoría automáticamente |
| 📥 **Import CSV Mercado Pago** | Soporta el formato de exportación oficial de MP con ETL automático |
| 🏷️ **Alias & ETL** | Normalizá nombres de comercios con alias reutilizables |
| 🗂️ **Categorización editable** | Asigná y editá categorías inline sobre cada transacción |
| 📤 **Export CSV/XLSX** | Exportá tus datos en cualquier momento con SheetJS |
| 🔑 **Modo sin API key** | Usá import manual y CSV sin necesitar la API de Claude |
| ⚙️ **Pestaña Config** | Configurá tu API key, alias y preferencias desde la app |
| 📱 **PWA instalable** | Instalala en Android (y desktop) como app nativa |

---

## 🛠️ Stack

```
HTML / CSS / JS puro  →  sin frameworks, sin bundlers
Claude Vision API     →  claude-sonnet (escáner de comprobantes)
SheetJS               →  lectura y escritura de XLSX/CSV
GitHub Pages          →  hosting gratuito y deploy automático
Service Worker        →  offline support + instalación PWA
```

---

## 📱 PWA — Instalación en Android

Fintrac es una **Progressive Web App** instalable. Una vez que la abrís en Chrome para Android:

1. Chrome muestra automáticamente el banner "Instalar Fintrac"
2. Tocás **Instalar**
3. Aparece en tu pantalla de inicio como cualquier app nativa
4. Funciona **offline** para ver y editar transacciones ya cargadas
5. El escáner con IA requiere conexión (llama a la API de Anthropic)

### Instalación manual
Chrome → menú (⋮) → **"Agregar a pantalla de inicio"**

---

## 🚀 Setup local

```bash
# Clonar
git clone https://github.com/j-descalzo/fintrac.git
cd fintrac

# Servir localmente (necesario para que el SW funcione)
npx serve . -p 3000
# o
python3 -m http.server 3000

# Abrir
open http://localhost:3000
```

> ⚠️ El Service Worker **requiere HTTPS o localhost**. No funciona abriendo el HTML directamente con `file://`.

---

## 🔑 API Key de Claude

1. Creá una cuenta en [console.anthropic.com](https://console.anthropic.com)
2. Generá una API key
3. En Fintrac → pestaña **Config** → pegá tu key
4. La key se guarda en `localStorage` (solo en tu dispositivo)

Sin API key podés usar todas las features excepto el escáner de comprobantes.

---

## 📁 Estructura del proyecto

```
fintrac/
├── index.html          # App completa (single-file)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── icons/              # Íconos PWA (72px → 512px)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── ...
└── README.md
```

---

## 🗺️ Roadmap

- [x] Escáner de comprobantes con Claude Vision
- [x] Import CSV Mercado Pago
- [x] ETL con alias
- [x] Categorización editable
- [x] Export CSV/XLSX
- [x] Modo sin API key
- [x] **PWA instalable en Android**
- [ ] Post de LinkedIn con la historia del build
- [ ] Backend mínimo para modelo freemium / Pro
- [ ] Soporte multi-banco (BBVA, Santander, Naranja X)
- [ ] Gráficos de evolución mensual
- [ ] Reglas de categorización automática

---

## 🤝 Contribuciones

Issues y PRs son bienvenidos. Si usás Fintrac y encontrás algo roto, abrí un issue con el CSV/comprobante que falla (sin datos sensibles).

---

## 📄 Licencia

MIT — hacé lo que quieras, con crédito.

---

*Construido con 🧉 y Claude · Argentina 2025*
