CREATE TABLE `usuarios` (
  `email` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `password` varchar(16) DEFAULT NULL,
  `sexo` char(1) NOT NULL,
  `fecha_nacimiento` varchar(12) DEFAULT NULL,
  `imagen_perfil` varchar(100) DEFAULT NULL,
  `puntos` int(6) DEFAULT '0',
  PRIMARY KEY (`email`)
) 

CREATE TABLE `amigos` (
  `origen` varchar(50) NOT NULL DEFAULT '',
  `destino` varchar(50) NOT NULL DEFAULT '',
  `pendiente` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`origen`,`destino`),
  KEY `destino` (`destino`),
  CONSTRAINT `amigos_ibfk_1` FOREIGN KEY (`origen`) REFERENCES `usuarios` (`email`),
  CONSTRAINT `amigos_ibfk_2` FOREIGN KEY (`destino`) REFERENCES `usuarios` (`email`)
) 