-- Ensure pgcrypto extension is available for password hashing helpers like gen_salt
create extension if not exists pgcrypto;
