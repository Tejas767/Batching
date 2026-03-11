alter table mix_designs add column if not exists user_id text;
update mix_designs set user_id = 'legacy' where user_id is null;
alter table mix_designs alter column user_id set not null;
alter table mix_designs drop constraint if exists mix_designs_pkey;
alter table mix_designs add primary key (user_id, grade);

alter table entry_current add column if not exists user_id text;
update entry_current set user_id = 'legacy' where user_id is null;
alter table entry_current alter column user_id set not null;
alter table entry_current drop constraint if exists entry_current_pkey;
alter table entry_current add primary key (user_id, id);

alter table batch_history add column if not exists user_id text;
update batch_history set user_id = 'legacy' where user_id is null;
alter table batch_history alter column user_id set not null;
