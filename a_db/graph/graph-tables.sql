drop table knoten;

create table knoten (
    kid integer not null primary key,
    bez varchar(10) not null
);

drop table verbindung;

create table verbindung (
    vid integer not null,
    pfad varchar(10) not null,
    nr integer not null,
    ka integer not null,
    kb integer not null,
    richtung varchar(10) not null,
    dauer integer,
    primary key (vid),
    foreign key (ka) references knoten,
    foreign key (kb) references knoten
);

delete from knoten;

insert into knoten values (101, 'K101');
insert into knoten values (102, 'K102');
insert into knoten values (103, 'K103');
insert into knoten values (104, 'K104');
insert into knoten values (105, 'K105');
insert into knoten values (106, 'K106');
insert into knoten values (107, 'K107');
insert into knoten values (108, 'K108');
insert into knoten values (109, 'K109');
insert into knoten values (110, 'K110');
insert into knoten values (111, 'K111');

delete from verbindung;

insert into verbindung values (1001, 'p1', 1, 101, 102, 'ab', 10);
insert into verbindung values (1002, 'p1', 2, 102, 103, 'ab', 10);
insert into verbindung values (1003, 'p1', 3, 103, 104, 'ab', 10);
insert into verbindung values (1004, 'p1', 4, 104, 105, 'ab', 10);
insert into verbindung values (1005, 'p1', 5, 105, 106, 'ab', 10);
insert into verbindung values (1006, 'p1', 6, 106, 107, 'ab', 10);

insert into verbindung values (1007, 'p2', 1, 101, 102, 'ab', 10);
insert into verbindung values (1008, 'p2', 2, 102, 110, 'ab', 2);
insert into verbindung values (1009, 'p2', 3, 110, 111, 'ab', 2);
insert into verbindung values (1010, 'p2', 4, 111, 103, 'ab', 2);
insert into verbindung values (1011, 'p2', 5, 103, 104, 'ab', 10);

insert into verbindung values (1012, 'p3', 1, 102, 108, 'ab', 10);
insert into verbindung values (1013, 'p3', 2, 108, 109, 'ab', 30);
insert into verbindung values (1014, 'p3', 3, 109, 106, 'ab', 10);
insert into verbindung values (1015, 'p3', 4, 106, 107, 'ab', 10);