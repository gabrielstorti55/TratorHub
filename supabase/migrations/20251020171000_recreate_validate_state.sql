-- Recreate validate_state helper to avoid missing dependency errors during signup triggers
create or replace function public.validate_state(state text)
returns boolean
language plpgsql
as $$
begin
  if state is null or state = '' then
    return false;
  end if;

  return upper(state) = any(array[
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]);
end;
$$;
