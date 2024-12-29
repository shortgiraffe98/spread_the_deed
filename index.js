import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from "express";
import 'dotenv/config';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';

import cors from "cors";
import db from "./models/index.cjs";
import { resolvers } from './graphql/resolvers.js';

import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import context from './contexts/index.js';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const typeDefs = readFileSync(join(__dirname, 'graphql', 'schema.graphql'), 'utf-8');

const app = express();
const port = 8800;
app.use(cors({origin: ["http://127.0.0.1:5500", "https://donation-campaigns-nab.vercel.app", "https://studio.apollographql.com", "http://localhost:3000"], credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.get("/home", (req, res) => {
  res.send({ message: "HELLO API WORKS" });
});
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
})

const serverCleanup = useServer({ schema: makeExecutableSchema({ typeDefs, resolvers }) }, wsServer);

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
  
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
});

await apolloServer.start();


app.use("/graphql", expressMiddleware(apolloServer, { context }));

db.sequelize.sync().then((req) => {
    httpServer.listen(port, () => {
        console.log("server running - port " + port);
    })
})
