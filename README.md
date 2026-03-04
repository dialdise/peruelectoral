# Transparencia Electoral Perú 2026

Plataforma de transparencia electoral con datos en tiempo real del JNE (Jurado Nacional de Elecciones).

🌐 **Live:** https://dialdise.github.io/peru-electoral/

## Características

- Datos en tiempo real desde la API oficial del JNE
- Consulta de candidatos por cargo: Presidente, Vicepresidente, Senadores, Diputados, Parlamento Andino
- Filtros por partido, estado y búsqueda por nombre/DNI
- Estadísticas de estado de inscripción (Inscrito, Improcedente, Exclusión, Renuncia, Apelación)

## Fuente de datos

API oficial: `https://web.jne.gob.pe/serviciovotoinformado/`

## Desarrollo local

```bash
npm install
npm run dev
```

## Despliegue

El sitio se despliega automáticamente en GitHub Pages al hacer push a `main`.
