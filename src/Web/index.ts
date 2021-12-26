import express from 'express';
import ejs from 'ejs';
import path from 'path';
import Bot from '../Components/Bot';
import axios from 'axios';

export default function () {
  const app: express.Express = express();

  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .engine('html', ejs.renderFile)
    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, '../../src/Web/views'))
    .use(express.static(path.join(__dirname, '../../src/Web/public')));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST');

    next();
  });

  app.get('/', (_req, res) => {
    res.render('index');
  });

  app.get('/join', async (_req, res) => {
    const api = await axios.get('https://discord.com/api/guilds/755774191613247568/widget.json');
    const joinLink = api.data.instant_invite;

    res.redirect(joinLink);
  });

  app.get('/v/:userId', (req, res) => {
    if (!req.params.userId) {
      return res.status(404).render('404');
    }

    const member = Bot.client.guilds.cache
      .get('755774191613247568')
      ?.members.fetch(String(req.params.userId));

    if (!member) {
      return res.status(404).render('404');
    }

    res.render('verify', { id: req.params.userId, ok: false });
  });

  app.post('/v/:userId', async (req, res) => {
    if (!req.body || !req.body['g-recaptcha-response'] || !req.params.userId) {
      return res.status(404).render('404');
    }

    const api = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${req.body['g-recaptcha-response']}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!api.data.success) {
      return res.status(404).render('404');
    }

    const member = Bot.client.guilds.cache
      .get('755774191613247568')
      ?.members.cache.get(String(req.body.id));

    if (!member) {
      return res.status(404).render('404');
    }

    await member.roles.add('759556295770243093').catch(() => {});

    res.render('verify', { id: req.params.userId, ok: true });
  });

  app.get('*', (_req, res) => {
    res.status(404).render('404');
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log('Web started.');
  });
}