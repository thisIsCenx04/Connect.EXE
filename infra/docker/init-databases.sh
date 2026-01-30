#!/bin/bash
set -e

# Create databases for each microservice
echo "Creating databases for microservices..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases
    CREATE DATABASE auth_db;
    CREATE DATABASE user_db;
    CREATE DATABASE project_db;
    CREATE DATABASE forum_db;
    CREATE DATABASE halloffame_db;
    CREATE DATABASE ai_db;
    CREATE DATABASE payment_db;
    CREATE DATABASE admin_db;
    CREATE DATABASE chat_db;

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE user_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE project_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE forum_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE halloffame_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE ai_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE payment_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE admin_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE chat_db TO $POSTGRES_USER;
EOSQL

echo "Databases created successfully!"

# Run migrations for each database
echo "Running migrations..."

# Auth DB
if [ -f /docker-entrypoint-initdb.d/migrations/auth_db.sql ]; then
    echo "Running auth_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "auth_db" -f /docker-entrypoint-initdb.d/migrations/auth_db.sql
fi

# User DB
if [ -f /docker-entrypoint-initdb.d/migrations/user_db.sql ]; then
    echo "Running user_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "user_db" -f /docker-entrypoint-initdb.d/migrations/user_db.sql
fi

# Project DB
if [ -f /docker-entrypoint-initdb.d/migrations/project_db.sql ]; then
    echo "Running project_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "project_db" -f /docker-entrypoint-initdb.d/migrations/project_db.sql
fi

# Forum DB
if [ -f /docker-entrypoint-initdb.d/migrations/forum_db.sql ]; then
    echo "Running forum_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "forum_db" -f /docker-entrypoint-initdb.d/migrations/forum_db.sql
fi

# Hall of Fame DB
if [ -f /docker-entrypoint-initdb.d/migrations/halloffame_db.sql ]; then
    echo "Running halloffame_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "halloffame_db" -f /docker-entrypoint-initdb.d/migrations/halloffame_db.sql
fi

# AI DB
if [ -f /docker-entrypoint-initdb.d/migrations/ai_db.sql ]; then
    echo "Running ai_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "ai_db" -f /docker-entrypoint-initdb.d/migrations/ai_db.sql
fi

# Payment DB
if [ -f /docker-entrypoint-initdb.d/migrations/payment_db.sql ]; then
    echo "Running payment_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "payment_db" -f /docker-entrypoint-initdb.d/migrations/payment_db.sql
fi

# Admin DB
if [ -f /docker-entrypoint-initdb.d/migrations/admin_db.sql ]; then
    echo "Running admin_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "admin_db" -f /docker-entrypoint-initdb.d/migrations/admin_db.sql
fi

# Chat DB
if [ -f /docker-entrypoint-initdb.d/migrations/chat_db.sql ]; then
    echo "Running chat_db migration..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "chat_db" -f /docker-entrypoint-initdb.d/migrations/chat_db.sql
fi

echo "All migrations completed successfully!"
