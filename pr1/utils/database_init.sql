CREATE TABLE `usuarios` (
  `email` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `password` varchar(16) DEFAULT NULL,
  `sexo` char(1) NOT NULL,
  `fecha_nacimiento` varchar(12) DEFAULT NULL,
  `imagen_perfil` varchar(100) DEFAULT NULL,
  `puntos` int(6) DEFAULT '0',
  PRIMARY KEY (`email`)
);

CREATE TABLE `amigos` (
  `origen` varchar(50) NOT NULL DEFAULT '',
  `destino` varchar(50) NOT NULL DEFAULT '',
  `pendiente` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`origen`,`destino`),
  KEY `amigos_ibfk_2` (`destino`),
  CONSTRAINT `amigos_ibfk_2` FOREIGN KEY (`destino`) REFERENCES `usuarios` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `amigos_ibfk_1` FOREIGN KEY (`origen`) REFERENCES `usuarios` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `preguntas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `texto` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `respuestas` (
  `idPregunta` int(11) NOT NULL,
  `idRespuesta` int(11) NOT NULL,
  `texto` varchar(200) NOT NULL,
  PRIMARY KEY (`idPregunta`,`idRespuesta`),
  CONSTRAINT `respuestas_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `respuestas_usuario` (
  `email` varchar(50) NOT NULL,
  `idPregunta` int(11) NOT NULL,
  `idRespuestaElegida` int(11) NOT NULL,
  PRIMARY KEY (`email`,`idPregunta`),
  KEY `respuestas_usuario_ibfk_2` (`idPregunta`,`idRespuestaElegida`),
  CONSTRAINT `respuestas_usuario_ibfk_2` FOREIGN KEY (`idPregunta`, `idRespuestaElegida`) REFERENCES `respuestas` (`idPregunta`, `idRespuesta`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `respuestas_usuario_ibfk_1` FOREIGN KEY (`email`) REFERENCES `usuarios` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `respuestas_adivinar` (
  `email` varchar(50) NOT NULL,
  `emailAmigo` varchar(50) NOT NULL,
  `idPregunta` int(11) NOT NULL,
  `acertada` tinyint(1) NOT NULL,
  PRIMARY KEY (`email`,`emailAmigo`,`idPregunta`),
  KEY `respuestas_adivinar_ibfk_2` (`emailAmigo`),
  KEY `respuestas_adivinar_ibfk_3` (`idPregunta`),
  CONSTRAINT `respuestas_adivinar_ibfk_1` FOREIGN KEY (`email`) REFERENCES `usuarios` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `respuestas_adivinar_ibfk_2` FOREIGN KEY (`emailAmigo`) REFERENCES `usuarios` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `respuestas_adivinar_ibfk_3` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);