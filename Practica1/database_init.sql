

create table amigos(origen varchar(50), 
								destino varchar(50), 
                                pendiente boolean, 
                                primary key (origen,destino), 
                                foreign key (origen) references usuarios(email),
                                foreign key (destino) references usuarios(email));