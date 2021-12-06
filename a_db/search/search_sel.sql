
select * from doc;

select snippets(title), snippets(content)
from doc 
where contains(*,'trump OR kramp');
