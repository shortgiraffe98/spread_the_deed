import pg from "pg";
import 'dotenv/config';



const { Pool } = pg;

const LOCAL_HOST = {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "1358@Qaz",
    database: "spread_the_deed"
};

export const client = new pg.Client(LOCAL_HOST);

client.connect((err) => {
    if (err) throw err;
    console.log("CLIENT connect to postgrsql successfully");
})



