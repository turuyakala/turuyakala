-- Admin kullanıcısı oluşturmak için SQL
-- Not: Önce bir kullanıcı kayıt olmalı, sonra bu script ile admin yapılmalı

-- Kullanıcıyı admin yap (email adresini kendi admin email'iniz ile değiştirin)
UPDATE User SET role = 'admin' WHERE email = 'admin@lastminutetour.com';

-- Kullanıcının admin olduğunu kontrol et
SELECT id, name, email, role FROM User WHERE email = 'admin@lastminutetour.com';

