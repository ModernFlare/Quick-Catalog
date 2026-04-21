INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'test@example.com',
  crypt('мой_пароль', gen_salt('bf')),  -- Хеширование
  NOW()
);
UPDATE auth.users 
SET encrypted_password = crypt('новый_пароль', gen_salt('bf'))
WHERE email = 'test@example.com';


-- 1. Откройте SQL Editor
-- 2. Вставьте запрос:
SELECT email, encrypted_password FROM auth.users WHERE email = 'admin@gmail.com';

-- 3. Нажмите Run
-- 4. Если видите $2a$... — пароль записан правильно ✅


@QuAhx(:51;rtg$