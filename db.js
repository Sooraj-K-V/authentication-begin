import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
    user: "postgres",
    database: "test",
    password: "1234",
    port: 5433,
    host: "localhost"
})

export default pool;