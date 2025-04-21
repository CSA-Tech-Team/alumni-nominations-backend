docker run --name postgres-container -e POSTGRES_USER=alumni -e POSTGRES_PASSWORD=secpass -e POSTGRES_DB=alumniregistration -p 5432:5432 -d postgres

docker run --env-file .env -p 3000:3000 nestjs-backend
