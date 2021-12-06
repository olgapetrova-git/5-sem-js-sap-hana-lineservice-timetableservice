drop table haltestelle_stage;
create table haltestelle_stage (
    hid integer not null primary key,
    bez varchar(200),
    lat varchar(200),
    lng varchar(200)
);

drop table linie_stage;
create table linie_stage (
    lid integer not null primary key,
    bez varchar(200),
    verlauf varchar(1000)
);

drop table haltestelle;
create table haltestelle (
    hid integer not null primary key,
    bez varchar(200),
    lat decimal(13,10) not null,
    lng decimal(13,10) not null,
    pos st_point(4326) validation full
);

drop table linie;
create table linie (
    lid integer not null primary key,
    bez varchar(200)
);

drop table abschnitt;
create table abschnitt (
    lid integer not null,
    nr integer not null,
    sid integer not null,
    richtung varchar(10) not null,
    primary key (lid, nr),
    foreign key (lid) references linie,
    foreign key (sid) references segment
);

drop table segment;
create table segment (
    sid integer not null primary key,
    hid_a integer not null,
    hid_b integer not null,
    laenge_in_meter integer,
    unique (hid_a, hid_b),
    foreign key (hid_a) references haltestelle,
    foreign key (hid_b) references haltestelle
);
