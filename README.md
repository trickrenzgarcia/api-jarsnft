ganto pala guys pag may dinadagdag pala akong db table at api routes, do this first before running.

```bash
npm i
# and
npx prisma db pull
# and
npx prisma generate

# running server
bun run dev:bun
```

Test REST API [http://localhost:5000](http://localhost:5000) on Postman | Thunder Client | HTTP Client

# routes
GET /user/all - return all users available in db where is_listed
GET /user/:address - return user matched user address
POST /user/create - create new user
PUT /user/update - to update user