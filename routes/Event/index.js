const express = require('express');
const Router = express.Router();
const { session, driver } = require('../../config/db/neo4j');

//Rutas
Router.post('/', (req, res) => {
  session
    .run(
      `MATCH (o:NGO) WHERE id(o)=${req.body.ngo_id} CREATE (o)-[r:ORGANIZES]->(e:Event {name:$name, capacity:$capacity, p1:$p1, p2:$p2, p3:$p3, image:$imageUrl, organizer_id:$organizer_id}) RETURN e;`,
      {
        name: req.body.name,
        capacity: req.body.capacity,
        p1: req.body.p1,
        p2: req.body.p2,
        p3: req.body.p3,
        imageUrl: req.body.imageUrl,
        organizer_id: req.body.ngo_id
      }
    )
    .then(result => {
      driver.close();
      res.json(result.records[0].get(0));
    })
    .catch(e => {
      console.log(e);
      res
        .status(500)
        .json(e)
        .end();
    });
});

Router.get('/', (req, res) => {
  session
    .run('MATCH (e:Event) RETURN e LIMIT 30')
    .then(result => {
      driver.close();
      payload = [];
      result.records.forEach(r => {
        console.log(r);
        payload.push(r.get(0));
      });
      res.json({ payload });
    })
    .catch(e => {
      console.log(e);
      res
        .status(500)
        .json(e)
        .end();
    });
});

Router.get('/:id', (req, res) => {
  payload = {};
  session
    .run(`MATCH (e:Event),(o:NGO) WHERE id(e)=${req.params.id} RETURN e;`)
    .then(result => {
      driver.close();
      payload = result.records[0].get(0);
      res.json({ payload });
    })
    .catch(e => {
      console.log(e);
      res
        .status(500)
        .json(e)
        .end();
    });
});

Router.get('/:id/participants', (req, res) => {
  payload = {};
  session
    .run(
      `MATCH (e:Event)<-[r:PARTICIPATES]-(u:User) WHERE id(e)=${req.params.id} RETURN id(u);`
    )
    .then(result => {
      driver.close();
      payload = [];
      result.records.forEach(r => {
        payload.push(r.get(0));
      });
      res.json({ payload });
    })
    .catch(e => {
      console.log(e);
      res
        .status(500)
        .json(e)
        .end();
    });
});

module.exports = Router;
