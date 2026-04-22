# API Rules
- All routes prefixed with /api
- Use proper HTTP status codes: 200, 201, 400, 401, 404, 500
- Every route must have try/catch
- Error responses format: { error: "message" }
- Success responses format: { data: {...} } or { data: [...] }
- Validate all inputs before hitting the database
- PIN verification must use bcryptjs.compare — never plain text comparison
- File upload routes must validate file type and size