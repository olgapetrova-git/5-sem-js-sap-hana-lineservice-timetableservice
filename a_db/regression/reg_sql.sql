drop view reg;
create view reg as select id, gewicht, laenge from adbkt.reg;

select * from reg;

create local temporary column table 
  #tbl_parameter(
    param_name varchar(256), 
    int_value integer, 
    double_value double, 
    string_value varchar(1000)
  );

insert into #tbl_parameter values ('THREAD_RATIO',NULL,0.0,NULL);

call _sys_afl.pal_linear_regression(
  reg,"#TBL_PARAMETER", ?, ?, ?, ?, ?);

select * from #tbl_parameter;
drop table #tbl_parameter;