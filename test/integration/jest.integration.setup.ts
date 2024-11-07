import { exec } from 'node:child_process';

module.exports = async () => {
  await new Promise((resolve, reject) => {
    exec(
      'docker-compose -f test/integration/docker/docker-compose.yaml up -d --build',
      (error: Error) => {
        if (error) return reject(error);
        // Wait for the service to be ready, ideally we should choose telnet to test it (in case of tcp)
        setTimeout(resolve, 5000);
      },
    );
  });
};
