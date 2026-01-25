import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'github_explorer',
  password: 'Ashly3818', 
  port: 5432,
});

export default pool;