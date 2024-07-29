#FootballAPI

## API de Juego de Cartas de Fútbol 

## Descripción

Esta API está diseñada para gestionar un juego de cartas inspirado en Yu-Gi-Oh!, pero basado en el fútbol. Los jugadores del juego son usuarios registrados que pueden crear, actualizar y gestionar sus mazos de cartas, así como participar en salas de juego y enfrentarse a otros jugadores.

## Funcionalidades

### Gestión de Usuarios
La API permite la creación, actualización, eliminación y autenticación de usuarios. Los usuarios tienen roles y permisos asignados que determinan sus capacidades dentro del sistema.

### Roles y Permisos
Los roles y permisos definen el nivel de acceso y las acciones que los usuarios pueden realizar. Existen roles predeterminados como "admin" y "user", y se pueden agregar más roles según sea necesario.

### Cartas y Mazos
Los usuarios pueden crear, actualizar y gestionar cartas de fútbol, que representan a futbolistas con diferentes habilidades y estadísticas. También pueden organizar estas cartas en mazos, los cuales utilizan para participar en partidas.

### Salas de Juego
Los usuarios pueden crear y unirse a salas de juego. Una sala puede ser pública o privada, y solo admite dos jugadores: el creador de la sala y un oponente. Una vez que ambos jugadores están en la sala, pueden iniciar una partida.

### Autenticación y Seguridad
La API utiliza JSON Web Tokens (JWT) para la autenticación y manejo de sesiones. Las contraseñas de los usuarios se almacenan de manera segura usando bcrypt para el hashing.

### Futuras Implementaciones
- **Historias de Usuarios:** Se planea agregar la funcionalidad para que los usuarios puedan crear y compartir historias de sus partidas.
- **Monedas Virtuales:** Los usuarios podrán ganar y gastar monedas virtuales para comprar nuevas cartas.
- **Invitaciones de Partida:** Se implementará la capacidad para que los usuarios envíen y reciban invitaciones para jugar partidas contra otros usuarios.

## Tecnologías Utilizadas
- **Node.js y Express:** Para el desarrollo del backend.
- **Prisma:** Como ORM para la interacción con la base de datos.
- **Joi:** Para la validación de esquemas de datos.
- **Bcrypt:** Para la encriptación de contraseñas.
- **JWT:** Para la autenticación de usuarios.
- **HTTP Status Codes:** Para manejar respuestas HTTP de manera estándar.
- **PostgreSQL:** Como base de datos.

Esta API está diseñada para ser escalable y segura, con un enfoque en la experiencia del usuario y la flexibilidad en la gestión de datos y roles.
