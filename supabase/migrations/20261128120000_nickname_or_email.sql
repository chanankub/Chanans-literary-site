-- A reader may skip the nickname. The email is stored in its place,
-- so comments keep working and other readers see the address.

alter table public.profiles drop constraint if exists profiles_nickname_len;

alter table public.profiles
  add constraint profiles_nickname_len check (
    char_length(btrim(nickname)) between 1 and 254
  );
