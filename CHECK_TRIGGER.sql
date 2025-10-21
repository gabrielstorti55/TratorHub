-- Verificar se o trigger está ativo
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar se a função existe
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Testar o trigger manualmente (se necessário)
-- Substitua 'seu-email@teste.com' por um email de teste
/*
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Simular criação de usuário
  test_user_id := gen_random_uuid();
  
  INSERT INTO public.profiles (
    user_id,
    full_name,
    cpf_cnpj,
    phone,
    address,
    city,
    state,
    postal_code
  ) VALUES (
    test_user_id,
    'Teste Manual',
    '12345678901',
    '11999999999',
    '',
    '',
    '',
    ''
  );
  
  RAISE NOTICE 'Perfil de teste criado com sucesso para user_id: %', test_user_id;
END $$;
*/
