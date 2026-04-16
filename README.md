# 🦅 Club Atlético Deportivo Acarigua - Sistema de Gestión Deportiva

Este proyecto es una aplicación web integral diseñada para la recopilación, monitoreo y análisis antropométrico del rendimiento deportivo de los atletas del **Club Atlético Deportivo Acarigua**.

## 📖 Descripción del Proyecto

El sistema centraliza la información técnica y médica del club, facilitando el seguimiento del progreso físico de los jugadores a través de mediciones periódicas, control de asistencias y generación de reportes técnicos detallados.

### 🌟 Características Principales

- **Gestión de Atletas:** Registro detallado de deportistas con información personal, técnica, médica y de contacto (incluyendo representante y dirección detallada).
- **Monitoreo Antropométrico:** Seguimiento de peso, altura, envergadura e índices de masa corporal.
- **Evaluación de Rendimiento:** Registro de tests físicos especializados (Fuerza, Resistencia, Velocidad, Coordinación y Reacción).
- **Ficha Médica Digital:** Historial de salud, alergias, condiciones crónicas y gestión de carnet de discapacidad.
- **Control de Asistencias:** Registro diario de presencia en los entrenamientos por categorías.
- **Gestión del Plantel:** Administración de entrenadores y personal del club con roles específicos.
- **Reportes Técnicos en PDF:** Generación e impresión de fichas técnicas individuales con gráficos y métricas de progreso.
- **Seguridad:** Sistema de permisos basado en roles (RBAC) y autenticación segura mediante **JSON Web Tokens (JWT)**.

### 🛡️ Seguridad y Roles (RBAC)

El sistema implementa un modelo de Control de Acceso Basado en Roles para garantizar la integridad y privacidad de la información:

- **Súper Usuario / Administrador:** Acceso total a todos los módulos, incluyendo la configuración del sistema, gestión de usuarios y personal. Debido a la ausencia de un médico de planta constante, el administrador tiene permisos para actualizar fichas médicas.
- **Entrenador:** Orientado al seguimiento técnico. Puede registrar asistencias y actualizar datos de **Rendimiento y Antropometría** de los atletas. Tiene acceso de solo lectura a los datos personales y médicos básicos. No tiene acceso a la configuración ni a la gestión de personal.

#### Matriz de Permisos

| Módulo | Súper / Admin | Entrenador |
| :--- | :---: | :---: |
| **Atletas (Datos Personales)** | Escritura | Lectura |
| **Ficha Médica** | Escritura | Lectura |
| **Rendimiento y Antropometría** | Escritura | **Escritura** |
| **Control de Asistencias** | Escritura | Escritura |
| **Gestión del Plantel** | Escritura | Sin Acceso |
| **Configuración del Sistema** | Escritura | Sin Acceso |
| **Reportes** | Todos | Todos |

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [Vue.js 3](https://vuejs.org/) con [Element Plus](https://element-plus.org/)
- **Backend:** [Node.js](https://nodejs.org/) con [Express](https://expressjs.com/)
- **Base de Datos:** [MySQL](https://www.mysql.com/)
- **Autenticación:** [JSON Web Tokens (JWT)](https://jwt.io/)
- **Generación de PDF:** [pdfmake](http://pdfmake.org/)

## 🚀 Instalación y Uso

Para poner en marcha el proyecto, consulte la guía detallada en:
👉 [**SETUP.md**](./SETUP.md)

## 👥 Autores - Proyecto II UPTP

- Colmenarez S. Luis A.
- Legón F. Robert A.
- Gómez C. Sergio J.
- Medina A. Gabriela N.
- Torrealba E. Albany P.
- Abreu A. José A.

---

## 📜 Licencia y Créditos

Este proyecto se desarrolla bajo la coordinación de la **Universidad Politécnica Territorial de Portuguesa (UPTP)**.

Utiliza como base la plantilla [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) de [PanJiaChen](https://github.com/PanJiaChen), migrada a Vue 3 y adaptada para las necesidades específicas del club.


Consultar archivo [LICENSE](./LICENSE) para más detalles.
