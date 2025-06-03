export const logger = (method, url) => {
  console.log(new Date().toISOString(), method, url);
}