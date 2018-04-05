import { default as app } from './app';

const server = app.listen(app.get('port'), (err: Error) => {
  console.log('Application is running at https://localhost:%d on %s mode.',
    app.get('port'),
    app.get('env'));
  console.log('Press CTRL + C anytime to stop...')
});
export default server;
