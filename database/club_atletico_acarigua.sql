-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-11-2025 a las 23:03:34
-- Versión del servidor: 10.1.38-MariaDB
-- Versión de PHP: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `club_atletico_acarigua`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `atletas`
--

CREATE TABLE `atletas` (
  `ATLETA_ID` int(11) NOT NULL,
  `NOMBRE` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `APELLIDO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TELEFONO` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DIRECCION` text COLLATE utf8mb4_unicode_ci,
  `FECHA_NACIMIENTO` date NOT NULL,
  `POSICION_DE_JUEGO` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CATEGORIA_ID` int(11) DEFAULT NULL,
  `TUTOR_ID` int(11) DEFAULT NULL,
  `ESTATUS` enum('ACTIVO','INACTIVO','LESIONADO','SUSPENDIDO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `atletas`
--

INSERT INTO `atletas` (`ATLETA_ID`, `NOMBRE`, `APELLIDO`, `TELEFONO`, `DIRECCION`, `FECHA_NACIMIENTO`, `POSICION_DE_JUEGO`, `CATEGORIA_ID`, `TUTOR_ID`, `ESTATUS`, `CREATED_AT`, `UPDATED_AT`) VALUES
(1, 'Elsio', 'Apallido', '04145384801', 'BOsque de camoruco', '1995-01-15', 'Prueba', NULL, NULL, 'ACTIVO', '2025-11-29 23:11:02', '2025-11-29 23:11:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `CATEGORIA_ID` int(11) NOT NULL,
  `NOMBRE_CATEGORIA` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `EDAD_MIN` int(11) NOT NULL,
  `EDAD_MAX` int(11) NOT NULL,
  `ATLETA_ID` int(11) DEFAULT NULL,
  `ENTRENADOR_ID` int(11) DEFAULT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `control_asistencias`
--

CREATE TABLE `control_asistencias` (
  `ASISTENCIA_ID` int(11) NOT NULL,
  `ATLETICA_ID` int(11) NOT NULL,
  `FECHA` date NOT NULL,
  `TIPO_EVENTO` enum('ENTRENAMIENTO','PARTIDO','EVENTO_ESPECIAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ESTATUS` enum('PRESENTE','AUSENTE','JUSTIFICADO','RETARDO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ENTRENADOR_ID` int(11) DEFAULT NULL,
  `OBSERVACIONES` text COLLATE utf8mb4_unicode_ci,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ficha_medica`
--

CREATE TABLE `ficha_medica` (
  `FICHA_ID` int(11) NOT NULL,
  `ATLETA_ID` int(11) NOT NULL,
  `ALERGIAS` text COLLATE utf8mb4_unicode_ci,
  `TIPO_SANGUINEO` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LESION` text COLLATE utf8mb4_unicode_ci,
  `CONDICION_MEDICA` text COLLATE utf8mb4_unicode_ci,
  `OBSERVACION` text COLLATE utf8mb4_unicode_ci,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grafica_de_rendimiento`
--

CREATE TABLE `grafica_de_rendimiento` (
  `GRAFICA_ID` int(11) NOT NULL,
  `ID_ATLETA` int(11) NOT NULL,
  `ID_TEST` int(11) NOT NULL,
  `ID_MEDIDAS` int(11) NOT NULL,
  `FECHA_GENERACION` date NOT NULL,
  `OBSERVACIONES` text COLLATE utf8mb4_unicode_ci,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `implementos_deportivos`
--

CREATE TABLE `implementos_deportivos` (
  `IMPLEMENTO_ID` int(11) NOT NULL,
  `TIPO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CANTIDAD` int(11) NOT NULL DEFAULT '0',
  `ESTATUS` enum('DISPONIBLE','EN_USO','MANTENIMIENTO','DAÑADO') COLLATE utf8mb4_unicode_ci DEFAULT 'DISPONIBLE',
  `UBICACION` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medidas_antropometricas`
--

CREATE TABLE `medidas_antropometricas` (
  `ID_MEDIDAS` int(11) NOT NULL,
  `ID_ATLETA` int(11) NOT NULL,
  `PESO` decimal(5,2) DEFAULT NULL,
  `ALTURA` decimal(5,2) DEFAULT NULL,
  `INDICE_DE_MASA` decimal(5,2) DEFAULT NULL,
  `ENVERGADURA` decimal(5,2) DEFAULT NULL,
  `LARGO_DE_PIERNA` decimal(5,2) DEFAULT NULL,
  `LARGO_DE_TORSO` decimal(5,2) DEFAULT NULL,
  `FECHA_MEDICION` date NOT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `PAGO_ID` int(11) NOT NULL,
  `ATLETA_ID` int(11) NOT NULL,
  `MES_CORRESPONDIENTE` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ESTATUS` enum('PENDIENTE','PAGADO','VENCIDO') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `FECHA_PAGO` date DEFAULT NULL,
  `REF_PAGO` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MONTO` decimal(10,2) NOT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantel`
--

CREATE TABLE `plantel` (
  `PLANTEL_ID` int(11) NOT NULL,
  `NOMBRE` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `APELLIDO` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TELEFONO` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ROL` enum('ENTRENADOR','ASISTENTE','PREPARADOR_FISICO','MEDICO','ADMINISTRATIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `test_de_rendimiento`
--

CREATE TABLE `test_de_rendimiento` (
  `ID_TEST` int(11) NOT NULL,
  `ID_ATLETA` int(11) NOT NULL,
  `TEST_DE_FUERZA` decimal(10,2) DEFAULT NULL,
  `TEST_RESISTENCIA` decimal(10,2) DEFAULT NULL,
  `TEST_VELOCIDAD` decimal(10,2) DEFAULT NULL,
  `TEST_COORDINACION` decimal(10,2) DEFAULT NULL,
  `TEST_DE_REACCION` decimal(10,2) DEFAULT NULL,
  `FECHA_TEST` date NOT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutor`
--

CREATE TABLE `tutor` (
  `TUTOR_ID` int(11) NOT NULL,
  `NOMBRE_COMPLETO` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TELEFONO` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CORREO` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DIRECCION` text COLLATE utf8mb4_unicode_ci,
  `TIPO_RELACION` enum('PADRE','MADRE','TUTOR_LEGAL','OTRO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `USUARIO_ID` int(11) NOT NULL,
  `EMAIL` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PASSWORD` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ROL` enum('ADMIN','ENTRENADOR','USUARIO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ESTATUS` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
  `ULTIMO_ACCESO` datetime DEFAULT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TOKEN` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`USUARIO_ID`, `EMAIL`, `PASSWORD`, `ROL`, `ESTATUS`, `ULTIMO_ACCESO`, `CREATED_AT`, `UPDATED_AT`, `TOKEN`) VALUES
(1, 'test@gmail.com', '123456', 'ADMIN', 'ACTIVO', NULL, '2025-11-29 19:29:31', '2025-11-29 21:55:53', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInJvbCI6IkFETUlOIiwiaWF0IjoxNzY0NDUzMzUzLCJleHAiOjE3NjQ0ODIxNTN9.aGfkUXTeyYAE7rehrzPLiCwNlas9C3TeAz7N4wjmkOo'),
(2, 'alo', 'alo', 'ENTRENADOR', 'ACTIVO', NULL, '2025-11-29 19:38:16', '2025-11-29 19:38:16', NULL),
(5, 'dsadasdad', '1211111', 'ADMIN', 'ACTIVO', NULL, '2025-11-29 19:51:41', '2025-11-29 21:54:19', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJkc2FkYXNkYWQiLCJyb2wiOiJBRE1JTiIsImlhdCI6MTc2NDQ1MzI1OSwiZXhwIjoxNzY0NDgyMDU5fQ.NWFzjWk1cGi-rWOKEi07B2DQGCWmAhdq8joiCVs8gAk');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `atletas`
--
ALTER TABLE `atletas`
  ADD PRIMARY KEY (`ATLETA_ID`),
  ADD KEY `idx_atletas_categoria` (`CATEGORIA_ID`),
  ADD KEY `idx_atletas_tutor` (`TUTOR_ID`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`CATEGORIA_ID`),
  ADD KEY `ENTRENADOR_ID` (`ENTRENADOR_ID`);

--
-- Indices de la tabla `control_asistencias`
--
ALTER TABLE `control_asistencias`
  ADD PRIMARY KEY (`ASISTENCIA_ID`),
  ADD KEY `ENTRENADOR_ID` (`ENTRENADOR_ID`),
  ADD KEY `idx_asistencias_fecha` (`FECHA`),
  ADD KEY `idx_asistencias_atleta` (`ATLETICA_ID`);

--
-- Indices de la tabla `ficha_medica`
--
ALTER TABLE `ficha_medica`
  ADD PRIMARY KEY (`FICHA_ID`),
  ADD KEY `idx_ficha_atleta` (`ATLETA_ID`);

--
-- Indices de la tabla `grafica_de_rendimiento`
--
ALTER TABLE `grafica_de_rendimiento`
  ADD PRIMARY KEY (`GRAFICA_ID`),
  ADD KEY `ID_ATLETA` (`ID_ATLETA`),
  ADD KEY `ID_TEST` (`ID_TEST`),
  ADD KEY `ID_MEDIDAS` (`ID_MEDIDAS`);

--
-- Indices de la tabla `implementos_deportivos`
--
ALTER TABLE `implementos_deportivos`
  ADD PRIMARY KEY (`IMPLEMENTO_ID`);

--
-- Indices de la tabla `medidas_antropometricas`
--
ALTER TABLE `medidas_antropometricas`
  ADD PRIMARY KEY (`ID_MEDIDAS`),
  ADD KEY `idx_medidas_atleta` (`ID_ATLETA`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`PAGO_ID`),
  ADD KEY `idx_pagos_atleta` (`ATLETA_ID`),
  ADD KEY `idx_pagos_estatus` (`ESTATUS`);

--
-- Indices de la tabla `plantel`
--
ALTER TABLE `plantel`
  ADD PRIMARY KEY (`PLANTEL_ID`);

--
-- Indices de la tabla `test_de_rendimiento`
--
ALTER TABLE `test_de_rendimiento`
  ADD PRIMARY KEY (`ID_TEST`),
  ADD KEY `idx_test_atleta` (`ID_ATLETA`);

--
-- Indices de la tabla `tutor`
--
ALTER TABLE `tutor`
  ADD PRIMARY KEY (`TUTOR_ID`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`USUARIO_ID`),
  ADD UNIQUE KEY `EMAIL` (`EMAIL`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `atletas`
--
ALTER TABLE `atletas`
  MODIFY `ATLETA_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `CATEGORIA_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `control_asistencias`
--
ALTER TABLE `control_asistencias`
  MODIFY `ASISTENCIA_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ficha_medica`
--
ALTER TABLE `ficha_medica`
  MODIFY `FICHA_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `grafica_de_rendimiento`
--
ALTER TABLE `grafica_de_rendimiento`
  MODIFY `GRAFICA_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `implementos_deportivos`
--
ALTER TABLE `implementos_deportivos`
  MODIFY `IMPLEMENTO_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medidas_antropometricas`
--
ALTER TABLE `medidas_antropometricas`
  MODIFY `ID_MEDIDAS` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `PAGO_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plantel`
--
ALTER TABLE `plantel`
  MODIFY `PLANTEL_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `test_de_rendimiento`
--
ALTER TABLE `test_de_rendimiento`
  MODIFY `ID_TEST` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tutor`
--
ALTER TABLE `tutor`
  MODIFY `TUTOR_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `USUARIO_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `atletas`
--
ALTER TABLE `atletas`
  ADD CONSTRAINT `atletas_ibfk_1` FOREIGN KEY (`CATEGORIA_ID`) REFERENCES `categoria` (`CATEGORIA_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `atletas_ibfk_2` FOREIGN KEY (`TUTOR_ID`) REFERENCES `tutor` (`TUTOR_ID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`ENTRENADOR_ID`) REFERENCES `plantel` (`PLANTEL_ID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `control_asistencias`
--
ALTER TABLE `control_asistencias`
  ADD CONSTRAINT `control_asistencias_ibfk_1` FOREIGN KEY (`ATLETICA_ID`) REFERENCES `atletas` (`ATLETA_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `control_asistencias_ibfk_2` FOREIGN KEY (`ENTRENADOR_ID`) REFERENCES `plantel` (`PLANTEL_ID`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ficha_medica`
--
ALTER TABLE `ficha_medica`
  ADD CONSTRAINT `ficha_medica_ibfk_1` FOREIGN KEY (`ATLETA_ID`) REFERENCES `atletas` (`ATLETA_ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `grafica_de_rendimiento`
--
ALTER TABLE `grafica_de_rendimiento`
  ADD CONSTRAINT `grafica_de_rendimiento_ibfk_1` FOREIGN KEY (`ID_ATLETA`) REFERENCES `atletas` (`ATLETA_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `grafica_de_rendimiento_ibfk_2` FOREIGN KEY (`ID_TEST`) REFERENCES `test_de_rendimiento` (`ID_TEST`) ON DELETE CASCADE,
  ADD CONSTRAINT `grafica_de_rendimiento_ibfk_3` FOREIGN KEY (`ID_MEDIDAS`) REFERENCES `medidas_antropometricas` (`ID_MEDIDAS`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medidas_antropometricas`
--
ALTER TABLE `medidas_antropometricas`
  ADD CONSTRAINT `medidas_antropometricas_ibfk_1` FOREIGN KEY (`ID_ATLETA`) REFERENCES `atletas` (`ATLETA_ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`ATLETA_ID`) REFERENCES `atletas` (`ATLETA_ID`) ON DELETE CASCADE;

--
-- Filtros para la tabla `test_de_rendimiento`
--
ALTER TABLE `test_de_rendimiento`
  ADD CONSTRAINT `test_de_rendimiento_ibfk_1` FOREIGN KEY (`ID_ATLETA`) REFERENCES `atletas` (`ATLETA_ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
