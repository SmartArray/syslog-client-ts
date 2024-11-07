import { exec } from 'node:child_process';

module.exports = async () => {
  await new Promise((resolve, reject) => {
    exec(
      'docker-compose -f test/integration/docker/docker-compose.yaml down',
      (error: Error) => {
        if (error) return reject(error);
        resolve();
      },
    );
  });
};
