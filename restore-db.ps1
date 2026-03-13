# esnaf-core Production - DB Restore Script
# Bu scripti docker-compose.prod.yml'i başlattıktan SONRA çalıştır

# 1. Backup dosyasını container'a kopyala
docker cp {PATH} esnaf-postgres-prod:/backup.sql
# 2. Restore et
docker exec -i esnaf-postgres-prod psql -U esnaf_user -d esnaf_db -f /backup.sql

# 3. Doğrula
docker exec -it esnaf-postgres-prod psql -U esnaf_user -d esnaf_db -c "\dt"
