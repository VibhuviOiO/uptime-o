

# GET THE TOKEN 

```bash
curl -X POST http://localhost:8080/api/authenticate -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'
```

# Apply the above token in the culr call
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjAzNTkxMCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTQ5NTEwLCJ1c2VySWQiOjF9.aLwlfew277B1HdJhTKc_B5ZAQDMA8ufdDLfQHvuv4H85hEts8stA2SezUF1qgFhls676lL0g2yAM5sNG4H1p1g" http://localhost:8080/api/http-heartbeats/aggregated?range=5min
```