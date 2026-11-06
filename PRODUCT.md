# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Storage, Auth, Edge Functions), Framer Motion, Lucide React, Recharts.

## Users
Primary User: "Paciente 0" (el propio usuario), persona proactiva y analítica enfocada en optimizar su salud, rendimiento y longevidad (Medicina 3.0). Busca tener soberanía absoluta sobre sus datos biomédicos y anticipar patologías o desbalances mucho antes de que se manifiesten síntomas clínicos.

## Product Purpose
SattvaHealth existe para erradicar la medicina puramente reactiva mediante la unificación de todos los registros de salud de una persona en un solo ecosistema inteligente. Transforma datos dispersos, heterogéneos e incompatibles (wearables continuos + informes clínicos discretos en PDF) en inteligencia preventiva longitudinal, detectando anomalías, correlaciones cruzadas y velocidad de cambio respecto a la propia línea base del paciente.

## Positioning
A diferencia de los portales clínicos tradicionales (silos cerrados que evalúan la salud comparando con rangos de población enferma o sedentaria) y de las apps de wearables comerciales (que monitorean actividad física y sueño sin contexto metabólico ni bioquímico), SattvaHealth fusiona la película de alta frecuencia continua (wearables) con las fotos de alta resolución clínica (análisis de sangre y exámenes estandarizados con IA) para calcular la línea base individual y advertir desviaciones tempranas.

## Operating Context
- Ingesta de documentos clínicos en PDF (exámenes de sangre, perfiles bioquímicos, ECG, Holter, informes de radiología).
- Sincronización continua vía API con wearables (Google Health Connect / Fitbit Web API) para ingesta de VFC (HRV), frecuencia cardíaca en reposo (RHR), fases de sueño, temperatura y actividad.
- Interacción y consulta en dashboards web de alto rendimiento con estética Apple Health, optimizados para pantallas de escritorio y dispositivos móviles.
- Revisiones periódicas o preparación de resúmenes longitudinales para consultas médicas especializadas.

## Capabilities and Constraints
- Ingesta y almacenamiento seguro de PDFs médicos en Supabase Storage con encriptación.
- Pipeline de extracción y normalización de biomarcadores mediante IA multimodal (Gemini Vision) con salida estructurada en JSON.
- Base de datos relacional y de series temporales en Supabase (PostgreSQL) para gestionar tanto métricas diarias continuas como análisis de laboratorio esporádicos.
- Motor de cálculo de líneas base personales y detección de deriva (desviaciones estándar y Z-scores individuales).
- Estricta privacidad y control total del Paciente 0 sobre su identidad y registros.
- Arquitectura Web-first ultra-fluida, responsiva y táctil según Apple Human Interface Guidelines (HIG).

## Brand Commitments
- Nombre: SattvaHealth (del sánscrito *Sattva*, que representa pureza, claridad, equilibrio y armonía).
- Tono: Riguroso, sereno, científico, predictivo y empoderador.
- Estética vinculante: Apple Human Interface Guidelines (modo oscuro profundo `#000000`, tarjetas translúcidas con `backdrop-blur-xl`, bordes hairline `border-white/[0.08]`, paleta semántica Apple Health, animaciones fluidas con física de resortes).

## Evidence on Hand
- Archivo README.md inicial en el repositorio.
- Reglas y directivas de diseño establecidas en `GEMINI.md`, `.agents/rules/apple-design-system.md` y `.agents/skills/apple-health-ui/SKILL.md`.
- No hay datos médicos reales precargados; se requerirá cargar los primeros PDFs y credenciales de API de Fitbit/Google Health para el Paciente 0.

## Product Principles
1. **Línea Base Personal > Rangos Poblacionales**: La salud del Paciente 0 se evalúa contra su propio historial y velocidad de cambio, no contra rangos estadísticos de la población general.
2. **Fusión Continua + Discreta**: Las métricas de wearables y los biomarcadores sanguíneos se potencian mutuamente al analizarse en una única línea de tiempo correlacionada.
3. **Soberanía y Portabilidad Absoluta**: El paciente es el dueño indiscutible de su dato médico; sin depender de portales cautivos de clínicas o aseguradoras.
4. **Claridad Táctica y Cero Ruido**: Los insights deben ser transparentes, accionables y respaldados por datos, evitando tanto falsas alarmas como sobrecarga de información.

## Accessibility & Inclusion
- Contraste optimizado para modo oscuro profundo (`#000000` / `#09090b`).
- Tipografía SF Pro / Inter con ajuste óptico y escalado relativo (`rem`/`em`).
- Soporte para `prefers-reduced-motion` mediante transiciones suaves sin movimiento agresivo.
