# CampusCafe - Dashboard de Reportes

Sistema de reportes para una cafeteria de campus. Consulta datos de ventas, productos, inventario, clientes y pagos a traves de VIEWS en PostgreSQL. La aplicacion corre con Docker Compose y aplica seguridad real: el usuario de aplicacion (`app_user`) solo tiene permisos de `SELECT` sobre las VIEWS, sin acceso directo a tablas.

---

## Tabla de Contenidos

1. [Tecnologias](#tecnologias)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Modelo de Datos](#modelo-de-datos)
4. [VIEWS Implementadas](#views-implementadas)
5. [Requisitos Previos](#requisitos-previos)
6. [Instalacion y Ejecucion](#instalacion-y-ejecucion)
7. [Acceso a la Aplicacion](#acceso-a-la-aplicacion)
8. [Reportes Disponibles](#reportes-disponibles)
9. [Filtros, Busqueda y Paginacion](#filtros-busqueda-y-paginacion)
10. [Seguridad de Base de Datos](#seguridad-de-base-de-datos)
11. [Indices y Evidencia EXPLAIN](#indices-y-evidencia-explain)
12. [Solucion de Problemas](#solucion-de-problemas)

---

## Tecnologias

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Base de Datos | PostgreSQL 16 |
| Validacion | Zod |
| Estilos | Tailwind CSS |
| Contenedores | Docker + Docker Compose |
| Runtime | Node.js 20 (Alpine Linux) |

---

## Estructura del Proyecto

```
Evaluaci-n-Practica-U1/
├── db/
│   ├── schema.sql          # Tablas y constraints
│   ├── indexes.sql         # Indices para optimizacion
│   ├── seed.sql            # Datos de prueba
│   ├── migrate.sql         # Migraciones (drop de vistas previas)
│   ├── reports_vw.sql      # 6 VIEWS de reportes
│   └── roles.sql           # Rol app_user con permisos restringidos
├── src/
│   ├── app/
│   │   ├── api/reports/    # API Routes (backend)
│   │   │   ├── sales/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── payments/
│   │   │   └── sales-channel/
│   │   ├── reports/        # Paginas de reportes (frontend)
│   │   │   ├── sales/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   └── payments/
│   │   ├── page.tsx        # Dashboard principal
│   │   └── layout.tsx      # Layout con sidebar
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── ui/
│   │       ├── KPICard.tsx
│   │       └── ReportTable.tsx
│   └── lib/
│       ├── db.ts           # Conexion y pool de PostgreSQL
│       ├── data.ts         # Funciones de acceso a datos (Zod)
│       └── definitions.ts  # Interfaces TypeScript
├── docker-compose.yml
├── Dockerfile
├── .env
└── package.json
```

---

## Modelo de Datos

El esquema consta de 6 tablas con 4 relaciones FK reales:

```
categories ──< products ──< order_items >── orders >── customers
                                              │
                                           payments
```

| Tabla | Descripcion | FK |
|---|---|---|
| `categories` | Categorias de productos | - |
| `products` | Catalogo de productos | `category_id -> categories` |
| `customers` | Clientes registrados | - |
| `orders` | Ordenes de compra | `customer_id -> customers` |
| `order_items` | Detalle de cada orden | `order_id -> orders`, `product_id -> products` |
| `payments` | Pagos realizados | `order_id -> orders` |

Los datos de prueba incluyen 4 categorias, 20 productos, 15 clientes, 50 ordenes y 37 pagos.

---

## VIEWS Implementadas

Se implementaron 6 VIEWS en `db/reports_vw.sql`. Cada una incluye documentacion con queries VERIFY.

| VIEW | Grain | Agregados | Tecnica SQL |
|---|---|---|---|
| `vw_sales_daily` | 1 fila por dia+canal | SUM, COUNT | HAVING |
| `vw_top_products_ranked` | 1 fila por producto | SUM, COUNT, RANK() | Window Function, HAVING |
| `vw_inventory_risk` | 1 fila por producto | SUM, COALESCE | CASE, COALESCE |
| `vw_customer_value` | 1 fila por cliente | SUM, AVG, COUNT, MIN, MAX | CTE (WITH), COALESCE |
| `vw_sales_channel` | 1 fila por canal | SUM, COUNT, AVG | GROUP BY |
| `vw_payment_mix` | 1 fila por metodo de pago | SUM, COUNT, ROUND | Subquery |

Cumplimiento de requisitos:

- 2 VIEWS con HAVING: `vw_sales_daily`, `vw_top_products_ranked`
- 2 VIEWS con CASE o COALESCE significativo: `vw_inventory_risk` (CASE), `vw_customer_value` (COALESCE)
- 1 VIEW con CTE (WITH): `vw_customer_value`
- 1 VIEW con Window Function: `vw_top_products_ranked` (RANK() OVER)
- Todas las VIEWS listan columnas explicitas con aliases legibles (ninguna usa SELECT *)
- Cada VIEW tiene comentario con descripcion, grain, metricas y queries VERIFY

---

## Requisitos Previos

- Docker Desktop 4.20 o superior (con Docker Compose integrado)
- Git
- Un navegador web moderno

---

## Instalacion y Ejecucion

### Paso 1. Clonar el repositorio

```bash
git clone https://github.com/Chafael/Evaluaci-n-Practica-U1.git
cd Evaluaci-n-Practica-U1
```

### Paso 2. Verificar el archivo .env

El repositorio incluye un archivo `.env` con las variables de configuracion. Verificar que exista y contenga:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cafepro
CAFE_APP_USER=app_user
CAFE_APP_PASSWORD=secure_pass
NODE_ENV=development
```

### Paso 3. Construir y levantar los contenedores

```bash
docker compose up --build
```

Este comando realiza lo siguiente en orden:
1. Construye la imagen de la aplicacion Next.js desde el `Dockerfile`
2. Levanta el contenedor de PostgreSQL (`cafepro_db`)
3. Ejecuta los scripts SQL de inicializacion en orden:
   - `01-schema.sql` - Crea las 6 tablas con constraints
   - `02-indexes.sql` - Crea los indices de optimizacion
   - `03-seed.sql` - Inserta datos de prueba
   - `04-migrate.sql` - Drop de vistas previas
   - `05-reports_vw.sql` - Crea las 6 VIEWS de reportes
   - `06-roles.sql` - Crea el rol `app_user` con permisos restringidos
4. Levanta el contenedor de la aplicacion (`cafepro_web`) una vez que la BD esta sana

### Paso 4. Esperar a que el sistema este listo

El primer build puede tomar entre 2-5 minutos. El sistema esta listo cuando se muestra:

```
cafepro_web  |   ▲ Next.js 15.x.x
cafepro_web  |   - Local:        http://localhost:3000
```

### Paso 5. Abrir la aplicacion

Abrir el navegador en: **http://localhost:3000**

### Detener los contenedores

```bash
docker compose down
```

### Reiniciar con base de datos limpia

Para recrear la BD desde cero, eliminar el volumen:

```bash
docker compose down -v
docker compose up --build
```

---

## Acceso a la Aplicacion

| Servicio | URL/Puerto |
|---|---|
| Aplicacion Web | http://localhost:3000 |
| PostgreSQL | `localhost:5432` (usuario: `app_user`, password: `secure_pass`, BD: `cafepro`) |

---

## Reportes Disponibles

| Ruta | Reporte | KPIs | Funcionalidad |
|---|---|---|---|
| `/` | Dashboard | Ingresos totales, ordenes, ticket promedio, clientes, productos | Vista general con KPIs |
| `/reports/sales` | Ventas Diarias | Ingresos por dia | Filtro por rango de fechas |
| `/reports/products` | Top Productos | Unidades vendidas, revenue | Busqueda por nombre + paginacion |
| `/reports/inventory` | Riesgo de Inventario | Productos en riesgo, total | Filtro por categoria |
| `/reports/customers` | Valor de Clientes | Total de clientes | Paginacion server-side |
| `/reports/payments` | Metodos de Pago | Total recaudado, metodos | Tabla de distribucion |

---

## Filtros, Busqueda y Paginacion

Todas las validaciones de entrada se realizan con Zod en las API Routes.

### Filtros

- **Ventas Diarias** (`/api/reports/sales`): Parametros `from` y `to` validados como fechas ISO.
- **Inventario** (`/api/reports/inventory`): Parametro `category` validado como string opcional.

### Busqueda

- **Top Productos** (`/api/reports/products`): Parametro `q` busca por nombre de producto o categoria (ILIKE con query parametrizada).

### Paginacion Server-Side

- **Top Productos** (`/api/reports/products`): Parametros `page` (int >= 1) y `limit` (int 1-100) con `LIMIT/OFFSET`.
- **Valor de Clientes** (`/api/reports/customers`): Misma validacion con Zod y paginacion server-side.

---

## Seguridad de Base de Datos

La aplicacion Next.js se conecta a PostgreSQL con el usuario `app_user`, no con `postgres`. El archivo `db/roles.sql` configura los permisos:

```sql
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_pass';
GRANT CONNECT ON DATABASE cafepro TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
GRANT SELECT ON vw_sales_daily TO app_user;
GRANT SELECT ON vw_top_products_ranked TO app_user;
GRANT SELECT ON vw_inventory_risk TO app_user;
GRANT SELECT ON vw_customer_value TO app_user;
GRANT SELECT ON vw_sales_channel TO app_user;
GRANT SELECT ON vw_payment_mix TO app_user;
```

### Verificacion de Seguridad

Con los contenedores corriendo, ejecutar los siguientes comandos para verificar que `app_user` no puede acceder directamente a las tablas:

**Intento de acceso a tabla (debe fallar):**

```bash
docker exec -it cafepro_db psql -U app_user -d cafepro -c "SELECT * FROM orders LIMIT 1;"
```

Resultado esperado:
```
ERROR:  permission denied for table orders
```

**Acceso a VIEW (debe funcionar):**

```bash
docker exec -it cafepro_db psql -U app_user -d cafepro -c "SELECT * FROM vw_sales_daily LIMIT 3;"
```

Resultado esperado: tres filas con datos de ventas diarias.

**Listar permisos del rol:**

```bash
docker exec -it cafepro_db psql -U postgres -d cafepro -c "\dp vw_*"
```

Esto muestra que solo `app_user` tiene `SELECT` sobre las vistas.

---

## Indices y Evidencia EXPLAIN

Se crearon 6 indices en `db/indexes.sql`:

```sql
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_active ON products(active) WHERE active = TRUE;
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
```

### Evidencia EXPLAIN

Para ejecutar EXPLAIN conectarse a la BD:

```bash
docker exec -it cafepro_db psql -U postgres -d cafepro
```

**Consulta 1: Ventas diarias filtradas por fecha**

```sql
EXPLAIN ANALYZE
SELECT * FROM vw_sales_daily
WHERE sale_date >= '2025-12-01' AND sale_date <= '2026-01-31';
```

Esta consulta se beneficia de `idx_orders_date` sobre `orders(created_at)`, que es la columna base de `sale_date`. El plan de ejecucion muestra uso de Index Scan sobre el indice en lugar de Seq Scan.

**Consulta 2: Productos por categoria**

```sql
EXPLAIN ANALYZE
SELECT * FROM vw_top_products_ranked
WHERE category_name = 'Bebidas Calientes';
```

Esta consulta se beneficia de `idx_products_category` sobre `products(category_id)`, que acelera el JOIN entre productos y categorias usado internamente por la vista.

---

## Solucion de Problemas

**Puerto 5432 ocupado:**
Detener cualquier instancia local de PostgreSQL antes de levantar Docker.

```bash
docker compose down
```

**La base de datos no se inicializa:**
Los scripts SQL solo se ejecutan cuando el volumen es nuevo. Para forzar la reinicializacion:

```bash
docker compose down -v
docker compose up --build
```

**Errores de line endings en Windows:**
Si algún script `.sh` falla con `bad interpreter`, configurar Git para mantener line endings Unix:

```bash
git config core.autocrlf input
```

Luego recrear los contenedores con `docker compose down -v` y `docker compose up --build`.