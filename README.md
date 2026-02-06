# CampusCafe - Sistema de Gestión de Cafetería

CampusCafe es una plataforma web integral desarrollada para optimizar la administración operativa de una cafetería universitaria. El sistema centraliza el control de ventas, inventario y gestión de clientes mediante una arquitectura basada en microservicios contenerizados, ofreciendo una interfaz reactiva y herramientas de análisis de datos en tiempo real.

## Características del Sistema

### Módulo Administrativo
Visualización de indicadores clave de rendimiento (KPIs) en tiempo real, incluyendo métricas de ingresos diarios, volumen de tickets y ticket promedio.

### Gestión de Inventario
Control detallado de stock de productos con un sistema de alertas automatizadas que notifica visualmente cuando los productos alcanzan niveles críticos de existencias (menos de 10 unidades).

### Control de Transacciones
Registro histórico inmutable de todas las ventas realizadas, permitiendo el filtrado avanzado por rango de fechas, cliente o estado del pedido para una trazabilidad completa.

### Gestión de Clientes
Base de datos de clientes frecuentes que permite el análisis del historial de compras para identificar tendencias de consumo.

## Especificaciones Técnicas

El proyecto ha sido construido utilizando un stack tecnológico moderno enfocado en el rendimiento y la mantenibilidad.

* Frontend Framework: Next.js 15 (App Router Architecture)
* Biblioteca de UI: React 19 con TypeScript
* Estilos: Tailwind CSS
* Base de Datos: PostgreSQL 16
* Infraestructura: Docker y Docker Compose
* Entorno de Ejecución: Node.js 20 (Alpine Linux)

## Requisitos del Sistema

Para ejecutar el entorno de desarrollo localmente, el equipo de cómputo debe cumplir con las siguientes especificaciones.

### Requisitos de Hardware
* Procesador: Intel Core i3 / Ryzen 3 (Mínimo) - Intel Core i5 (Recomendado)
* Memoria RAM: 8 GB (Mínimo) - 16 GB (Recomendado para Docker)
* Almacenamiento: 10 GB de espacio libre en disco

### Requisitos de Software
* Docker Desktop (Versión 4.20 o superior)
* Git (Control de versiones)
* Navegador Web (Chrome, Edge o Firefox)

## Guía de Instalación y Despliegue

Siga estos pasos estrictos para inicializar el proyecto en un entorno local.

1. Clonar el Repositorio
Obtenga una copia del código fuente utilizando el comando de clonación de git en su terminal.

2. Ejecución con Docker Compose
Navegue al directorio del proyecto y ejecute el comando para construir las imágenes y levantar los servicios. El sistema configurará automáticamente la base de datos y las variables de entorno necesarias.

Comando: docker compose up --build

3. Verificación
Espere a que la terminal indique que el servidor está listo. El proceso de construcción inicial puede tomar algunos minutos dependiendo de la velocidad de conexión a internet.

## Acceso a la Aplicación

Una vez desplegado, el sistema estará disponible en las siguientes direcciones locales:

* Aplicación Web: http://localhost:3000
* Base de Datos (Puerto Externo): 5432

## Solución de Problemas

Si encuentra errores relacionados con el puerto 5432, asegúrese de detener cualquier servicio local de PostgreSQL antes de iniciar los contenedores de Docker.