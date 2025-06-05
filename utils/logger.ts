export const logger = (method, url) => {
  console.log(`%c ${new Date().toISOString()}, ${method}, ${url}`, 'color: green');
}