# Database Rules
- Use Prisma only — never write raw SQL
- All DB logic goes in server/src/controllers/ only
- Migration names must be descriptive: init, add_employee_fields, add_block_table
- Never modify dev.db directly — always use migrations
- Always use Prisma transactions for multi-table writes
- Seed file must use realistic Algerian names and data